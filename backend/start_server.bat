@echo off
echo Starting OphthalmoScan AI FastAPI Server...
echo.
cd %~dp0
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
