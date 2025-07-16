# Google AI Studio Setup & Troubleshooting Guide
# This script helps diagnose Google AI Studio API issues

import asyncio
import httpx
import os
import json
from typing import Dict, Any


async def test_google_api_key(api_key: str) -> Dict[str, Any]:
    """
    Test a Google AI Studio API key.
    
    Args:
        api_key: Your Google AI Studio API key
        
    Returns:
        Test result dictionary
    """
    if not api_key:
        return {
            "success": False,
            "error": "No API key provided",
            "solution": "Get an API key from https://aistudio.google.com/app/apikey"
        }
    
    # Test with a simple model list request
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"🧪 Testing Google AI Studio API key...")
            print(f"🔗 URL: {url.replace(api_key, '[API_KEY_HIDDEN]')}")
            
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                model_count = len(models)
                
                # Extract some model names for verification
                model_names = []
                for model in models[:5]:  # Show first 5
                    name = model.get("name", "").replace("models/", "")
                    if name:
                        model_names.append(name)
                
                return {
                    "success": True,
                    "message": f"✅ API key works! Found {model_count} models",
                    "models_found": model_count,
                    "sample_models": model_names,
                    "rate_limit_info": "Check your rate limits at https://aistudio.google.com/app/apikey"
                }
            
            elif response.status_code == 401:
                return {
                    "success": False,
                    "error": "❌ Invalid API key (401 Unauthorized)",
                    "solution": "Check your API key at https://aistudio.google.com/app/apikey"
                }
            
            elif response.status_code == 403:
                return {
                    "success": False,
                    "error": "❌ API access forbidden (403)",
                    "solution": "Your API key might not have permissions or Google AI Studio might not be available in your region"
                }
            
            elif response.status_code == 429:
                return {
                    "success": False,
                    "error": "❌ Rate limit exceeded (429)",
                    "solution": "Wait a few minutes and try again. Consider upgrading to paid tier for higher limits"
                }
            
            else:
                error_text = response.text
                return {
                    "success": False,
                    "error": f"❌ HTTP {response.status_code}: {error_text}",
                    "solution": "Check Google AI Studio status and your API key"
                }
                
    except httpx.TimeoutException:
        return {
            "success": False,
            "error": "❌ Request timed out",
            "solution": "Check your internet connection and try again"
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"❌ Unexpected error: {str(e)}",
            "solution": "Check your API key and internet connection"
        }


async def test_simple_chat_request(api_key: str, model: str = "gemini-1.5-pro") -> Dict[str, Any]:
    """
    Test a simple chat request to verify API functionality.
    
    Args:
        api_key: Your Google AI Studio API key
        model: Model to test with
        
    Returns:
        Test result dictionary
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [{"text": "Hello! Please respond with just 'OK' to confirm the API is working."}],
                "role": "user"
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 10,
            "temperature": 0.1
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print(f"🧪 Testing chat request with model: {model}")
            
            response = await client.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract response content
                content = ""
                candidates = data.get("candidates", [])
                if candidates and candidates[0].get("content"):
                    parts = candidates[0]["content"].get("parts", [])
                    if parts:
                        content = parts[0].get("text", "")
                
                # Extract usage info
                usage = data.get("usageMetadata", {})
                
                return {
                    "success": True,
                    "message": f"✅ Chat request successful!",
                    "response_content": content,
                    "usage": usage,
                    "model_used": model
                }
            
            elif response.status_code == 429:
                return {
                    "success": False,
                    "error": "❌ Rate limit exceeded - this is the most common issue",
                    "solution": "Google AI Studio free tier has very low limits (15 requests/minute). Wait 5-10 minutes and try again, or upgrade to paid tier."
                }
            
            else:
                error_data = {}
                try:
                    error_data = response.json()
                except:
                    pass
                
                return {
                    "success": False,
                    "error": f"❌ HTTP {response.status_code}",
                    "error_details": error_data,
                    "solution": "Check the error details above"
                }
                
    except Exception as e:
        return {
            "success": False,
            "error": f"❌ Request failed: {str(e)}",
            "solution": "Check your API key and internet connection"
        }


def print_setup_instructions():
    """Print setup instructions for Google AI Studio."""
    print("""
🚀 GOOGLE AI STUDIO SETUP INSTRUCTIONS
=====================================

1. GET YOUR API KEY:
   • Visit: https://aistudio.google.com/app/apikey
   • Click "Create API Key"
   • Copy the generated key

2. CONFIGURE IN AI DOCK:
   • Go to your AI Dock admin panel
   • Navigate to LLM Configurations
   • Find your "Gemini" configuration
   • Paste your API key in the "API Key" field
   • Save the configuration

3. UNDERSTAND RATE LIMITS:
   • Free tier: Very low limits (15 requests/minute)
   • Paid tier: Higher limits, requires billing setup
   • Check limits: https://ai.google.dev/gemini-api/docs/rate-limits

4. UPGRADE TO PAID TIER (Optional):
   • Visit: https://aistudio.google.com/app/apikey
   • Click "Set up Billing" or "Upgrade"
   • Follow billing setup instructions

⚠️  COMMON ISSUES:
   • "Rate limit exceeded" → Wait 5-10 minutes or upgrade to paid tier
   • "Invalid API key" → Double-check your key from AI Studio
   • "Forbidden" → Google AI Studio not available in your region

🔗 HELPFUL LINKS:
   • Google AI Studio: https://aistudio.google.com/
   • API Documentation: https://ai.google.dev/gemini-api/docs
   • Rate Limits: https://ai.google.dev/gemini-api/docs/rate-limits
   • Pricing: https://ai.google.dev/gemini-api/docs/pricing
""")


async def run_diagnostics():
    """Run complete diagnostics for Google AI Studio setup."""
    print("🔧 AI DOCK - GOOGLE AI STUDIO DIAGNOSTICS")
    print("=" * 50)
    
    # Check for API key in environment
    api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY") or os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ No API key found in environment variables")
        print("💡 Set GOOGLE_AI_STUDIO_API_KEY environment variable for testing")
        print()
        print_setup_instructions()
        return
    
    print(f"🔑 Found API key: {api_key[:8]}...{api_key[-4:]}")
    print()
    
    # Test API key
    print("📋 TESTING API KEY...")
    key_result = await test_google_api_key(api_key)
    
    if key_result["success"]:
        print(f"✅ {key_result['message']}")
        print(f"📊 Models available: {key_result['models_found']}")
        print(f"🎯 Sample models: {', '.join(key_result['sample_models'])}")
    else:
        print(f"❌ API key test failed: {key_result['error']}")
        print(f"💡 Solution: {key_result['solution']}")
        return
    
    print()
    
    # Test chat request
    print("💬 TESTING CHAT REQUEST...")
    chat_result = await test_simple_chat_request(api_key)
    
    if chat_result["success"]:
        print(f"✅ {chat_result['message']}")
        print(f"🤖 Response: '{chat_result['response_content']}'")
        print(f"📊 Usage: {chat_result['usage']}")
    else:
        print(f"❌ Chat test failed: {chat_result['error']}")
        print(f"💡 Solution: {chat_result['solution']}")
    
    print()
    print("🏁 DIAGNOSTICS COMPLETE")
    
    if not chat_result["success"] and "rate limit" in chat_result["error"].lower():
        print()
        print("🚨 RATE LIMIT DETECTED - MOST COMMON ISSUE!")
        print("   • Google AI Studio free tier has very low limits")
        print("   • Wait 5-10 minutes before trying again")
        print("   • Consider upgrading to paid tier for higher limits")
        print("   • Check your usage at: https://aistudio.google.com/app/apikey")


if __name__ == "__main__":
    # Example usage - set your API key as environment variable
    print("To test your Google AI Studio setup, set your API key as environment variable:")
    print("export GOOGLE_AI_STUDIO_API_KEY='your_api_key_here'")
    print("Then run: python google_ai_studio_diagnostics.py")
    print()
    
    api_key = os.environ.get("GOOGLE_AI_STUDIO_API_KEY")
    if api_key:
        asyncio.run(run_diagnostics())
    else:
        print_setup_instructions()
