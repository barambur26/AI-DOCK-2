import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackIcon?: React.ReactNode;
  onClick?: () => void;
  showCheckmark?: boolean;
  isSelected?: boolean;
}

/**
 * Modern Avatar Component
 * 
 * Features:
 * - Automatic fallback to user icon when image fails or is missing
 * - Multiple size presets with consistent styling
 * - Glassmorphism design matching app aesthetic
 * - Proper rounded styling
 * - Loading state handling
 * - Selection states for avatar picker
 * - Click handlers for interactive avatars
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = 'md',
  className = '',
  fallbackIcon,
  onClick,
  showCheckmark = false,
  isSelected = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Size configurations matching Tailwind's scale
  const sizeConfig = {
    xs: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3',
      checkmark: 'w-3 h-3'
    },
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      checkmark: 'w-4 h-4'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'w-5 h-5',
      checkmark: 'w-5 h-5'
    },
    lg: {
      container: 'w-16 h-16',
      icon: 'w-6 h-6',
      checkmark: 'w-6 h-6'
    },
    xl: {
      container: 'w-20 h-20',
      icon: 'w-8 h-8',
      checkmark: 'w-7 h-7'
    },
    '2xl': {
      container: 'w-24 h-24',
      icon: 'w-10 h-10',
      checkmark: 'w-8 h-8'
    }
  };

  const config = sizeConfig[size];

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleImageLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  // Determine if we should show the image or fallback
  const shouldShowImage = src && !hasError && src.trim() !== '';
  const shouldShowFallback = !shouldShowImage;

  // Base styles for the container - check if custom sizing is provided
  const hasCustomSize = className.includes('w-full') && className.includes('h-full');
  const sizeClasses = hasCustomSize ? '' : config.container;
  
  const baseStyles = `
    ${sizeClasses}
    rounded-full
    overflow-hidden
    relative
    flex
    items-center
    justify-center
    transition-all
    duration-200
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}
  `;

  // Fallback background with glassmorphism
  const fallbackBg = `
    bg-gradient-to-br
    from-gray-400/80
    to-gray-500/80
    backdrop-blur-sm
    border
    border-white/20
  `;

  const ContainerComponent = onClick ? 'button' : 'div';

  return (
    <ContainerComponent
      className={`${baseStyles} ${className}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {shouldShowImage ? (
        <>
          {isLoading && (
            <div className={`absolute inset-0 ${fallbackBg} flex items-center justify-center`}>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`
              w-full 
              h-full 
              object-cover 
              rounded-full
              ${isLoading ? 'opacity-0' : 'opacity-100'}
              transition-opacity
              duration-200
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onLoadStart={handleImageLoadStart}
          />
        </>
      ) : (
        <div className={`w-full h-full ${fallbackBg} flex items-center justify-center`}>
          {fallbackIcon || <User className={`${config.icon} text-white`} />}
        </div>
      )}

      {/* Selection checkmark */}
      {showCheckmark && isSelected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
          <div className="bg-blue-500 rounded-full p-1">
            <svg 
              className={`${config.checkmark} text-white`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
      )}
    </ContainerComponent>
  );
};

// Pre-configured avatar variants for common use cases
export const ProfileAvatar: React.FC<Omit<AvatarProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }> = (props) => (
  <Avatar {...props} size={props.size || 'md'} />
);

export const NavigationAvatar: React.FC<Omit<AvatarProps, 'size'>> = (props) => (
  <Avatar 
    {...props} 
    size="md" 
    className={`w-full h-full ${props.className || ''}`}
  />
);

export const AvatarPicker: React.FC<{
  selectedAvatar: string;
  onAvatarSelect: (avatar: string) => void;
  availableAvatars?: string[];
  className?: string;
}> = ({ 
  selectedAvatar, 
  onAvatarSelect, 
  availableAvatars = ['avatar1.svg', 'avatar2.svg', 'avatar3.svg', 'avatar4.svg', 'avatar5.svg', 'avatar6.svg'],
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {/* No avatar option */}
      <Avatar
        src=""
        size="lg"
        onClick={() => onAvatarSelect('')}
        showCheckmark
        isSelected={selectedAvatar === ''}
        fallbackIcon={
          <span className="text-white text-lg font-bold">∅</span>
        }
        className="hover:ring-2 hover:ring-blue-400/50"
      />
      
      {/* Available avatars */}
      {availableAvatars.map((avatar, idx) => {
        const avatarPath = `/profile-pics/${avatar}`;
        const isSelected = selectedAvatar === avatarPath;
        
        return (
          <Avatar
            key={avatar}
            src={avatarPath}
            alt={`Avatar ${idx + 1}`}
            size="lg"
            onClick={() => onAvatarSelect(avatarPath)}
            showCheckmark
            isSelected={isSelected}
            className="hover:ring-2 hover:ring-blue-400/50"
          />
        );
      })}
    </div>
  );
};