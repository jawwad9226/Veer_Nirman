# Use official Python image
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Run the FastAPI app with Uvicorn, using the PORT environment variable for Cloud Run
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
