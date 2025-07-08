# 🚂 Railway Deployment Guide for AI Dock

This guide will help you deploy AI Dock to Railway successfully.

## 🛠️ Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your AI Dock code should be in a GitHub repository
3. **Environment Variables**: Prepare your LLM API keys and database credentials

## 🚀 Deployment Steps

### 1. Create New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your AI Dock repository

### 2. Configure Environment Variables

In Railway's dashboard, go to **Variables** tab and add:

#### Required Variables:
```bash
# Database (Railway will provide PostgreSQL URL automatically)
DATABASE_URL=${RAILWAY_POSTGRESQL_URL}

# Security
SECRET_KEY=uQhHgSbl5f0ZdY37o9UB4nvCpRW5QEX4k3TaQQeGF4U

# LLM APIs
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# App Configuration
ENVIRONMENT=production
DEBUG=False
API_HOST=0.0.0.0
API_PORT=${PORT}
FRONTEND_URL=https://your-domain.railway.app
```

#### Optional Variables:
```bash
# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_MINUTES=10080

# Logging
LOG_LEVEL=INFO

# Rate Limiting
DEFAULT_RATE_LIMIT_PER_MINUTE=60
DEFAULT_DAILY_QUOTA_TOKENS=100000
```

### 3. Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set the `DATABASE_URL` variable

### 4. Deploy

1. Railway will automatically detect the configuration from `nixpacks.toml`
2. The build process will:
   - Install Python dependencies from `Back/requirements.txt`
   - Install Node.js dependencies from `Front/package.json`
   - Build the React frontend
   - Copy frontend assets to backend static folder
   - Start the FastAPI server

### 5. Verify Deployment

Once deployed, test these endpoints:

- **Health Check**: `https://your-app.railway.app/health`
- **API Documentation**: `https://your-app.railway.app/docs`
- **CORS Test**: `https://your-app.railway.app/cors/test`

## 🔧 Configuration Files

The following files configure Railway deployment:

- **`nixpacks.toml`**: Main build and runtime configuration
- **`railway.json`**: Railway-specific deployment settings
- **`Procfile`**: Alternative process configuration
- **`package.json`**: Node.js build scripts

## 🔍 Troubleshooting

### Build Failures

If the build fails:

1. **Check Logs**: View build logs in Railway dashboard
2. **Python Dependencies**: Ensure all packages in `requirements.txt` are available
3. **Node.js Version**: Verify Node.js 18+ is being used
4. **Environment Variables**: Confirm all required variables are set

### Runtime Issues

If the app crashes at runtime:

1. **Check Health Endpoint**: Visit `/health` to see database status
2. **Database Connection**: Verify `DATABASE_URL` is correctly set
3. **API Keys**: Ensure LLM provider keys are valid
4. **CORS Issues**: Update `FRONTEND_URL` to match your domain

### Common Fixes

```bash
# If Python imports fail
PYTHONPATH=Back

# If frontend assets missing
# Ensure Front/dist exists after build

# If database connections fail
# Check PostgreSQL service is running
```

## 🎯 Production Checklist

Before going live:

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper `FRONTEND_URL`
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Test all API endpoints
- [ ] Verify CORS configuration
- [ ] Test file upload functionality
- [ ] Validate LLM integrations

## 🔄 Updates and Redeployment

Railway automatically redeploys when you push to your main branch. For manual deployment:

1. Go to your Railway project
2. Click "Deploy" → "Redeploy"

## 📞 Support

If you encounter issues:

1. Check Railway's [documentation](https://docs.railway.app/)
2. Review the AI Dock logs in Railway dashboard
3. Test locally with the same environment variables
4. Check the `/health` endpoint for system status

---

**🎉 Your AI Dock should now be running on Railway!**

Visit your Railway app URL to access the API documentation and start using your LLM gateway.
