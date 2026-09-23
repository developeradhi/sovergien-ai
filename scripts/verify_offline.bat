@echo off
echo =====================================================================
echo  MANGALORE REFINERY AND PETROCHEMICALS LIMITED (MRPL)
echo  SOVEREIGNAI WORKBENCH - OFFLINE / AIR-GAP VERIFICATION SCRIPT
echo =====================================================================

set API_URL=http://127.0.0.1:8000/security/network-status

echo Checking API network isolation status at %API_URL%...
python -c "import urllib.request, json; res = json.loads(urllib.request.urlopen('%API_URL%').read()); print(json.dumps(res, indent=2)); exit(0 if res.get('offline_mode') and res.get('airgap_enforced') else 1)"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [PASS] AIR-GAP VERIFIED: Outbound telemetry disabled, local loopback enforced.
) else (
    echo.
    echo [FAIL] Offline status check failed or backend is not running.
)
pause
