@echo off
echo =====================================================================
echo  STARTING SOVEREIGNAI WORKBENCH (BACKEND + FRONTEND)
echo =====================================================================
start "SovereignAI Backend API" cmd /k run_backend.bat
start "SovereignAI Workbench UI" cmd /k run_frontend.bat
echo SovereignAI Workbench launched!
echo Local Host:     http://localhost:5173
echo Network (LAN):  http://10.97.187.182:5173
echo Backend API:    http://10.97.187.182:8000/docs
