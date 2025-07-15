#!/bin/bash

# 🚀 VEER NIRMAN - Production Deployment Script
# This script handles complete deployment of the Veer Nirman application

set -e  # Exit on any error

echo "🇮🇳 VEER NIRMAN - Production Deployment"
echo "========================================"

# Configuration
PROJECT_DIR="/home/jawwad-linux/Documents/Veer_Nirman"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
CONDA_ENV="ncc_abyas"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if conda environment exists
check_conda_env() {
    log_info "Checking conda environment: $CONDA_ENV"
    if conda env list | grep -q "$CONDA_ENV"; then
        log_success "Conda environment '$CONDA_ENV' found"
    else
        log_error "Conda environment '$CONDA_ENV' not found"
        log_info "Please create it with: conda create -n $CONDA_ENV python=3.11"
        exit 1
    fi
}

# Install backend dependencies
setup_backend() {
    log_info "Setting up backend dependencies..."
    cd "$BACKEND_DIR"
    
    # Activate conda environment
    eval "$(conda shell.bash hook)"
    conda activate "$CONDA_ENV"
    
    # Install dependencies
    log_info "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found in backend"
        log_info "Please copy .env.example to .env and configure it"
        cp .env.example .env
        log_info "Created .env file from template"
    fi
    
    log_success "Backend setup completed"
}

# Install frontend dependencies
setup_frontend() {
    log_info "Setting up frontend dependencies..."
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    log_info "Installing Node.js dependencies..."
    npm install
    
    # Check if .env.local file exists
    if [ ! -f ".env.local" ]; then
        log_warning ".env.local file not found in frontend"
        log_info "Please copy .env.local.example to .env.local and configure it"
        cp .env.local.example .env.local
        log_info "Created .env.local file from template"
    fi
    
    log_success "Frontend setup completed"
}

# Test backend
test_backend() {
    log_info "Testing backend..."
    cd "$BACKEND_DIR"
    
    eval "$(conda shell.bash hook)"
    conda activate "$CONDA_ENV"
    
    # Test if backend starts without errors
    python -c "import uvicorn; import main; print('Backend imports successful')"
    
    log_success "Backend test passed"
}

# Build frontend
build_frontend() {
    log_info "Building frontend for production..."
    cd "$FRONTEND_DIR"
    
    npm run build
    
    log_success "Frontend build completed"
}

# Deploy to Firebase (if Firebase CLI is installed)
deploy_firebase() {
    log_info "Checking Firebase CLI..."
    if command -v firebase &> /dev/null; then
        log_info "Firebase CLI found, deploying..."
        cd "$FRONTEND_DIR"
        firebase deploy --only hosting
        log_success "Firebase deployment completed"
    else
        log_warning "Firebase CLI not found"
        log_info "Install with: npm install -g firebase-tools"
        log_info "Then run: firebase login && firebase deploy"
    fi
}

# Create development scripts
create_dev_scripts() {
    log_info "Creating development scripts..."
    
    # Backend start script
    cat > "$PROJECT_DIR/start-backend.sh" << 'EOF'
#!/bin/bash
cd /home/jawwad-linux/Documents/Veer_Nirman/backend
eval "$(conda shell.bash hook)"
conda activate ncc_abyas
echo "🚀 Starting Veer Nirman Backend on http://localhost:8000"
python main.py
EOF
    chmod +x "$PROJECT_DIR/start-backend.sh"
    
    # Frontend start script
    cat > "$PROJECT_DIR/start-frontend.sh" << 'EOF'
#!/bin/bash
cd /home/jawwad-linux/Documents/Veer_Nirman/frontend
echo "🚀 Starting Veer Nirman Frontend on http://localhost:3000"
npm run dev
EOF
    chmod +x "$PROJECT_DIR/start-frontend.sh"
    
    # Combined start script
    cat > "$PROJECT_DIR/start-dev.sh" << 'EOF'
#!/bin/bash
echo "🇮🇳 Starting Veer Nirman Development Environment"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start backend in background
cd /home/jawwad-linux/Documents/Veer_Nirman/backend
eval "$(conda shell.bash hook)"
conda activate ncc_abyas
python main.py &
BACKEND_PID=$!

# Start frontend in background
cd /home/jawwad-linux/Documents/Veer_Nirman/frontend
npm run dev &
FRONTEND_PID=$!

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF
    chmod +x "$PROJECT_DIR/start-dev.sh"
    
    log_success "Development scripts created"
}

# Main deployment process
main() {
    log_info "Starting deployment process..."
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Run all setup steps
    check_conda_env
    setup_backend
    setup_frontend
    test_backend
    build_frontend
    create_dev_scripts
    
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure environment variables in .env files"
    echo "2. Set up Firebase project and configure credentials"
    echo "3. Test the application:"
    echo "   - Backend: ./start-backend.sh"
    echo "   - Frontend: ./start-frontend.sh"
    echo "   - Both: ./start-dev.sh"
    echo "4. Deploy to production:"
    echo "   - Install Firebase CLI: npm install -g firebase-tools"
    echo "   - Login: firebase login"
    echo "   - Deploy: firebase deploy"
    echo ""
    echo "🌐 Local URLs:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
}

# Run main function
main "$@"
