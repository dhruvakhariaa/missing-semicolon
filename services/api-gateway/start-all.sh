#!/bin/bash

# ============================================================
# Government KYC Portal - Complete System Startup Script
# Starts all services: Python Face Service + Node.js API Gateway
# ============================================================

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
API_GATEWAY_DIR="$SCRIPT_DIR"
PYTHON_DIR="$API_GATEWAY_DIR/src/services/python"

# Python path (use the one that has the installed packages)
PYTHON_BIN="python3"
UVICORN_BIN="/Users/varunpatel/Library/Python/3.9/bin/uvicorn"

# Check if uvicorn exists, otherwise try plain python
if [ ! -f "$UVICORN_BIN" ]; then
    UVICORN_BIN="uvicorn"
fi

echo -e "${BLUE}============================================================${NC}"
echo -e "${BLUE}       Government KYC Portal - 3FA System Startup${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down all services...${NC}"
    
    # Kill Python face service
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Python Face Service stopped${NC}"
    fi
    
    # Kill Node.js server
    if [ ! -z "$NODE_PID" ]; then
        kill $NODE_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Node.js Server stopped${NC}"
    fi
    
    echo -e "${GREEN}All services stopped gracefully.${NC}"
    exit 0
}

# Set up trap to cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Check for required files
if [ ! -f "$PYTHON_DIR/face_service.py" ]; then
    echo -e "${RED}Error: Python face service not found at $PYTHON_DIR/face_service.py${NC}"
    exit 1
fi

if [ ! -f "$API_GATEWAY_DIR/package.json" ]; then
    echo -e "${RED}Error: Node.js package.json not found at $API_GATEWAY_DIR${NC}"
    exit 1
fi

# Start Python Face Service
echo -e "${YELLOW}Starting Python Face Service (port 5001)...${NC}"
cd "$PYTHON_DIR"
$UVICORN_BIN face_service:app --host 0.0.0.0 --port 5001 &
PYTHON_PID=$!
echo -e "${GREEN}✓ Python Face Service started (PID: $PYTHON_PID)${NC}"

# Wait a moment for Python service to initialize
sleep 2

# Check if Python service is running
if ! kill -0 $PYTHON_PID 2>/dev/null; then
    echo -e "${RED}Error: Python Face Service failed to start${NC}"
    exit 1
fi

# Start Node.js API Gateway
echo -e "${YELLOW}Starting Node.js API Gateway (port 3000)...${NC}"
cd "$API_GATEWAY_DIR"
npm start &
NODE_PID=$!
echo -e "${GREEN}✓ Node.js API Gateway started (PID: $NODE_PID)${NC}"

# Wait for Node.js to start
sleep 3

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}       All Services Running!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "  ${BLUE}🚀 API Gateway:${NC}       http://localhost:3000"
echo -e "  ${BLUE}🔐 Security Demo:${NC}     http://localhost:3000/security-demo"
echo -e "  ${BLUE}📊 Live Monitor:${NC}      http://localhost:3000/live-monitor"
echo -e "  ${BLUE}🆔 KYC Portal:${NC}        http://localhost:3000/kyc-portal"
echo -e "  ${BLUE}👤 Face Service:${NC}      http://localhost:5001/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait $PYTHON_PID $NODE_PID
