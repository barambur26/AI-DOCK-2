// 🎨 Redesigned Color Picker Field Component
// Minimalist color picker with dropdown design matching app aesthetic
// Single button interface with comprehensive color palette

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface ColorPickerFieldProps {
  value: string;
  hasError: boolean;
  hasChanged: boolean;
  validationErrors: string[];
  onChange: (value: string) => void;
  onBlur: () => void;
}

// Comprehensive color palette with unique names for each color
const COLOR_PALETTE = {
  'Blues': [
    { color: '#3B82F6', name: 'Ocean Blue' },
    { color: '#1E40AF', name: 'Deep Blue' },
    { color: '#1D4ED8', name: 'Royal Blue' },
    { color: '#2563EB', name: 'Classic Blue' },
    { color: '#60A5FA', name: 'Sky Blue' },
    { color: '#93C5FD', name: 'Light Blue' }
  ],
  'Greens': [
    { color: '#10B981', name: 'Emerald' },
    { color: '#059669', name: 'Forest Green' },
    { color: '#047857', name: 'Pine Green' },
    { color: '#065F46', name: 'Dark Green' },
    { color: '#34D399', name: 'Mint Green' },
    { color: '#6EE7B7', name: 'Light Green' }
  ],
  'Purples': [
    { color: '#8B5CF6', name: 'Violet' },
    { color: '#7C3AED', name: 'Purple' },
    { color: '#6D28D9', name: 'Deep Purple' },
    { color: '#5B21B6', name: 'Royal Purple' },
    { color: '#A78BFA', name: 'Lavender' },
    { color: '#C4B5FD', name: 'Light Purple' }
  ],
  'Reds': [
    { color: '#EF4444', name: 'Red' },
    { color: '#DC2626', name: 'Crimson' },
    { color: '#B91C1C', name: 'Dark Red' },
    { color: '#991B1B', name: 'Burgundy' },
    { color: '#F87171', name: 'Coral' },
    { color: '#FCA5A5', name: 'Rose' }
  ],
  'Oranges': [
    { color: '#F97316', name: 'Orange' },
    { color: '#EA580C', name: 'Dark Orange' },
    { color: '#C2410C', name: 'Burnt Orange' },
    { color: '#9A3412', name: 'Copper' },
    { color: '#FB923C', name: 'Peach' },
    { color: '#FDBA74', name: 'Light Orange' }
  ],
  'Yellows': [
    { color: '#EAB308', name: 'Golden' },
    { color: '#CA8A04', name: 'Amber' },
    { color: '#A16207', name: 'Dark Gold' },
    { color: '#854D0E', name: 'Bronze' },
    { color: '#FACC15', name: 'Yellow' },
    { color: '#FDE047', name: 'Light Yellow' }
  ],
  'Grays': [
    { color: '#6B7280', name: 'Gray' },
    { color: '#4B5563', name: 'Dark Gray' },
    { color: '#374151', name: 'Charcoal' },
    { color: '#1F2937', name: 'Slate' },
    { color: '#9CA3AF', name: 'Light Gray' },
    { color: '#D1D5DB', name: 'Silver' }
  ],
  'Teals': [
    { color: '#14B8A6', name: 'Teal' },
    { color: '#0D9488', name: 'Dark Teal' },
    { color: '#0F766E', name: 'Deep Teal' },
    { color: '#115E59', name: 'Forest Teal' },
    { color: '#5EEAD4', name: 'Aqua' },
    { color: '#99F6E4', name: 'Light Teal' }
  ]
};

/**
 * ColorPickerField Component
 * 
 * 🎨 REDESIGNED: Minimalist Single-Button Interface
 * ===============================================
 * - Single button that opens comprehensive color picker
 * - Organized color palette by themes
 * - Matches app's dark glassmorphism aesthetic  
 * - No hex input or random button (cleaner interface)
 * - Smooth animations and better UX
 */
export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  hasError,
  hasChanged,
  validationErrors,
  onChange,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const selectedColorInfo = Object.entries(COLOR_PALETTE)
    .flatMap(([theme, colors]) => colors.map(colorObj => ({ ...colorObj, theme })))
    .find(item => item.color === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-white/90 mb-2">
        Color
        {hasChanged && (
          <span className="ml-2 text-xs text-blue-400 font-medium">
            • Modified
          </span>
        )}
      </label>
      
      {/* Single Color Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-5 py-4 
          bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
          hover:bg-white/15 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          ${hasError ? 'border-red-400/50' : ''}
        `}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-6 h-6 rounded-lg border-2 border-white/30 shadow-lg"
            style={{ backgroundColor: value || '#6B7280' }}
          />
          <span className="text-white/90 font-medium">
            {selectedColorInfo ? selectedColorInfo.name : 'Select Color'}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Color Palette Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
            {Object.entries(COLOR_PALETTE).map(([themeName, colors]) => (
              <div key={themeName} className="mb-4 last:mb-0">
                <h4 className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                  {themeName}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((colorObj) => (
                    <button
                      key={colorObj.color}
                      type="button"
                      onClick={() => handleColorSelect(colorObj.color)}
                      className={`
                        relative w-8 h-8 rounded-lg border-2 transition-all duration-200 
                        hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30
                        ${value === colorObj.color 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-white/20 hover:border-white/40'
                        }
                      `}
                      style={{ backgroundColor: colorObj.color }}
                      title={`Select ${colorObj.name} (${colorObj.color})`}
                    >
                      {value === colorObj.color && (
                        <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Validation Errors */}
      {hasError && validationErrors.length > 0 && (
        <div className="mt-2">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠</span>
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

/**
 * 🎨 Component Features:
 * =====================
 * 
 * ✨ **Single Button Interface**: Clean, minimal design with one action
 * 🎨 **Organized Palette**: Colors grouped by themes with unique names
 * 🌙 **Dark Theme**: Matches app's glassmorphism and dark aesthetic
 * 📱 **Responsive Design**: Works on all screen sizes
 * ♿ **Accessibility**: Proper focus states and keyboard navigation
 * 🔄 **Smooth Animations**: Subtle transitions for better feel
 * ✅ **Visual Feedback**: Selected color clearly indicated with unique names
 * 🎯 **Click Outside**: Dropdown closes when clicking elsewhere
 * 🚀 **High Z-Index**: Dropdown appears above all modal content (z-9999)
 * 
 * **Removed Features** (as requested):
 * ❌ Hex input field
 * ❌ Random color button  
 * ❌ Excessive explanatory text
 * ❌ Multiple rows of scattered colors
 */
