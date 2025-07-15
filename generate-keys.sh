#!/bin/bash

# Secret Key Generator for Veer Nirman
# This script generates secure random keys for your environment

echo "🔐 Generating Secure Keys for Veer Nirman"
echo "========================================"

# Function to generate a secure random key
generate_key() {
    local length=$1
    local name=$2
    
    # Generate random key using OpenSSL
    key=$(openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length)
    
    echo "$name=$key"
}

echo ""
echo "🔑 Generated Secure Keys:"
echo "========================"

# Generate SECRET_KEY (32 characters)
generate_key 32 "SECRET_KEY"

# Generate JWT_SECRET_KEY (32 characters) 
generate_key 32 "JWT_SECRET_KEY"

# Generate additional keys if needed
generate_key 16 "SESSION_SECRET"
generate_key 24 "ENCRYPTION_KEY"

echo ""
echo "📋 Instructions:"
echo "==============="
echo "1. Copy the generated keys above"
echo "2. Update your backend/.env file with these keys"
echo "3. Replace the placeholder keys in your environment file"
echo "4. NEVER share these keys or commit them to version control"
echo ""
echo "⚠️  Security Notes:"
echo "- These keys are randomly generated and unique"
echo "- Store them securely (password manager recommended)"
echo "- Use different keys for development and production"
echo "- Rotate keys regularly for enhanced security"
echo ""

# Show current environment file location
echo "📁 Your environment file is located at:"
echo "   backend/.env"
echo ""
echo "🔧 To edit your environment file:"
echo "   code backend/.env"
echo ""
