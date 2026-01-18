#!/bin/bash

# =============================================================================
# API Test Script - Test Authentication Endpoints
# Run: chmod +x test-api.sh && ./test-api.sh
# =============================================================================

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "🧪 API AUTHENTICATION TESTS"
echo "============================================================"
echo ""

# -------------------------------------------
# TEST 1: Register New User
# -------------------------------------------
echo -e "${YELLOW}📝 TEST 1: Register New User${NC}"
echo "-----------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass@123",
    "name": "Test User",
    "phone": "9876543210",
    "panNumber": "ABCDE1234F"
  }')

echo "Request:"
echo '  POST /api/auth/register'
echo '  Body: { email, password, name, phone, panNumber }'
echo ""
echo "Response:"
echo "$REGISTER_RESPONSE" | head -c 500
echo ""
echo ""

# Extract access token from response
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Registration successful! Token received.${NC}"
else
    echo -e "${RED}❌ Registration failed or returned no token.${NC}"
fi
echo ""

# -------------------------------------------
# TEST 2: Login with Credentials
# -------------------------------------------
echo -e "${YELLOW}🔑 TEST 2: Login with Credentials${NC}"
echo "-----------------------------------------"

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass@123"
  }')

echo "Request:"
echo '  POST /api/auth/login'
echo '  Body: { email, password }'
echo ""
echo "Response:"
echo "$LOGIN_RESPONSE" | head -c 500
echo ""
echo ""

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful! Token: ${ACCESS_TOKEN:0:50}...${NC}"
else
    echo -e "${RED}❌ Login failed.${NC}"
fi
echo ""

# -------------------------------------------
# TEST 3: Get Current User (Protected Route)
# -------------------------------------------
echo -e "${YELLOW}👤 TEST 3: Get Current User (Protected)${NC}"
echo "-----------------------------------------"

if [ -n "$ACCESS_TOKEN" ]; then
    ME_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/auth/me" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    echo "Request:"
    echo '  GET /api/auth/me'
    echo "  Header: Authorization: Bearer <token>"
    echo ""
    echo "Response:"
    echo "$ME_RESPONSE" | head -c 500
    echo ""
    echo ""
    
    if echo "$ME_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Protected route accessed successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to access protected route.${NC}"
    fi
else
    echo -e "${RED}Skipped - No token available${NC}"
fi
echo ""

# -------------------------------------------
# TEST 4: Access Without Token (Should Fail)
# -------------------------------------------
echo -e "${YELLOW}🚫 TEST 4: Access Without Token (Should Fail)${NC}"
echo "-----------------------------------------"

NOAUTH_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/auth/me")

echo "Request:"
echo '  GET /api/auth/me'
echo '  Header: (no Authorization header)'
echo ""
echo "Response:"
echo "$NOAUTH_RESPONSE"
echo ""

if echo "$NOAUTH_RESPONSE" | grep -q '"UNAUTHORIZED"\|"INVALID_TOKEN"'; then
    echo -e "${GREEN}✅ Correctly rejected unauthorized request!${NC}"
else
    echo -e "${RED}❌ Security issue - should have rejected!${NC}"
fi
echo ""

# -------------------------------------------
# TEST 5: Refresh Token
# -------------------------------------------
echo -e "${YELLOW}🔄 TEST 5: Refresh Token${NC}"
echo "-----------------------------------------"

echo "Request:"
echo '  POST /api/auth/refresh'
echo '  (Uses HttpOnly cookie from login)'
echo ""
echo "Note: This works automatically when using browser with credentials"
echo ""

# -------------------------------------------
# TEST 6: Login with Wrong Password
# -------------------------------------------
echo -e "${YELLOW}❌ TEST 6: Login with Wrong Password${NC}"
echo "-----------------------------------------"

WRONG_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword123"
  }')

echo "Request:"
echo '  POST /api/auth/login'
echo '  Body: { email, password: "WrongPassword123" }'
echo ""
echo "Response:"
echo "$WRONG_RESPONSE"
echo ""

if echo "$WRONG_RESPONSE" | grep -q '"INVALID_CREDENTIALS"'; then
    echo -e "${GREEN}✅ Correctly rejected wrong password!${NC}"
else
    echo -e "${RED}❌ Security issue - should have rejected!${NC}"
fi
echo ""

# -------------------------------------------
# TEST 7: Weak Password Registration
# -------------------------------------------
echo -e "${YELLOW}🔒 TEST 7: Weak Password Registration (Should Fail)${NC}"
echo "-----------------------------------------"

WEAK_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "password",
    "name": "Weak User"
  }')

echo "Request:"
echo '  POST /api/auth/register'
echo '  Body: { password: "password" } (weak)'
echo ""
echo "Response:"
echo "$WEAK_RESPONSE"
echo ""

if echo "$WEAK_RESPONSE" | grep -q '"WEAK_PASSWORD"\|"VALIDATION_ERROR"'; then
    echo -e "${GREEN}✅ Correctly rejected weak password!${NC}"
else
    echo -e "${RED}❌ Should have rejected weak password!${NC}"
fi
echo ""

# -------------------------------------------
# Summary
# -------------------------------------------
echo "============================================================"
echo "📊 TEST COMPLETE"
echo "============================================================"
echo ""
echo "To run these tests:"
echo "1. Make sure API Gateway is running: npm run dev"
echo "2. Make sure MongoDB is running: docker-compose up mongodb"
echo "3. Run: ./test-api.sh"
echo ""
