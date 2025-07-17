#!/bin/bash

# Force Railway Deployment Script
echo "🚀 Deploying backend changes to Railway..."

# Add all changes
git add .

# Commit with timestamp to ensure unique commit
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
git commit -m "Fix custom date range support in usage analytics API - ${TIMESTAMP}"

# Push to trigger Railway deployment
git push origin main

echo "✅ Pushed changes to git. Railway should auto-deploy now."
echo "💡 Check Railway dashboard for deployment status."

