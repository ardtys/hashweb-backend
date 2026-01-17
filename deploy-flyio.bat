@echo off
echo ========================================
echo  HashWeb - Fly.io Deployment Script
echo ========================================
echo.

echo [1/5] Setting Redis Secret with TLS...
fly secrets set REDIS="rediss://default:ARkMAAImcDI1NmM2OTI5NDcwMjc0NWUyYmJiYWFhZjY1YTI1YTg3OXAyNjQxMg@innocent-lamprey-6412.upstash.io:6379" --app hashweb
if %errorlevel% neq 0 (
    echo ERROR: Failed to set REDIS secret
    pause
    exit /b 1
)
echo SUCCESS: REDIS secret set!
echo.

echo [2/5] Verifying secrets...
fly secrets list --app hashweb
echo.

echo [3/5] Deploying to Fly.io...
fly deploy
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo SUCCESS: Deployment complete!
echo.

echo [4/5] Checking status...
fly status --app hashweb
echo.

echo [5/5] Showing logs...
echo Press Ctrl+C to stop logs
fly logs --app hashweb

pause
