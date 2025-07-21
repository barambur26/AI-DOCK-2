#!/bin/bash
# Make the verification script executable and run it

echo "🔧 Making verification script executable..."
chmod +x /Users/blas/Desktop/INRE/INRE-DOCK-2/Back/verify_request_prompt.py

echo "🧪 Running verification tests..."
python3 /Users/blas/Desktop/INRE/INRE-DOCK-2/Back/verify_request_prompt.py

echo "✅ Verification complete!"
