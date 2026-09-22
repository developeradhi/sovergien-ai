@echo off
echo =====================================================================
echo  STARTING SOVEREIGNAI WORKBENCH (BACKEND + FRONTEND)
echo =====================================================================
start "SovereignAI Backend API" cmd /k run_backend.bat
start "SovereignAI Workbench UI" cmd /k run_frontend.bat
echo SovereignAI Workbench launched!
echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173
