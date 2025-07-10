#!/bin/bash
# Clean up git repository and remove large files

echo "🧹 Cleaning up git repository..."

# Navigate to project root
cd /Users/blas/Desktop/INRE/INRE-DOCK-2

# Remove large files from git tracking
echo "📂 Removing large files from git..."
git rm --cached ai_dock_dev.db 2>/dev/null || echo "ai_dock_dev.db not tracked"
git rm --cached Back/ai_dock_dev.db 2>/dev/null || echo "Back/ai_dock_dev.db not tracked"
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules not tracked"
git rm -r --cached Back/node_modules/ 2>/dev/null || echo "Back/node_modules not tracked"
git rm -r --cached node_modules_disabled/ 2>/dev/null || echo "node_modules_disabled not tracked"
git rm -r --cached Back/node_modules.disabled/ 2>/dev/null || echo "Back/node_modules.disabled not tracked"

# Remove .DS_Store files
echo "🗑️ Removing .DS_Store files..."
find . -name ".DS_Store" -type f -delete
git rm --cached .DS_Store 2>/dev/null || echo ".DS_Store not tracked"
git rm --cached "*/.DS_Store" 2>/dev/null || echo "Subdirectory .DS_Store files not tracked"

# Add changes to gitignore compliance
echo "✅ Staging gitignore compliance..."
git add .gitignore
git add -A

# Create commit
echo "💾 Committing cleanup..."
git commit -m "🧹 Clean up: Remove large files and enforce gitignore

- Remove database files from tracking
- Remove node_modules from tracking  
- Remove .DS_Store files
- Prepare for Railway deployment"

echo "🚀 Repository cleaned! Ready to push."
