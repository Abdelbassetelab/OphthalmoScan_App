$env:SUPABASE_PROJECT_ID = "your-project-id"
$env:SUPABASE_DB_PASSWORD = "your-db-password"

Write-Host "Applying updated scan requests schema..." -ForegroundColor Green

# Read the SQL file
$sqlContent = Get-Content -Path "update-scan-requests-schema.sql" -Raw

# Execute the SQL using psql
$connectionString = "postgresql://postgres:$env:SUPABASE_DB_PASSWORD@db.$env:SUPABASE_PROJECT_ID.supabase.co:5432/postgres"
$sqlContent | psql $connectionString

Write-Host "Schema update completed!" -ForegroundColor Green
