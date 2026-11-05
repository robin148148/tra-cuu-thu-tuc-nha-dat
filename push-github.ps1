$ErrorActionPreference = "Stop"
$env:PATH = "C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI;C:\Program Files\nodejs;" + $env:PATH
Set-Location "D:\Anti\land-law-portal"

Write-Host "=== 1. Kiem tra dang nhap GitHub ===" -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Dang mo trinh duyet de dang nhap GitHub..." -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web
}

$username = (gh api user --jq ".login").Trim()
$repoName = "tra-cuu-thu-tuc-nha-dat"

Write-Host "=== 2. Tao kho luu tru cong khai: $username/$repoName ===" -ForegroundColor Cyan
$repoExists = $false
try {
    gh repo view "$username/$repoName" | Out-Null
    $repoExists = $true
} catch {
    $repoExists = $false
}

if (-not $repoExists) {
    gh repo create $repoName --public --description "TRA CUU THU TUC NHA DAT - Cong Cam Nang Thu Tuc Dat Dai & Thua Ke" --source=. --remote=origin --push
} else {
    git remote remove origin 2>$null
    git remote add origin "https://github.com/$username/$repoName.git"
    git push -u origin main --force
}

Write-Host "=== 3. Kich hoat GitHub Pages tu dong ===" -ForegroundColor Cyan
try {
    gh api -X POST "repos/$username/$repoName/pages" -f "build_type=workflow" 2>$null | Out-Null
} catch {
    gh api -X PUT "repos/$username/$repoName/pages" -f "build_type=workflow" 2>$null | Out-Null
}

$publicUrl = "https://$username.github.io/$repoName/"
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "DA DAY LEN GITHUB THANH CONG!" -ForegroundColor Green
Write-Host "Link Repo   : https://github.com/$username/$repoName" -ForegroundColor Yellow
Write-Host "Link Public : $publicUrl" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Green
