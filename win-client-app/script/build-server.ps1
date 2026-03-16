# build-server.ps1 — Run on Windows to watch for build triggers via shared folder
# Usage: powershell -File Y:\Documents\ME\dev\entropia-flow\win-client-app\script\build-server.ps1

# Watch dir = where this script lives (may be a worktree)
$watchDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
# Build dir = main repo (shared folder symlinks in node_modules don't work from worktrees)
$buildDir = "Y:\Documents\ME\dev\entropia-flow\win-client-app"
$triggerFile = Join-Path $watchDir ".build-trigger"
$resultFile = Join-Path $watchDir ".build-result"
$logFile = Join-Path $watchDir ".build-log"
$pollInterval = 2  # seconds

Write-Host "Build server started."
Write-Host "  Watching: $triggerFile"
Write-Host "  Building: $buildDir"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

while ($true) {
    if (Test-Path $triggerFile) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Build triggered!"

        # Remove trigger immediately to avoid re-triggering
        Remove-Item $triggerFile -Force

        # Clean previous results
        if (Test-Path $resultFile) { Remove-Item $resultFile -Force }
        if (Test-Path $logFile) { Remove-Item $logFile -Force }

        # Run the build
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Running npm run pack in $buildDir..."
        $startTime = Get-Date

        try {
            $output = & cmd /c "cd /d $buildDir && npm install && npm run pack 2>&1"
            $exitCode = $LASTEXITCODE
            $duration = (Get-Date) - $startTime

            # Write build log
            $output | Out-File -FilePath $logFile -Encoding utf8

            # Write result summary
            if ($exitCode -eq 0) {
                $status = "SUCCESS"
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Build succeeded in $($duration.TotalSeconds.ToString('F1'))s"
            } else {
                $status = "FAILURE"
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Build failed (exit code: $exitCode)"
            }

            @"
status=$status
exit_code=$exitCode
duration=$($duration.TotalSeconds.ToString('F1'))s
timestamp=$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@ | Out-File -FilePath $resultFile -Encoding ascii

        } catch {
            $errorMsg = $_.Exception.Message
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Build error: $errorMsg"

            @"
status=ERROR
exit_code=-1
error=$errorMsg
timestamp=$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@ | Out-File -FilePath $resultFile -Encoding ascii

            $errorMsg | Out-File -FilePath $logFile -Encoding utf8
        }

        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Waiting for next trigger..."
        Write-Host ""
    }

    Start-Sleep -Seconds $pollInterval
}
