# Backend Production Deployment Guide for Veer Nirman

## 🚀 Quick Backend Deployment Options

### Option 1: Railway (Recommended)
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway new

# 4. Deploy backend
cd backend
railway up
```

### Option 2: Render
```bash
# 1. Create render.yaml in backend/
cat > render.yaml << EOF
services:
  - type: web
    name: veer-nirman-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port \$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.21
EOF

# 2. Push to GitHub and connect to Render
```

### Option 3: Heroku
```bash
# 1. Install Heroku CLI
# 2. Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile

# 3. Deploy
cd backend
heroku create veer-nirman-backend
git push heroku main
```

### Option 4: Google Cloud Run
```bash
# 1. Create Dockerfile
cat > backend/Dockerfile << EOF
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
EOF

# 2. Build and deploy
gcloud builds submit --tag gcr.io/veer-nirman/backend
gcloud run deploy --image gcr.io/veer-nirman/backend --platform managed
```

## 📋 Post-Deployment Steps

1. **Update Frontend Environment Variables**
   ```bash
   # Update frontend/.env.production
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```

2. **Rebuild and Redeploy Frontend**
   ```bash
   cd frontend
   npm run build
   firebase deploy --only hosting
   ```

3. **Test Full Integration**
   ```bash
   ./health-check.sh
   ```

## 🔧 Backend Environment Variables

Create these environment variables in your deployment platform:

```env
# Database
DATABASE_URL=your-database-url

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://veer-nirman.web.app,https://veer-nirman.firebaseapp.com

# File Storage
UPLOAD_FOLDER=/tmp/uploads
MAX_FILE_SIZE=10485760

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=INFO
```

## 🔒 Security Checklist

- [ ] Environment variables set
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Health checks working

## 📊 Monitoring Setup

1. **Health Endpoint**: `/health`
2. **API Documentation**: `/docs`
3. **Metrics**: `/metrics` (if implemented)
4. **Logs**: Check platform-specific logging

## 🚨 Troubleshooting

### Common Issues:
1. **Port Configuration**: Ensure your backend listens on `$PORT`
2. **Dependencies**: Check `requirements.txt` is complete
3. **File Paths**: Use absolute paths for file operations
4. **Database**: Ensure database connection is configured
5. **Environment**: Check all required env vars are set

### Health Check Commands:
```bash
# Test backend health
curl https://your-backend-url.com/health

# Test API documentation
curl https://your-backend-url.com/docs

# Test specific endpoint
curl https://your-backend-url.com/api/v1/users
```

## 📈 Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis for session/data caching
3. **Connection Pooling**: Use connection pooling for database
4. **Background Tasks**: Use Celery for long-running tasks
5. **CDN**: Use CDN for static file serving

## 🔄 CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway up
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Firebase
        run: |
          npm install -g firebase-tools
          cd frontend
          npm ci
          npm run build
          firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

Choose the deployment option that best fits your needs and budget!
