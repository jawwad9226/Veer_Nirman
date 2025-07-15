#!/bin/bash

# Backend Deployment Script for Veer Nirman
# This script deploys the FastAPI backend to Railway

set -e

echo "🚀 Starting Backend Deployment for Veer Nirman..."

# Check if we're in the backend directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
    export PATH=$PATH:~/.railway/bin
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Initialize Railway project if not exists
if [ ! -f "railway.json" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
fi

# Deploy to Railway
echo "🚀 Deploying backend to Railway..."
railway deploy

# Get the deployment URL
echo "🌐 Getting deployment URL..."
URL=$(railway domain)

if [ -n "$URL" ]; then
    echo "✅ Backend deployed successfully!"
    echo "🔗 Backend URL: https://$URL"
    echo ""
    echo "🧪 Testing deployment..."
    curl -s "https://$URL/api/health" | jq . || echo "Health check response received"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your frontend to use the new backend URL"
    echo "2. Update CORS settings if needed"
    echo "3. Set up environment variables in Railway dashboard"
else
    echo "⚠️  Deployment completed but URL not found. Check Railway dashboard."
fi

echo ""
echo "🎉 Backend deployment complete!"
echo "📊 Monitor your deployment at: https://railway.app/dashboard"
