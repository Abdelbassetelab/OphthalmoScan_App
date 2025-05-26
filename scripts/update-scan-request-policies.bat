# Apply the scan request policy changes

# This batch file simplifies running the PowerShell script
# that updates Supabase policies for doctor access to scan requests

echo "Applying scan request policy changes to Supabase..."
powershell -ExecutionPolicy Bypass -File "%~dp0apply-doctor-scan-request-policies.ps1"
echo "Done! Press any key to exit..."
pause > nul
