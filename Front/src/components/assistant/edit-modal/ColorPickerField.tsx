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

// Comprehensive color palette organized by theme
const COLOR_PALETTE = {
  'Blues': ['#3B82F6', '#1E40AF', '#1D4ED8', '#2563EB', '#60A5FA', '#93C5FD'],
  'Greens': ['#10B981', '#059669', '#047857', '#065F46', '#34D399', '#6EE7B7'],
  'Purples': ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#A78BFA', '#C4B5FD'],
  'Reds': ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#F87171', '#FCA5A5'],
  'Oranges': ['#F97316', '#EA580C', '#C2410C', '#9A3412', '#FB923C', '#FDBA74'],
  'Yellows': ['#EAB308', '#CA8A04', '#A16207', '#854D0E', '#FACC15', '#FDE047'],
  'Grays': ['#6B7280', '#4B5563', '#374151', '#1F2937', '#9CA3AF', '#D1D5DB'],
  'Teals': ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#5EEAD4', '#99F6E4']
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

  const selectedColorName = Object.entries(COLOR_PALETTE)
    .flatMap(([theme, colors]) => colors.map(color => ({ color, theme })))
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
          w-full flex items-center justify-between px-4 py-3 
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
            {selectedColorName ? selectedColorName.theme : 'Select Color'}
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
            {Object.entries(COLOR_PALETTE).map(([themeName, colors]) => (
              <div key={themeName} className="mb-4 last:mb-0">
                <h4 className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">
                  {themeName}
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      className={`
                        relative w-8 h-8 rounded-lg border-2 transition-all duration-200 
                        hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30
                        ${value === color 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-white/20 hover:border-white/40'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    >
                      {value === color && (
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
 * 🎨 **Organized Palette**: Colors grouped by themes for better UX
 * 🌙 **Dark Theme**: Matches app's glassmorphism and dark aesthetic
 * 📱 **Responsive Design**: Works on all screen sizes
 * ♿ **Accessibility**: Proper focus states and keyboard navigation
 * 🔄 **Smooth Animations**: Subtle transitions for better feel
 * ✅ **Visual Feedback**: Selected color clearly indicated
 * 🎯 **Click Outside**: Dropdown closes when clicking elsewhere
 * 
 * **Removed Features** (as requested):
 * ❌ Hex input field
 * ❌ Random color button  
 * ❌ Excessive explanatory text
 * ❌ Multiple rows of scattered colors
 */
