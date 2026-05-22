Param(
  [string]$HostPrefix = 'http://localhost'
)

$endpoints = @(
  "$HostPrefix:3000/",
  "$HostPrefix:5000/",
  "$HostPrefix:5001/"
)

Write-Host "Running smoke tests against: $HostPrefix"
$allOk = $true

foreach ($url in $endpoints) {
  Write-Host -NoNewline "Checking $url ... "
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 400) {
      Write-Host "OK"
    } else {
      Write-Host "FAIL (status $($r.StatusCode))"
      $allOk = $false
    }
  } catch {
    Write-Host "FAIL"
    $allOk = $false
  }
}

if ($allOk) {
  Write-Host "All smoke tests passed."
  exit 0
} else {
  Write-Host "One or more smoke tests failed." -ForegroundColor Red
  exit 2
}
