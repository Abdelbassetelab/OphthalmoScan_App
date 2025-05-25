# Apply the has_image column update
$env:SUPABASE_URL = "$env:NEXT_PUBLIC_SUPABASE_URL"
$env:SUPABASE_KEY = "$env:SUPABASE_SERVICE_ROLE_KEY"
$schemaFile = "scripts/update-scan-requests-add-has-image.sql"

Write-Host "Reading update SQL script..."
$sql = Get-Content -Path $schemaFile -Raw

Write-Host "Applying schema update..."
$headers = @{
    "apikey" = $env:SUPABASE_KEY
    "Authorization" = "Bearer $env:SUPABASE_KEY"
}

$response = Invoke-RestMethod -Uri "$env:SUPABASE_URL/rest/v1/rpc/execute_sql" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body (@{query=$sql} | ConvertTo-Json)

Write-Host "Schema update complete"
