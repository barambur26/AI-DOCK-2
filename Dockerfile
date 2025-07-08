# Alternative Railway Configuration using Dockerfile
# Use this if nixpacks.toml continues having issues

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy package files
COPY Back/requirements.txt ./Back/
COPY Front/package.json Front/package-lock.json ./Front/

# Install Python dependencies
RUN cd Back && pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
RUN cd Front && npm ci

# Copy application code
COPY . .

# Build frontend
RUN cd Front && npm run build

# Copy frontend build to backend static
RUN mkdir -p Back/static && cp -r Front/dist/* Back/static/

# Set environment variables
ENV PYTHONPATH=Back
ENV NODE_ENV=production

# Expose port
EXPOSE 8000

# Change to Back directory and start the application
WORKDIR /app/Back
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
