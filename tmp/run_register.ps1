$backendDir='D:/CSE 471 Project/backend'
$up=$false
for($i=0;$i -lt 5;$i++){
  try{ $r=Invoke-RestMethod -Uri 'http://127.0.0.1:5000/health' -UseBasicParsing; $up=$true; break }
  catch { Start-Sleep -Seconds 1 }
}
if(-not $up){
  Start-Job -ScriptBlock { Set-Location 'D:/CSE 471 Project/backend'; npm run dev } | Out-Null
  Start-Sleep -Seconds 2
  for($i=0;$i -lt 30;$i++){
    try{ $r=Invoke-RestMethod -Uri 'http://127.0.0.1:5000/health' -UseBasicParsing; if($r.dbConnected){ $up=$true; break } }
    catch{}
    Start-Sleep -Seconds 1
  }
}
if(-not $up){ Write-Error 'Backend did not become healthy'; exit 1 }
$rand = Get-Random -Maximum 100000
$body = @{ name='Local Test'; email=("localtest+$rand@example.com"); password='Password123' }
try{
  $res = Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/auth/register' -Method Post -Body ($body | ConvertTo-Json) -ContentType 'application/json' -UseBasicParsing
  Write-Output 'HEALTH:'
  $r | ConvertTo-Json -Depth 5
  Write-Output 'REGISTER_RESPONSE:'
  $res | ConvertTo-Json -Depth 5
} catch {
  Write-Error ('Registration failed: ' + $_.Exception.Message)
  exit 1
}
