#!/bin/bash

# Environment Setup Script for Veer Nirman
# This script helps you set up the correct environment files

echo "🔧 Environment Setup for Veer Nirman"
echo "=================================="

# Function to create environment file from template
create_env_file() {
    local template_file="$1"
    local target_file="$2"
    local env_type="$3"
    
    if [ -f "$target_file" ]; then
        echo "⚠️  $target_file already exists. Skipping..."
        return
    fi
    
    if [ -f "$template_file" ]; then
        cp "$template_file" "$target_file"
        echo "✅ Created $target_file from $template_file"
        echo "📝 Please edit $target_file and fill in your $env_type values"
    else
        echo "❌ Template file $template_file not found"
    fi
}

# Backend environment setup
echo ""
echo "🔧 Backend Environment Setup"
echo "----------------------------"

cd backend

# Create production environment file
create_env_file ".env.example" ".env" "production"

# Frontend environment setup
echo ""
echo "🔧 Frontend Environment Setup"
echo "-----------------------------"

cd ../frontend

# Frontend files are already created, just notify
if [ -f ".env.local" ]; then
    echo "✅ .env.local already exists (development)"
else
    echo "❌ .env.local not found"
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production already exists (production)"
else
    echo "❌ .env.production not found"
fi

# Security reminder
echo ""
echo "🔒 Security Reminder"
echo "==================="
echo "⚠️  IMPORTANT: Never commit .env files to version control!"
echo "⚠️  Make sure .env* is in your .gitignore file"
echo "⚠️  Use different API keys for development and production"
echo "⚠️  Generate strong secret keys (minimum 32 characters)"
echo ""

# Environment variables checklist
echo "📋 Environment Variables Checklist"
echo "=================================="
echo ""
echo "Backend (.env):"
echo "- [ ] GEMINI_API_KEY (required for AI features)"
echo "- [ ] SECRET_KEY (required for JWT)"
echo "- [ ] DATABASE_URL (optional, defaults to SQLite)"
echo "- [ ] SMTP credentials (optional, for email features)"
echo ""
echo "Frontend (.env.local & .env.production):"
echo "- [ ] NEXT_PUBLIC_API_URL (backend URL)"
echo "- [ ] Firebase configuration (all NEXT_PUBLIC_FIREBASE_* vars)"
echo "- [ ] NEXT_PUBLIC_GA_MEASUREMENT_ID (optional, for analytics)"
echo ""

# Next steps
echo "🚀 Next Steps"
echo "============"
echo "1. Edit backend/.env with your production values"
echo "2. Edit frontend/.env.production with your production backend URL"
echo "3. Test locally: npm run dev (frontend) & python main.py (backend)"
echo "4. Deploy backend using one of the deployment guides"
echo "5. Update frontend/.env.production with deployed backend URL"
echo "6. Deploy frontend: npm run build && firebase deploy"
echo ""
echo "For detailed deployment instructions, see:"
echo "- Documentation/BACKEND_DEPLOYMENT_GUIDE.md"
echo "- Documentation/PRODUCTION_READINESS_CHECKLIST.md"

cd ..
