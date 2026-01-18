@echo off
REM Frontend-Backend Connection Verification Script for Windows

echo ============================================
echo Frontend-Backend Connection Verification
echo ============================================
echo.

REM Step 1: Check Docker containers
echo [1/5] Checking Docker containers...
docker ps --filter "name=sdp-api-gateway" --format "{{.Names}}" | findstr /C:"sdp-api-gateway" >nul
if %errorlevel%==0 (
    echo [OK] API Gateway container is running
) else (
    echo [ERROR] API Gateway container is NOT running
    echo Run: docker-compose up -d
    exit /b 1
)

docker ps --filter "name=sdp-mongodb" --format "{{.Names}}" | findstr /C:"sdp-mongodb" >nul
if %errorlevel%==0 (
    echo [OK] MongoDB container is running
) else (
    echo [ERROR] MongoDB container is NOT running
    exit /b 1
)
echo.

REM Step 2: Test API Gateway
echo [2/5] Testing API Gateway on port 8000...
curl -s -o nul -w "%%{http_code}" http://localhost:8000/health > temp_status.txt
set /p GATEWAY_STATUS=<temp_status.txt
del temp_status.txt
if "%GATEWAY_STATUS%"=="200" (
    echo [OK] API Gateway is responding on port 8000
) else (
    echo [ERROR] API Gateway is not accessible ^(HTTP %GATEWAY_STATUS%^)
    exit /b 1
)
echo.

REM Step 3: Test Urban Service
echo [3/5] Testing Urban Service through Gateway...
curl -s -o nul -w "%%{http_code}" http://localhost:8000/api/urban/health > temp_status.txt
set /p URBAN_STATUS=<temp_status.txt
del temp_status.txt
if "%URBAN_STATUS%"=="200" (
    echo [OK] Urban Service is accessible
) else (
    echo [WARN] Urban Service HTTP %URBAN_STATUS% - may need 10-15s to register
)
echo.

REM Step 4: Test Complaints Endpoint
echo [4/5] Testing Complaints API...
curl -s http://localhost:8000/api/urban/complaints | findstr /C:"success" >nul
if %errorlevel%==0 (
    echo [OK] Complaints endpoint is working
) else (
    echo [WARN] Complaints endpoint returned unexpected response
)
echo.

REM Step 5: Check MongoDB
echo [5/5] Checking MongoDB databases...
docker exec sdp-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d =^> d.name)" | findstr /C:"sdp_urban" >nul
if %errorlevel%==0 (
    echo [OK] MongoDB databases found
) else (
    echo [INFO] Run: node scripts\quick-seed.js to populate data
)

echo.
echo ============================================
echo All checks completed!
echo ============================================
echo.
echo Next steps:
echo 1. Start frontend: cd frontend ^&^& npm run dev
echo 2. Navigate to: http://localhost:3000
echo 3. Test creating a complaint
echo 4. Check MongoDB Compass for data
echo.
pause
