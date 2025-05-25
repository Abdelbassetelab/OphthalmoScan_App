$env:PGPASSWORD = $env:SUPABASE_DB_PASSWORD
$Host = $env:SUPABASE_DB_HOST
$Port = $env:SUPABASE_DB_PORT
$Database = $env:SUPABASE_DB_NAME
$User = $env:SUPABASE_DB_USER

# Path to the SQL file
$SqlFile = ".\scripts\fix-patient-id-type.sql"

# Execute the SQL file
psql -h $Host -p $Port -d $Database -U $User -f $SqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully updated patient_id column type"
} else {
    Write-Host "Error updating patient_id column type"
    exit 1
}
