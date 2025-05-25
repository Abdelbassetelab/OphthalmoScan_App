# Direct SQL fix for scan_requests table
Write-Host "Running direct SQL fix for scan_requests table..." -ForegroundColor Green

$sql = @"
-- Check if table exists
DO \$\$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scan_requests') THEN
        -- Make patient_id nullable
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
    END IF;
END
\$\$;
"@

# Save SQL to a temporary file
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sql | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "SQL saved to temporary file: $tempFile" -ForegroundColor Yellow

# Run SQL using psql if available
try {
    $psqlCheck = Get-Command psql -ErrorAction SilentlyContinue
    
    if ($psqlCheck) {
        Write-Host "Found psql. Executing SQL..." -ForegroundColor Green
        
        # Use PGPASSWORD environment variable for authentication
        $env:PGPASSWORD = "YourPassword"  # Replace with your actual database password
        
        # Format the psql command
        $psqlCmd = "psql -h localhost -U postgres -d postgres -f `"$tempFile`""
        
        # Execute the command
        Write-Host "Executing: $psqlCmd" -ForegroundColor Yellow
        Invoke-Expression $psqlCmd
        
        Write-Host "SQL executed successfully!" -ForegroundColor Green
    } else {
        Write-Host "psql not found. Please install PostgreSQL client tools or run this SQL manually." -ForegroundColor Yellow
        Write-Host "SQL content saved to: $tempFile" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error executing SQL: $_" -ForegroundColor Red
    Write-Host "Please run the SQL manually using a PostgreSQL client." -ForegroundColor Red
    Write-Host "SQL content saved to: $tempFile" -ForegroundColor Yellow
}

Write-Host "Done!" -ForegroundColor Green
