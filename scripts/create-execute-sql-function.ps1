# Script to create the execute_sql function in Supabase

Write-Host "Creating execute_sql function in Supabase" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Get Supabase credentials from user input
$supabaseUrl = Read-Host "Enter your Supabase URL (e.g., https://yourproject.supabase.co)"
$supabaseKey = Read-Host "Enter your Supabase service role key"

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Error: Supabase URL and service role key are required" -ForegroundColor Red
    exit 1
}

# SQL to create the execute_sql function
$sql = @"
-- Create a helper function for raw SQL execution
CREATE OR REPLACE FUNCTION execute_sql(sql_query text) RETURNS jsonb AS `$`$
DECLARE
  result jsonb;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
`$`$ LANGUAGE plpgsql SECURITY DEFINER;
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
    Write-Host "Function created successfully!" -ForegroundColor Green
    Write-Host "You can now use the 'execute_sql' function in your application" -ForegroundColor Green
} catch {
    Write-Host "Error creating function: $_" -ForegroundColor Red
    
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
