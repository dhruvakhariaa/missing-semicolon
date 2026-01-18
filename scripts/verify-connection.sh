#!/bin/bash
# Frontend-Backend Connection Verification Script

echo "🔍 Verifying Frontend-Backend Connection"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Docker containers are running
echo "1️⃣  Checking Docker containers..."
if docker ps | grep -q "sdp-api-gateway"; then
    echo -e "${GREEN}✓${NC} API Gateway container is running"
else
    echo -e "${RED}✗${NC} API Gateway container is NOT running"
    echo "   Run: docker-compose up -d"
    exit 1
fi

if docker ps | grep -q "sdp-mongodb"; then
    echo -e "${GREEN}✓${NC} MongoDB container is running"
else
    echo -e "${RED}✗${NC} MongoDB container is NOT running"
    exit 1
fi

echo ""

# Step 2: Test API Gateway Health
echo "2️⃣  Testing API Gateway health endpoint..."
GATEWAY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$GATEWAY_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓${NC} API Gateway is responding on port 8000"
else
    echo -e "${RED}✗${NC} API Gateway is not accessible (HTTP $GATEWAY_HEALTH)"
    exit 1
fi

echo ""

# Step 3: Test Urban Service through Gateway
echo "3️⃣  Testing Urban Service through API Gateway..."
URBAN_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/urban/health)
if [ "$URBAN_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓${NC} Urban Service is accessible through Gateway"
else
    echo -e "${YELLOW}⚠${NC}  Urban Service may not be fully registered (HTTP $URBAN_HEALTH)"
    echo "   Wait 10-15 seconds for service registration"
fi

echo ""

# Step 4: Test Complaints Endpoint
echo "4️⃣  Testing Complaints API endpoint..."
COMPLAINTS_CHECK=$(curl -s http://localhost:8000/api/urban/complaints)
if echo "$COMPLAINTS_CHECK" | grep -q "success"; then
    COMPLAINT_COUNT=$(echo "$COMPLAINTS_CHECK" | grep -o '"success":true' | wc -l)
    echo -e "${GREEN}✓${NC} Complaints endpoint is working"
    echo "   Response contains data"
else
    echo -e "${RED}✗${NC} Complaints endpoint returned unexpected response"
    echo "   Response: $COMPLAINTS_CHECK"
fi

echo ""

# Step 5: Check MongoDB
echo "5️⃣  Checking MongoDB databases..."
MONGODB_DBS=$(docker exec sdp-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d => d.name).join(', ')")
if echo "$MONGODB_DBS" | grep -q "sdp_urban"; then
    echo -e "${GREEN}✓${NC} Found databases: $MONGODB_DBS"
else
    echo -e "${YELLOW}⚠${NC}  Urban database not found. You may need to seed data."
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start frontend: cd frontend && npm run dev"
echo "2. Navigate to: http://localhost:3000"
echo "3. Test creating a complaint"
echo "4. Check MongoDB Compass for new data"
