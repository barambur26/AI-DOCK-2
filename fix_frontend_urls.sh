#!/bin/bash

# Fix Frontend URLs Script
# This script replaces hardcoded Netlify URLs with Railway backend URLs

echo "🔧 Fixing hardcoded URLs in frontend files..."

# Find all TypeScript/JavaScript files in Front/src that contain the hardcoded URL
find Front/src -name "*.ts" -o -name "*.tsx" | while read file; do
    echo "Processing: $file"
    
    # Replace the hardcoded Netlify URL with Railway URL
    sed -i '' 's|https://idyllic-moxie-aedb62\.netlify\.app/0|https://ai-dock-2-production.up.railway.app|g' "$file"
done

echo "✅ URL replacement completed!"
echo ""
echo "📋 Summary of changes:"
echo "- Replaced hardcoded Netlify URLs with Railway backend URLs"
echo "- Frontend will now make API calls to the correct backend"
echo "- Environment variable VITE_API_URL will still take precedence"
echo ""
echo "🚀 Next steps:"
echo "1. Commit these changes"
echo "2. Redeploy to Railway"
echo "3. The healthcheck should now pass" 