$Passed = 0
$Failed = 0

$baseUrl = "http://localhost:5000"
$webUrl = if ($env:FRONTEND_URL -and $env:FRONTEND_URL -ne "") { $env:FRONTEND_URL } elseif ($env:NEXT_PUBLIC_FRONTEND_URL -and $env:NEXT_PUBLIC_FRONTEND_URL -ne "") { $env:NEXT_PUBLIC_FRONTEND_URL } else { "http://localhost:3000" }

try {
    $health = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 10
    $healthOk = ($health.status -eq 'success' -or $health.success -eq $true)
    if ($healthOk) {
        Write-Host "[PASS] API Health Endpoint" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "[FAIL] API Health Endpoint" -ForegroundColor Red
        Write-Host "       Status: $($health.status)" -ForegroundColor Red
        $Failed++
    }
}
catch {
    Write-Host "[FAIL] API Health Endpoint" -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

try {
    $front = Invoke-WebRequest -Uri $webUrl -UseBasicParsing -TimeoutSec 10
    if ($front.StatusCode -eq 200) {
        Write-Host "[PASS] Frontend Home Reachable" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "[FAIL] Frontend Home Reachable" -ForegroundColor Red
        Write-Host "       Status: $($front.StatusCode)" -ForegroundColor Red
        $Failed++
    }
}
catch {
    Write-Host "[FAIL] Frontend Home Reachable" -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

try {
    $studentLogin = Invoke-WebRequest -Uri "$webUrl/login/student" -UseBasicParsing -TimeoutSec 10
    if ($studentLogin.StatusCode -eq 200) {
        Write-Host "[PASS] Student Login Page Reachable" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "[FAIL] Student Login Page Reachable" -ForegroundColor Red
        Write-Host "       Status: $($studentLogin.StatusCode)" -ForegroundColor Red
        $Failed++
    }
}
catch {
    Write-Host "[FAIL] Student Login Page Reachable" -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

try {
    $teacherLogin = Invoke-WebRequest -Uri "$webUrl/login/teacher" -UseBasicParsing -TimeoutSec 10
    if ($teacherLogin.StatusCode -eq 200) {
        Write-Host "[PASS] Teacher Login Page Reachable" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "[FAIL] Teacher Login Page Reachable" -ForegroundColor Red
        Write-Host "       Status: $($teacherLogin.StatusCode)" -ForegroundColor Red
        $Failed++
    }
}
catch {
    Write-Host "[FAIL] Teacher Login Page Reachable" -ForegroundColor Red
    Write-Host "       $($_.Exception.Message)" -ForegroundColor Red
    $Failed++
}

$anonAttendanceStatus = $null
try {
    $null = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/attendance/check-in" -ContentType "application/json" -Body '{"studentId":"anon"}' -UseBasicParsing -TimeoutSec 10
    $anonAttendanceStatus = 200
}
catch {
    $anonAttendanceStatus = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
}
if ($anonAttendanceStatus -eq 401 -or $anonAttendanceStatus -eq 403) {
    Write-Host "[PASS] Anonymous Attendance Rejected" -ForegroundColor Green
    $Passed++
}
else {
    Write-Host "[FAIL] Anonymous Attendance Rejected" -ForegroundColor Red
    Write-Host "       Status: $anonAttendanceStatus" -ForegroundColor Red
    $Failed++
}

$anonTestStatus = $null
try {
    $null = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/tests" -ContentType "application/json" -Body '{"title":"tmp"}' -UseBasicParsing -TimeoutSec 10
    $anonTestStatus = 200
}
catch {
    $anonTestStatus = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
}
if ($anonTestStatus -eq 401 -or $anonTestStatus -eq 403) {
    Write-Host "[PASS] Anonymous Test Create Rejected" -ForegroundColor Green
    $Passed++
}
else {
    Write-Host "[FAIL] Anonymous Test Create Rejected" -ForegroundColor Red
    Write-Host "       Status: $anonTestStatus" -ForegroundColor Red
    $Failed++
}

$requiredFiles = @(
    "frontend/src/app/page.tsx",
    "frontend/src/components/Navbar.tsx",
    "frontend/src/components/StudentLoginWithList.tsx",
    "frontend/src/components/TeacherLoginWithID.tsx",
    "frontend/src/components/GoogleSheetAttendance.tsx",
    "backend/src/routes/auth.routes.js",
    "backend/src/routes/googleAuth.routes.js",
    "backend/src/routes/student.routes.js",
    "backend/src/routes/questions.routes.js",
    "backend/src/routes/test.routes.js",
    "backend/src/routes/attendance.routes.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "[PASS] File Exists: $file" -ForegroundColor Green
        $Passed++
    }
    else {
        Write-Host "[FAIL] File Exists: $file" -ForegroundColor Red
        $Failed++
    }
}

$passRate = if (($Passed + $Failed) -gt 0) { [math]::Round(($Passed / ($Passed + $Failed)) * 100, 1) } else { 0 }

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Passed:  $Passed" -ForegroundColor Green
Write-Host " Failed:  $Failed" -ForegroundColor Red
Write-Host " Success: $passRate%" -ForegroundColor Yellow
Write-Host "==============================================" -ForegroundColor Cyan

if ($Failed -gt 0) {
    exit 1
}

exit 0
