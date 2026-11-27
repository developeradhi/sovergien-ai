@echo off
echo =====================================================================
echo  MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)
echo  SOVEREIGNAI WORKBENCH - FASTAPI AIR-GAPPED BACKEND (PORT 8000)
echo =====================================================================
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
