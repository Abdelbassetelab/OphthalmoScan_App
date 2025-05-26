# Apply updated scan request policies to allow doctors to view all scan requests

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

if (-not $envLoaded) {
    Write-Host "No environment file found. Please create a .env file with your Supabase credentials." -ForegroundColor Red
    exit 1
}

# Get Supabase URL and API Key from environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Supabase URL or service role key not found in environment variables." -ForegroundColor Red
    Write-Host "Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file." -ForegroundColor Red
    exit 1
}

Write-Host "Applying updated scan request policies to Supabase..." -ForegroundColor Cyan

# Get the SQL script
$sqlScript = Get-Content -Path (Join-Path $PSScriptRoot "update-doctor-scan-request-policies.sql") -Raw

# Apply the SQL script to Supabase using REST API
try {
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=minimal"
    }

    $body = @{
        "query" = $sqlScript
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/sql" -Method Post -Headers $headers -Body $body
    
    Write-Host "Successfully updated scan request policies!" -ForegroundColor Green
    Write-Host "Doctors should now be able to view all scan requests." -ForegroundColor Green
} catch {
    Write-Host "Error applying SQL script to Supabase:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
