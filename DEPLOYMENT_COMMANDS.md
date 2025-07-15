
# Backend Deployment (Google Cloud Run)


1. **Update Docker image (if you made changes):**

```sh
cd ../backend
docker build -t veer_nirman_backend . .
```

2. **Build Docker image and push to Google Container Registry:**

```sh
gcloud builds submit --tag gcr.io/veer-nirman/veer_nirman_backend
```

3. **Deploy to Cloud Run:**

```sh
gcloud run deploy veer-nirman-backend \
  --image gcr.io/veer-nirman/veer_nirman_backend \
  --platform managed \
  --region YOUR_REGION \
  --allow-unauthenticated
```

4. **Update Frontend API URL:**
   - Note the deployed backend URL from Cloud Run.
   - Update your frontend `.env` or config with:
     ```env
     NEXT_PUBLIC_API_URL=https://YOUR_CLOUD_RUN_URL
     ```

---

# Frontend Deployment (Firebase Hosting)

1. **Build the frontend:**

```sh
npm run build
```

2. **Deploy to Firebase Hosting:**

```sh
firebase deploy --only hosting
```

---

# Testing

- Open your deployed frontend in the browser.
- Test chat, file upload, chat history, clear chat, and chat count features.
