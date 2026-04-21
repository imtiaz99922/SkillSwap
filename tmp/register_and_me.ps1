$backendBase = 'http://127.0.0.1:5000'
$backendDir = 'D:/CSE 471 Project/backend'

# wait for health or start backend
$up = $false
for ($i=0; $i -lt 5; $i++) {
  try {
    $h = Invoke-RestMethod -Uri "$backendBase/health" -UseBasicParsing
    if ($h.dbConnected) { $up = $true; break }
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $up) {
  Start-Job -ScriptBlock { Set-Location 'D:/CSE 471 Project/backend'; npm run dev } | Out-Null
  Start-Sleep -Seconds 2
  for ($i=0; $i -lt 30; $i++) {
    try { $h = Invoke-RestMethod -Uri "$backendBase/health" -UseBasicParsing; if ($h.dbConnected) { $up = $true; break } } catch { }
    Start-Sleep -Seconds 1
  }
}
if (-not $up) { Write-Error 'Backend did not become healthy'; exit 1 }

# register user
$rand = Get-Random -Maximum 100000
$body = @{ name = 'CLI Verify'; email = "cli+${rand}@example.com"; password = 'Password123' }
try {
  $reg = Invoke-RestMethod -Uri "$backendBase/api/auth/register" -Method Post -Body ($body | ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing
  Write-Output 'REGISTER_RESPONSE:'
  $reg | ConvertTo-Json -Depth 5
} catch {
  Write-Error ('Registration failed: ' + $_.Exception.Message)
  exit 1
}

# call protected /me
if ($reg.token) {
  try {
    $me = Invoke-RestMethod -Uri "$backendBase/api/auth/me" -Headers @{ Authorization = "Bearer $($reg.token)" } -UseBasicParsing
    Write-Output 'ME_RESPONSE:'
    $me | ConvertTo-Json -Depth 5
  } catch {
    Write-Error ('/me failed: ' + $_.Exception.Message)
    exit 1
  }
} else {
  Write-Error 'No token returned from register'
  exit 1
}
