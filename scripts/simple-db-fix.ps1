# Simple direct fix for scan_requests table
# This script uses manual input for credentials

Write-Host "Direct SQL fix for scan_requests table" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Get Supabase credentials from user input
$supabaseUrl = Read-Host "Enter your Supabase URL (e.g., https://yourproject.supabase.co)"
$supabaseKey = Read-Host "Enter your Supabase service role key"

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Error: Supabase URL and service role key are required" -ForegroundColor Red
    exit 1
}

# Simple SQL to fix the patient_id constraint
$sql = @"
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

# Construct the API URL for executing SQL
$sqlEndpoint = "$supabaseUrl/rest/v1/sql"

# Set up headers for the API request
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

# Execute the SQL
try {
    $body = @{
        "query" = $sql
    } | ConvertTo-Json
    
    Write-Host "Sending request to Supabase..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $sqlEndpoint -Method POST -Headers $headers -Body $body
    Write-Host "SQL executed successfully!" -ForegroundColor Green
    Write-Host "The patient_id column should now be nullable" -ForegroundColor Green
} catch {
    Write-Host "Error executing SQL: $_" -ForegroundColor Red
    
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

Write-Host "`nScript execution completed!" -ForegroundColor Green
Write-Host "You should now be able to create scan requests with clerk_user_id" -ForegroundColor Green
