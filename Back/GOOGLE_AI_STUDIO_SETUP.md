## 🚀 Google AI Studio Setup & Troubleshooting Guide

### 🔍 Issue Diagnosis

Your error `LLMQuotaExceededError` indicates a **Google AI Studio rate limit issue**. This is the most common problem with Google AI Studio integration.

### 📋 Step-by-Step Solution

#### 1. **Check Your API Key Configuration**
- Go to AI Dock admin panel → LLM Configurations → Gemini
- Verify you have a valid Google AI Studio API key set
- If missing, get one from: https://aistudio.google.com/app/apikey

#### 2. **Understand Google AI Studio Rate Limits**
- **Free Tier**: Very low limits (15 requests/minute, 1,500 requests/day)
- **Paid Tier**: Higher limits (300 requests/minute, 30,000 requests/day)
- Rate limits reset every minute/day

#### 3. **Quick Fixes to Try**

**Option A: Wait and Retry**
```bash
# Wait 5-10 minutes, then try again
# Free tier limits reset every minute
```

**Option B: Check Your Current Usage**
- Visit: https://aistudio.google.com/app/apikey
- Check your current tier and usage

**Option C: Upgrade to Paid Tier** (Recommended)
- Go to: https://aistudio.google.com/app/apikey  
- Click "Set up Billing" or "Upgrade"
- Follow the billing setup process

#### 4. **Test Your Setup**

I've created a diagnostic tool. Run this on your Railway server:

```bash
# Set your API key
export GOOGLE_AI_STUDIO_API_KEY="your_api_key_here"

# Run diagnostics
cd /opt/render/project/src/Back
python google_ai_studio_diagnostics.py
```

#### 5. **Alternative Models to Try**

If rate limits persist, try these models with higher limits:
- `gemini-1.5-flash` (faster, higher limits)
- `gemini-2.0-flash-lite` (most efficient)

### 🚨 Most Likely Root Causes

1. **Rate Limit Hit** (90% likely)
   - Solution: Wait 5-10 minutes or upgrade to paid tier

2. **Invalid API Key** (5% likely)  
   - Solution: Generate new key at https://aistudio.google.com/app/apikey

3. **Geographic Restriction** (3% likely)
   - Solution: Use VPN or different Google account

4. **Billing Required** (2% likely)
   - Solution: Enable billing for higher tier access

### 🔧 Enhanced Error Logging

The updated Google provider now provides detailed error messages. Check your Railway logs for:
```
🔍 GOOGLE API ERROR: status=429, code=RESOURCE_EXHAUSTED, message=Quota exceeded
```

This will tell you exactly what's wrong.

### 📞 Next Steps

1. **Deploy the enhanced error handling** (commit and push changes)
2. **Check Railway logs** for detailed error messages  
3. **Run the diagnostic tool** to test your API key
4. **Upgrade to paid tier** if you need higher limits

### 💡 Pro Tips

- Google AI Studio **free tier is very restrictive** for production use
- **Paid tier costs** are very reasonable ($7 per 1M tokens)
- **Rate limits reset** every minute, so waiting often works
- **Multiple API keys** can help distribute load (advanced)

Would you like me to help you check your specific API key setup or deploy these fixes?
