#!/bin/bash

# Environment Validation Script for Veer Nirman
# This script validates your environment configuration

echo "🔍 Environment Configuration Validation"
echo "======================================"

# Check if backend .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env file not found!"
    exit 1
fi

echo "✅ backend/.env file found"

# Function to check if environment variable exists and is not empty
check_env_var() {
    local var_name=$1
    local required=$2
    local value=$(grep "^$var_name=" backend/.env | cut -d'=' -f2-)
    
    if [ -z "$value" ] || [ "$value" = "your-placeholder-value" ] || [[ "$value" == *"your-"* ]]; then
        if [ "$required" = "true" ]; then
            echo "❌ $var_name is missing or has placeholder value"
            return 1
        else
            echo "⚠️  $var_name is optional and not set"
            return 0
        fi
    else
        echo "✅ $var_name is configured"
        return 0
    fi
}

echo ""
echo "🔑 Checking Required Variables:"
echo "==============================="

# Check required variables
errors=0

if ! check_env_var "GEMINI_API_KEY" "true"; then
    errors=$((errors + 1))
fi

if ! check_env_var "SECRET_KEY" "true"; then
    errors=$((errors + 1))
fi

if ! check_env_var "JWT_SECRET_KEY" "true"; then
    errors=$((errors + 1))
fi

if ! check_env_var "DATABASE_URL" "true"; then
    errors=$((errors + 1))
fi

if ! check_env_var "CORS_ORIGINS" "true"; then
    errors=$((errors + 1))
fi

echo ""
echo "🔧 Checking Optional Variables:"
echo "==============================="

check_env_var "FIREBASE_PROJECT_ID" "false"
check_env_var "SMTP_HOST" "false"
check_env_var "SMTP_USERNAME" "false"

echo ""
echo "🔒 Security Validation:"
echo "======================"

# Check for insecure CORS configuration
cors_value=$(grep "^CORS_ORIGINS=" backend/.env | cut -d'=' -f2-)
if [[ "$cors_value" == *"*"* ]]; then
    echo "❌ CORS_ORIGINS contains wildcard (*) - SECURITY RISK!"
    errors=$((errors + 1))
else
    echo "✅ CORS_ORIGINS is properly configured"
fi

# Check secret key length
secret_key=$(grep "^SECRET_KEY=" backend/.env | cut -d'=' -f2-)
if [ ${#secret_key} -lt 32 ]; then
    echo "❌ SECRET_KEY is too short (minimum 32 characters)"
    errors=$((errors + 1))
else
    echo "✅ SECRET_KEY length is adequate"
fi

# Check if using placeholder values
if grep -q "your-" backend/.env; then
    echo "❌ Found placeholder values in .env file"
    errors=$((errors + 1))
else
    echo "✅ No placeholder values found"
fi

echo ""
echo "📋 Summary:"
echo "==========="

if [ $errors -eq 0 ]; then
    echo "🎉 Environment configuration is valid!"
    echo "✅ All required variables are set"
    echo "✅ Security configuration is proper"
    echo "✅ Ready for deployment"
else
    echo "⚠️  Found $errors issue(s) that need attention"
    echo "Please fix the issues above before deploying"
fi

echo ""
echo "🚀 Next Steps:"
echo "============="
echo "1. Fix any issues mentioned above"
echo "2. Test backend: cd backend && python main.py"
echo "3. Test frontend: cd frontend && npm run dev"
echo "4. Deploy backend to production platform"
echo "5. Update frontend .env.production with backend URL"
echo "6. Deploy frontend: firebase deploy"
