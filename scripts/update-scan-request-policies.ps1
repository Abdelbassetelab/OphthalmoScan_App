# Apply the scan request policy changes

# This batch file simplifies running the PowerShell script
# that updates Supabase policies for doctor access to scan requests

Write-Host "Applying scan request policy changes to Supabase..." -ForegroundColor Cyan

# Get the current directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Run the PowerShell script
& "$scriptDir\apply-doctor-scan-request-policies.ps1"

Write-Host "Done! Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
