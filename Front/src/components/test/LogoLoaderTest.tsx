// 🧪 Logo Loader Test Component
// Use this to test the logo loading animation in your React app

import React, { useState } from 'react';
import { LogoLoader } from '../ui';

/**
 * LogoLoaderTest Component
 * 
 * This is a test component to verify the LogoLoader works correctly
 * with your actual logo images. You can temporarily add this to any
 * page to see the different variations in action.
 */

const LogoLoaderTest: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [selectedVariant, setSelectedVariant] = useState<'blue' | 'white' | 'black'>('blue');
  const [showText, setShowText] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🧪 Logo Loader Test
          </h1>
          <p className="text-blue-200">
            Test your custom logo loading animation with different configurations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 mb-8 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="sm">Small (sm)</option>
                <option value="md">Medium (md)</option>
                <option value="lg">Large (lg)</option>
                <option value="xl">Extra Large (xl)</option>
              </select>
            </div>

            {/* Variant Control */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Variant
              </label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="blue">Blue (Primary)</option>
                <option value="white">White (Alternative)</option>
                <option value="black">Black (Dark Mode)</option>
              </select>
            </div>

            {/* Text Control */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Show Text
              </label>
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-white text-sm">Show loading text</span>
              </label>
            </div>

          </div>
        </div>

        {/* Logo Display */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
          <div className="flex items-center justify-center min-h-[200px]">
            <LogoLoader
              size={selectedSize}
              variant={selectedVariant}
              showText={showText}
              text="Loading your data..."
              className=""
            />
          </div>
          
          {/* Configuration Display */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">Current Configuration:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-blue-200">Size:</span>
                <span className="text-white ml-2 font-medium">{selectedSize}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-blue-200">Variant:</span>
                <span className="text-white ml-2 font-medium">{selectedVariant}</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-blue-200">Text:</span>
                <span className="text-white ml-2 font-medium">{showText ? 'Shown' : 'Hidden'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-white mb-4">Usage Examples:</h3>
          <div className="space-y-4 text-sm">
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Header Refresh Indicator:</div>
              <code className="text-green-300">
                &lt;LogoLoader size="sm" variant="blue" /&gt;
              </code>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Component Loading State:</div>
              <code className="text-green-300">
                &lt;LogoLoader size="md" variant="blue" showText text="Loading..." /&gt;
              </code>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-blue-300 mb-2">Full Page Loading:</div>
              <code className="text-green-300">
                &lt;LogoLoader size="xl" variant="blue" showText text="Loading usage analytics..." /&gt;
              </code>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default LogoLoaderTest;
