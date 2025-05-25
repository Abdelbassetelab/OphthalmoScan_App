# Run this script to fix the scan_requests table foreign key constraints

# Function to load environment variables from file
function Load-EnvFile {
    param (
        [string]$filePath
    )
    
    if (Test-Path $filePath) {
        Write-Host "Loading environment variables from $filePath" -ForegroundColor Green
        $envVars = Get-Content $filePath | Where-Object { $_ -match '^\s*([\w.-]+)\s*=\s*(.*)?\s*$' }
        
        foreach ($line in $envVars) {
            if ($line -match '^\s*([\w.-]+)\s*=\s*(.*)?\s*$') {
                $name = $matches[1]
                $value = $matches[2]
                # Remove quotes if present
                if ($value -match '^[''"](.*)[''"]\s*$') {
                    $value = $matches[1]
                }
                # Set environment variable
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "Set $name environment variable" -ForegroundColor DarkGray
            }
        }
        return $true
    } else {
        Write-Host "Environment file not found: $filePath" -ForegroundColor Yellow
        return $false
    }
}

# Try to load environment variables from various files
$envLoaded = $false
$projectRoot = Split-Path -Parent $PSScriptRoot

# Try different env file locations
$envFiles = @(
    (Join-Path $projectRoot ".env"),
    (Join-Path $projectRoot ".env.local"),
    (Join-Path $projectRoot ".env.development"),
    (Join-Path $projectRoot ".env.development.local")
)

foreach ($file in $envFiles) {
    if (Load-EnvFile $file) {
        $envLoaded = $true
        break
    }
}

# Manual input if env files not found
if (-not $envLoaded) {
    Write-Host "No environment files found. Please enter your Supabase credentials manually:" -ForegroundColor Yellow
    
    $env:NEXT_PUBLIC_SUPABASE_URL = Read-Host "Enter your Supabase project URL (e.g., https://yourproject.supabase.co)"
    $env:SUPABASE_SERVICE_KEY = Read-Host "Enter your Supabase service role key"
    
    if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:SUPABASE_SERVICE_KEY) {
        Write-Host "Error: Supabase URL and service key are required" -ForegroundColor Red
        exit 1
    }
}

# Set Supabase URL and key from environment variables
$env:SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$env:SUPABASE_KEY = $env:SUPABASE_SERVICE_KEY -or $env:SUPABASE_SERVICE_ROLE_KEY

# Validate required variables
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_KEY) {
    Write-Host "Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY not set" -ForegroundColor Red
    Write-Host "Please set these environment variables before running this script" -ForegroundColor Red
    exit 1
}

Write-Host "Fixing scan_requests table foreign key constraints..." -ForegroundColor Green
Write-Host "Using Supabase URL: $($env:SUPABASE_URL)" -ForegroundColor Green

# Path to the SQL file
$sqlFilePath = Join-Path $PSScriptRoot "fix-scan-requests-foreign-key.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFilePath)) {
    Write-Host "Error: SQL file not found: $sqlFilePath" -ForegroundColor Red
    exit 1
}

# Read the SQL file content
$sqlContent = Get-Content -Path $sqlFilePath -Raw -ErrorAction Stop
Write-Host "Successfully read SQL file: $sqlFilePath" -ForegroundColor Green

# Option 1: Direct execution with SQL statements
$simpleSQL = @"
-- Make patient_id nullable if it exists and is not null
DO `$`$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'scan_requests' 
        AND column_name = 'patient_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE scan_requests ALTER COLUMN patient_id DROP NOT NULL;
        RAISE NOTICE 'Made patient_id nullable';
    END IF;
    
    -- Add clerk_user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'scan_requests'
        AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE scan_requests ADD COLUMN clerk_user_id TEXT;
        RAISE NOTICE 'Added clerk_user_id column';
    END IF;
END
`$`$;
"@

Write-Host "Executing simplified SQL..." -ForegroundColor Yellow

# Construct the API URL for executing SQL
$sqlEndpoint = "$($env:SUPABASE_URL)/rest/v1/sql"

# Set up headers for the API request
$headers = @{
    "apikey" = $env:SUPABASE_KEY
    "Authorization" = "Bearer $($env:SUPABASE_KEY)"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

# Execute the simple SQL first
try {
    $simpleBody = @{
        "query" = $simpleSQL
    } | ConvertTo-Json
    
    Write-Host "Sending request to: $sqlEndpoint" -ForegroundColor DarkGray
    $response = Invoke-RestMethod -Uri $sqlEndpoint -Method POST -Headers $headers -Body $simpleBody
    Write-Host "Simple SQL executed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error executing simple SQL: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            $responseBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseBody)
            $responseContent = $reader.ReadToEnd()
            Write-Host "Response content: $responseContent" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response details" -ForegroundColor Red
        }
    }
}

# Execute the full SQL if simple SQL succeeded
if ($?) {
    try {
        $fullBody = @{
            "query" = $sqlContent
        } | ConvertTo-Json
        
        Write-Host "Executing full SQL script..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $sqlEndpoint -Method POST -Headers $headers -Body $fullBody
        Write-Host "Full SQL script executed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error executing full SQL script: $_" -ForegroundColor Yellow
        Write-Host "Continuing with individual statements..." -ForegroundColor Yellow
        
        # If full SQL fails, try executing statement by statement
        $statements = $sqlContent -split ";" | Where-Object { $_.Trim() -ne "" }
        
        foreach ($statement in $statements) {
            try {
                $statementBody = @{
                    "query" = "$statement;"
                } | ConvertTo-Json
                
                $statementPreview = $statement.Substring(0, [Math]::Min(50, $statement.Length)).Trim()
                Write-Host "Executing: $statementPreview..." -ForegroundColor DarkGray
                
                $response = Invoke-RestMethod -Uri $sqlEndpoint -Method POST -Headers $headers -Body $statementBody
                Write-Host "Statement executed successfully" -ForegroundColor Green
            } catch {
                Write-Host "Error executing statement: $_" -ForegroundColor Red
                # Continue with next statement
            }
        }
    }
}

Write-Host "`nDatabase update completed!" -ForegroundColor Green
Write-Host "You should now be able to create scan requests with clerk_user_id" -ForegroundColor Green
Write-Host "If you still encounter issues, please check the server logs for more details" -ForegroundColor Yellow
