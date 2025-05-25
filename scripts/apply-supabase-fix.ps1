# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Database connection parameters - these will be set from environment variables
$password = $env:SUPABASE_DB_PASSWORD
$host = "db.acamzklfzjpjetiakybr.supabase.co"  # Your Supabase host
$port = "5432"  # Default Postgres port
$database = "postgres"  # Default database name
$user = "postgres"  # Default superuser

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

Write-Host "Applying database fixes to Supabase..."

# Run the SQL commands
$sqlCommands = @"
-- Temporarily disable the foreign key constraint
ALTER TABLE scan_requests DROP CONSTRAINT IF EXISTS fk_patient;

-- Change patient_id column type from UUID to TEXT
ALTER TABLE scan_requests 
    ALTER COLUMN patient_id TYPE TEXT,
    ALTER COLUMN patient_id SET NOT NULL;

-- Update the foreign key constraint to reference auth.users with TEXT id
ALTER TABLE scan_requests 
    ADD CONSTRAINT fk_patient 
    FOREIGN KEY (patient_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
"@

# Save SQL commands to a temporary file
$tempFile = Join-Path $scriptPath "temp_fix.sql"
$sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8

# Execute the SQL file
psql -h $host -p $port -d $database -U $user -f $tempFile

# Clean up
Remove-Item $tempFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully updated patient_id column type in Supabase"
} else {
    Write-Host "Error updating patient_id column type in Supabase"
    exit 1
}
