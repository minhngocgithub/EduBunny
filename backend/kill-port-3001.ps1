# Kill all processes using port 3001
Write-Host "🔍 Finding processes on port 3001..." -ForegroundColor Yellow

$processes = netstat -ano | Select-String ":3001" | ForEach-Object {
    $parts = $_ -split '\s+'
    $parts[-1]
} | Select-Object -Unique | Where-Object { $_ -ne "0" }

if ($processes) {
    Write-Host "📋 Found $($processes.Count) process(es)" -ForegroundColor Cyan
    foreach ($processId in $processes) {
        try {
            Stop-Process -Id $processId -Force -ErrorAction Stop
            Write-Host "✅ Killed process PID: $processId" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to kill PID: $processId" -ForegroundColor Red
        }
    }
    Write-Host "`n✨ Port 3001 is now free!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3001 is already free" -ForegroundColor Green
}
