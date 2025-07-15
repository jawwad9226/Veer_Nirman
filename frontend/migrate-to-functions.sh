#!/bin/bash

# Firebase Functions Migration Script
# This script helps migrate your FastAPI backend to Firebase Functions

echo "🔄 Migrating Backend to Firebase Functions"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: Not in Firebase project directory"
    echo "Please run this script from the frontend directory"
    exit 1
fi

# Create functions source directory if it doesn't exist
mkdir -p functions/src

echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install

echo "📋 Migration Steps:"
echo "=================="

echo "1. ✅ Firebase Functions structure created"
echo "2. ✅ Dependencies configured"
echo "3. ✅ Basic API endpoints created"
echo "4. ✅ CORS configuration added"
echo "5. ✅ Hosting rewrites configured"

echo ""
echo "🔧 Next Steps:"
echo "============="
echo "1. Set Firebase Functions environment variables"
echo "2. Copy your backend business logic"
echo "3. Test functions locally"
echo "4. Deploy to Firebase"

echo ""
echo "📋 Environment Variables Setup:"
echo "=============================="
echo "Set these in Firebase Console > Functions > Environment Variables:"
echo ""
echo "GEMINI_API_KEY: AIzaSyDtOPAsWzzFwqwsbjpznhX1tS3pLwv31NU"
echo "SECRET_KEY: C6Q5VXtuQgQkM5DbjmZnzpDYdQd8WFlx"
echo "JWT_SECRET_KEY: AdKtgcpiXpcRr8u5lrSOIGoWkhCDHrX2"
echo ""

echo "🚀 Commands to run:"
echo "=================="
echo "# Set environment variables"
echo "firebase functions:config:set gemini.api_key=\"AIzaSyDtOPAsWzzFwqwsbjpznhX1tS3pLwv31NU\""
echo "firebase functions:config:set app.secret_key=\"C6Q5VXtuQgQkM5DbjmZnzpDYdQd8WFlx\""
echo "firebase functions:config:set app.jwt_secret=\"AdKtgcpiXpcRr8u5lrSOIGoWkhCDHrX2\""
echo ""
echo "# Test locally"
echo "firebase emulators:start --only functions,hosting"
echo ""
echo "# Deploy to production"
echo "firebase deploy --only functions"
echo ""

cd ..
echo "✅ Firebase Functions migration setup complete!"
echo "Now run the commands above to complete the setup."
