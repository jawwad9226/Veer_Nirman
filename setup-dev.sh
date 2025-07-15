#!/bin/bash

# VEER NIRMAN - Development Setup Script
# This script sets up the development environment

echo "🔧 VEER NIRMAN - Development Setup"
echo "================================="
echo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Setting up development environment${NC}"
echo "========================================"

# 1. Check conda environment
echo -e "${YELLOW}1. Checking conda environment...${NC}"
if ! conda info --envs | grep -q "ncc_abyas"; then
    echo -e "${RED}❌ Conda environment 'ncc_abyas' not found${NC}"
    echo "   Please create it with: conda create -n ncc_abyas python=3.9"
    exit 1
fi

echo -e "${GREEN}✅ Conda environment 'ncc_abyas' found${NC}"

# 2. Install backend dependencies
echo -e "${YELLOW}2. Installing backend dependencies...${NC}"
cd backend
conda activate ncc_abyas
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend dependency installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# 3. Install frontend dependencies
echo -e "${YELLOW}3. Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend dependency installation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# 4. Check environment files
echo -e "${YELLOW}4. Checking environment configuration...${NC}"
if [ ! -f "../backend/.env" ]; then
    echo -e "${YELLOW}⚠️ Backend .env file missing${NC}"
    echo "   Creating from .env.example..."
    cp ../backend/.env.example ../backend/.env
fi

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️ Frontend .env.local file missing${NC}"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
fi

echo -e "${GREEN}✅ Environment files ready${NC}"

# 5. Create development start script
echo -e "${YELLOW}5. Creating development start script...${NC}"
cat > ../start-dev.sh << 'EOF'
#!/bin/bash

# VEER NIRMAN - Development Start Script
# This script starts both frontend and backend servers

echo "🚀 Starting VEER NIRMAN Development Servers"
echo "==========================================="

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to call cleanup on Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
cd backend
conda activate ncc_abyas
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Development servers started!"
echo "================================"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop both servers"
echo

# Wait for background processes
wait
EOF

chmod +x ../start-dev.sh

echo -e "${GREEN}✅ Development start script created${NC}"

echo
echo -e "${GREEN}🎉 DEVELOPMENT SETUP COMPLETE!${NC}"
echo "==============================="
echo
echo "Your development environment is ready!"
echo
echo "To start development:"
echo "1. Run: ./start-dev.sh"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Edit code and see changes live"
echo
echo "Configuration files:"
echo "- Backend: backend/.env"
echo "- Frontend: frontend/.env.local"
echo "- Firebase: frontend/firebase-config.json"
echo
echo -e "${BLUE}Happy coding! 💻${NC}"
