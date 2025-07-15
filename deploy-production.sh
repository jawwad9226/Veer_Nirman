#!/bin/bash

# Production Deployment Script for Veer Nirman
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting Veer Nirman Production Deployment..."
echo "================================================="

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed"
    echo "Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking backend status..."
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is running on localhost:8000"
        return 0
    else
        echo "⚠️  Backend is not running. Starting backend..."
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "../.venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv ../.venv
    fi
    
    # Activate virtual environment
    source ../.venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Start backend in background
    echo "Starting FastAPI server..."
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "Waiting for backend to start..."
    sleep 5
    
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to build and deploy frontend
deploy_frontend() {
    echo "🏗️  Building and deploying frontend..."
    cd frontend
    
    # Install dependencies
    echo "Installing frontend dependencies..."
    npm ci
    
    # Build the application
    echo "Building production build..."
    npm run build
    
    # Deploy to Firebase
    echo "Deploying to Firebase..."
    firebase deploy --only hosting
    
    cd ..
    echo "✅ Frontend deployed successfully!"
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    
    # Test backend API
    echo "Testing backend API..."
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        echo "✅ Backend API is healthy"
    else
        echo "❌ Backend API test failed"
        return 1
    fi
    
    # Test frontend build
    echo "Testing frontend build..."
    cd frontend
    if [ -d "out" ] && [ -f "out/index.html" ]; then
        echo "✅ Frontend build is valid"
    else
        echo "❌ Frontend build test failed"
        return 1
    fi
    cd ..
    
    echo "✅ All tests passed!"
}

# Function to display deployment info
show_deployment_info() {
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "======================="
    echo "🌐 Frontend URL: https://veer-nirman.web.app"
    echo "🔧 Backend URL: http://localhost:8000"
    echo "📊 Firebase Console: https://console.firebase.google.com/project/veer-nirman"
    echo "📚 GitHub Repository: https://github.com/jawwad9226/Veer_Nirman"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Deploy backend to a cloud service (Railway, Heroku, etc.)"
    echo "2. Update frontend environment variables for production backend"
    echo "3. Set up monitoring and analytics"
    echo "4. Configure custom domain (optional)"
    echo ""
}

# Main deployment process
main() {
    # Check and start backend if needed
    if ! check_backend; then
        start_backend
    fi
    
    # Deploy frontend
    deploy_frontend
    
    # Run tests
    run_tests
    
    # Show deployment information
    show_deployment_info
    
    echo "✅ Deployment completed successfully!"
}

# Handle cleanup on exit
cleanup() {
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🧹 Cleaning up backend process..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
}

trap cleanup EXIT

# Run main deployment process
main "$@"
