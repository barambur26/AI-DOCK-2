#!/bin/bash

# AI Dock Claude Code Setup Script
# Makes custom commands executable and provides setup instructions

echo "🚀 Setting up AI Dock for Claude Code..."

# Make all custom commands executable
chmod +x /Users/blas/Desktop/INRE/INRE-DOCK-2/.claude/commands/*

echo "✅ Custom commands made executable:"
ls -la /Users/blas/Desktop/INRE/INRE-DOCK-2/.claude/commands/

echo ""
echo "🎯 AI Dock Claude Code Setup Complete!"
echo ""
echo "📋 Available Custom Commands:"
echo "  /ai-dock:add-endpoint <name> <description>     - Create complete backend API endpoint"
echo "  /ai-dock:add-component <name> <type> <location> - Create React component with patterns"
echo "  /ai-dock:add-llm-provider <provider-name>      - Add new LLM provider integration"
echo "  /ai-dock:debug-issue <type> <description>      - Systematic debugging workflow"
echo "  /ai-dock:modularize-component <path> [size]    - Refactor to modular architecture"
echo ""
echo "🚀 Getting Started:"
echo "1. cd /Users/blas/Desktop/INRE/INRE-DOCK-2"
echo "2. claude"
echo "3. Use /ai-dock: commands for AI Dock specific tasks"
echo ""
echo "📖 Key Files:"
echo "  - CLAUDE.md                     - Project context and patterns"
echo "  - Helpers/project_integration_guide.md - Complete architecture guide"
echo "  - .claude/commands/             - Custom slash commands"
echo "  - .claude/mcp.json             - MCP server configuration"
echo ""
echo "🎉 Ready to build enterprise-grade features for AI Dock!"
