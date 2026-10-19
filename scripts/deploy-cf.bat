@echo off
setlocal enabledelayedexpansion

echo === Exameow Cloudflare Deploy ===
echo.

set SCRIPT_DIR=%~dp0
set PROJECT_DIR=%SCRIPT_DIR%..

REM Step 1: Build frontend for Cloudflare
echo [1/3] Building frontend for Cloudflare...
cd /d "%PROJECT_DIR%\frontend"

set VITE_CLOUDFLARE=true
call npx vite build
echo   Frontend built successfully.

REM Step 2: Copy frontend dist to worker public directory
echo.
echo [2/3] Copying frontend to worker...
cd /d "%PROJECT_DIR%\workers"
if exist public rmdir /s /q public
mkdir public
xcopy /e /y "%PROJECT_DIR%\frontend\dist\*" public\
echo   Files copied to workers/public/

REM Step 3: Deploy worker
echo.
echo [3/3] Deploying to Cloudflare...
call npx wrangler deploy

echo.
echo === Deploy complete ===
echo.
echo Your app is live at the URL shown above.
echo To test the API: curl ^<YOUR_URL^>/api/health
