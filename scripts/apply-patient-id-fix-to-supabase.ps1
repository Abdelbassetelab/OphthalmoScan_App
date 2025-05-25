# PowerShell script to apply patient_id fix to Supabase
Write-Host "Applying patient_id type fix to scan_requests table..." -ForegroundColor Green

# Get environment variables
$env:PGPASSWORD = $env:SUPABASE_DB_PASSWORD
$Host = $env:SUPABASE_DB_HOST
$Port = $env:SUPABASE_DB_PORT
$Database = $env:SUPABASE_DB_NAME
$User = $env:SUPABASE_DB_USER

# SQL commands as a here-string
$sql = @"
-- Temporarily disable the foreign key constraint
DO `$`$ 
BEGIN
    ALTER TABLE scan_requests DROP CONSTRAINT IF EXISTS fk_patient;
    RAISE NOTICE 'Dropped foreign key constraint';
END
`$`$;

-- Change patient_id column type from UUID to TEXT
DO `$`$
BEGIN
    ALTER TABLE scan_requests 
        ALTER COLUMN patient_id TYPE TEXT USING patient_id::TEXT;
    ALTER TABLE scan_requests 
        ALTER COLUMN patient_id SET NOT NULL;
    RAISE NOTICE 'Changed patient_id column type to TEXT';
END
`$`$;

-- Update the foreign key constraint
DO `$`$
BEGIN
    ALTER TABLE scan_requests 
        ADD CONSTRAINT fk_patient 
        FOREIGN KEY (patient_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    RAISE NOTICE 'Added new foreign key constraint';
END
`$`$;
"@

# Write the SQL to a temporary file
$tempFile = New-TemporaryFile
$sql | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Execute the SQL using psql
    $result = psql -h $Host -p $Port -d $Database -U $User -f $tempFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully updated patient_id column type" -ForegroundColor Green
    } else {
        Write-Host "Error updating patient_id column type" -ForegroundColor Red
        Write-Host $result
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    # Clean up the temporary file
    Remove-Item -Path $tempFile
}
