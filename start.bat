@echo off
chcp 65001 >nul
echo ========================================
echo   palmdraw - PALM Output Visualizer
echo ========================================
echo.

cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel%==0 (
    set PYTHON_CMD=python
) else if exist "%USERPROFILE%\miniconda3\python.exe" (
    set PYTHON_CMD=%USERPROFILE%\miniconda3\python.exe
) else if exist "%USERPROFILE%\anaconda3\python.exe" (
    set PYTHON_CMD=%USERPROFILE%\anaconda3\python.exe
) else (
    echo [ERROR] Python not found. Please install Python or add it to PATH.
    pause
    exit /b 1
)

echo [1/2] Starting backend...
cd backend
start "palmdraw-backend" cmd /k "%PYTHON_CMD% -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting frontend...
cd ..\frontend
start "palmdraw-frontend" cmd /k "npm run dev"

echo.
echo [palmdraw] Starting...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   API Docs: http://localhost:8000/docs
echo.

timeout /t 3 /nobreak >nul
start http://localhost:5173
