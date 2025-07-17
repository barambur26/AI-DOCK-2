// 🎨 Custom Logo Loading Animation Component
// Branded loading animation using actual company logo images

import React from 'react';

/**
 * LogoLoader Component
 * 
 * Learning: This creates a custom loading animation using the actual company logo images
 * with smooth rotation and scaling effects that match the app's styling patterns.
 * 
 * Design Pattern: Uses the actual logo image files with CSS animations for perfect
 * brand consistency and professional appearance.
 */

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'blue' | 'white' | 'black';
  className?: string;
  showText?: boolean;
  text?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = 'md',
  variant = 'blue',
  className = '',
  showText = false,
  text = 'Loading...'
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      textSize: 'text-xs'
    },
    md: {
      container: 'w-12 h-12',
      textSize: 'text-sm'
    },
    lg: {
      container: 'w-16 h-16',
      textSize: 'text-base'
    },
    xl: {
      container: 'w-24 h-24',
      textSize: 'text-lg'
    }
  };

  // Logo variant images - always using blue logo as requested
  // Note: All variants now use logo-blue.svg for consistency
  const logoImages = {
    blue: '/logos/logo-blue.svg',
    white: '/logos/logo-blue.svg',
    black: '/logos/logo-blue.svg'
  };

  const config = sizeConfig[size];
  const logoSrc = logoImages[variant];

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      
      {/* Logo Animation Container */}
      <div className={`relative ${config.container} logo-loader`}>
        
        {/* Actual Logo Image */}
        <img 
          src={logoSrc}
          alt="AI Dock Logo"
          className={`
            w-full h-full object-contain
            logo-image
            drop-shadow-lg
          `}
          draggable={false}
        />
        
        {/* Optional glowing effect ring */}
        <div 
          className={`
            absolute inset-0 ${config.container}
            rounded-xl
            ${variant === 'blue' ? 'ring-2 ring-blue-400/30' : 
              variant === 'white' ? 'ring-2 ring-white/30' : 
              'ring-2 ring-gray-400/30'}
            logo-glow-ring
          `}
        />
        
      </div>

      {/* Optional loading text */}
      {showText && (
        <div className={`${config.textSize} font-medium text-blue-200 animate-pulse`}>
          {text}
        </div>
      )}

    </div>
  );
};

export default LogoLoader;
