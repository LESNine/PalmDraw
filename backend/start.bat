@echo off
chcp 65001 >nul
echo [palmdraw] Starting backend server...
cd /d "%~dp0"
pip install -r requirements.txt -q 2>nul
start "palmdraw-backend" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo [palmdraw] Backend running at http://localhost:8000
echo [palmdraw] API docs at http://localhost:8000/docs
