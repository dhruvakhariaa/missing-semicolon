@echo off
echo Stopping services...
docker-compose stop api-gateway agriculture-service

echo Removing containers...
docker-compose rm -f api-gateway agriculture-service

echo Rebuilding services...
docker-compose build api-gateway agriculture-service

echo Starting services...
docker-compose up -d api-gateway agriculture-service

echo Waiting for services to initialize (15 seconds)...
timeout /t 15

echo.
echo Checking API Gateway Logs:
docker-compose logs api-gateway --tail=10

echo.
echo Checking Agriculture Service Logs:
docker-compose logs agriculture-service --tail=5

echo.
echo Testing Agriculture API:
curl http://localhost:8000/api/agriculture/schemes

echo.
echo If you see JSON output above, it works! Refesh http://localhost:3000/agriculture
pause
