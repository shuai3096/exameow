@echo off
setlocal
cd /d "%~dp0"

echo.
echo   ==================================
echo           Exameow v1.0.0
echo     AI Exam Question Generator
echo   ==================================
echo.

where cargo >nul 2>nul || (echo [ERROR] cargo not found. Install Rust: https://rustup.rs & exit /b 1)
where pnpm  >nul 2>nul || (echo [ERROR] pnpm not found. Install: npm i -g pnpm & exit /b 1)

if not defined http_proxy (
    for %%P in (46590 7892) do (
        if not defined http_proxy (
            powershell -NoProfile -Command "$c=New-Object Net.Sockets.TcpClient; try{ $c.Connect('127.0.0.1',%%P); exit 0 }catch{ exit 1 }finally{ $c.Close() }" >nul 2>nul
            if not errorlevel 1 (
                set "http_proxy=socks5://127.0.0.1:%%P"
                set "https_proxy=socks5://127.0.0.1:%%P"
                set "all_proxy=socks5://127.0.0.1:%%P"
                echo Proxy detected: socks5://127.0.0.1:%%P
            )
        )
    )
)

if not exist "frontend\node_modules" (
    echo Installing dependencies...
    call pnpm install || exit /b 1
)

echo.
echo   Select launch mode:
echo   [1] Desktop (Tauri)  - full desktop app with native shell
echo   [2] Web Dev          - Axum server + Vite dev, http://localhost:5273
echo   [3] Web Production   - Axum serving built frontend, http://localhost:3000
echo.
set "MODE=1"
set /p "MODE=  Choice [1-3] (default 1): "

if "%MODE%"=="1" goto desktop
if "%MODE%"=="2" goto webdev
if "%MODE%"=="3" goto webprod
echo Invalid choice
exit /b 1

:desktop
echo.
echo Starting Tauri desktop app... (Ctrl+C to stop)
set "PATH=%~dp0frontend\node_modules\.bin;%PATH%"
call tauri dev
goto :eof

:webdev
echo.
echo Starting Web dev mode...
start "exameow-server" cmd /k cargo run -p exameow-server
start "exameow-vite" cmd /k "cd /d %~dp0frontend && pnpm dev"
echo   Frontend:   http://localhost:5273
echo   API server: http://localhost:3000
echo   Close the two spawned windows to stop.
goto :eof

:webprod
echo.
echo Building frontend...
pushd frontend
call pnpm build || (popd & exit /b 1)
popd
echo Starting production server at http://localhost:3000 ... (Ctrl+C to stop)
cargo run -p exameow-server
goto :eof
