# Get the directory of the current script
$scriptPath = $PSScriptRoot

# Load environment variables from .env.local file
$envPath = Join-Path $scriptPath "../.env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Get Supabase URL and anon key from environment variables
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseServiceKey) {
    Write-Error "Missing Supabase environment variables"
    exit 1
}

# Get the SQL file path
$sqlFilePath = Join-Path $scriptPath "scan-requests-schema.sql"
$sqlContent = Get-Content $sqlFilePath -Raw

# Execute the SQL using psql (make sure you have psql installed)
$env:PGPASSWORD = $supabaseServiceKey
$dbUrl = "$supabaseUrl/rest/v1"

# Replace this with your actual database connection details from Supabase
$dbHost = $supabaseUrl -replace "https?://", ""
$dbPort = "5432" # Default Postgres port
$dbName = "postgres"
$dbUser = "postgres"

psql -h $dbHost -p $dbPort -d $dbName -U $dbUser -f $sqlFilePath