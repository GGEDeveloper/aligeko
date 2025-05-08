# PowerShell script to fix server module import path and deploy
# Date: 2023-06-09

Write-Host "===== AliTools B2B Server Module Import Fix =====" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)" -ForegroundColor Cyan
Write-Host "" 
Write-Host "This script will fix the server module import path and deploy to Vercel." -ForegroundColor Yellow

# Verify we're in the root directory
if (-not (Test-Path "index.js")) {
  Write-Host "Error: Please run this script from the project root directory." -ForegroundColor Red
  exit 1
}

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
git add index.js .cursor/rules/error_tracking.mdc
git commit -m "fix(server): Correct server module import path

- Update path from './server/index.js' to './server/src/index.js'
- Add detailed error information for debugging
- Update error tracking documentation

Resolves issue with 500 errors when accessing API endpoints in production."

# Build client
Write-Host "Building client application..." -ForegroundColor Green
Set-Location -Path client
npm run build
if (-not $?) {
  Write-Host "Error: Client build failed!" -ForegroundColor Red
  exit 1
}
Set-Location -Path ..

# Deploy to Vercel
Write-Host "Deploying to Vercel production..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "===== Deployment Complete =====" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Verify the API endpoints are working properly in production" -ForegroundColor Green
Write-Host "2. Check logs in Vercel dashboard for any remaining issues" -ForegroundColor Green
Write-Host ""
Write-Host "If you need to rollback, use: git reset --hard HEAD~1 ; vercel --prod" -ForegroundColor Yellow 