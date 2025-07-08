// 🎨 Color Picker Field Component
// Specialized form field for selecting assistant colors
// Uses predefined palette and supports custom hex input

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { 
  ASSISTANT_COLOR_PALETTE, 
  getRandomAssistantColor, 
  isValidHexColor 
} from '../../../types/assistant';

interface ColorPickerFieldProps {
  value: string;
  hasError: boolean;
  hasChanged: boolean;
  validationErrors: string[];
  onChange: (value: string) => void;
  onBlur: () => void;
}

/**
 * ColorPickerField Component
 * 
 * 🎓 LEARNING: Specialized Form Component
 * ======================================
 * - Purpose-built for color selection
 * - Combines palette selection with custom input
 * - Maintains consistency with form field patterns
 * - Provides visual feedback and validation
 */
export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  hasError,
  hasChanged,
  validationErrors,
  onChange,
  onBlur
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Assistant Color
        <span className="ml-2 text-xs text-gray-500">
          Choose a color for visual identification
        </span>
        {hasChanged && (
          <span className="ml-2 text-xs text-blue-600 font-medium">
            • Modified
          </span>
        )}
      </label>
      
      {/* Color palette grid */}
      <div className="grid grid-cols-8 gap-2 mb-3">
        {ASSISTANT_COLOR_PALETTE.map((color, index) => (
          <button
            key={`color-${index}-${color}`}
            type="button"
            onClick={() => onChange(color)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${value === color 
                ? 'border-gray-800 shadow-lg scale-110' 
                : 'border-gray-300 hover:border-gray-500'
              }
            `}
            style={{ backgroundColor: color }}
            title={`Select color ${color}`}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      
      {/* Custom color input and controls */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="#3B82F6"
            pattern="^#[0-9A-Fa-f]{6}$"
            className={`
              w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition-colors text-sm
              ${hasError
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
              }
            `}
            aria-label="Custom hex color code"
          />
        </div>
        
        {/* Color preview */}
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
          style={{ backgroundColor: isValidHexColor(value) ? value : '#E5E7EB' }}
          title="Color preview"
          aria-label="Color preview"
        />
        
        {/* Random color button */}
        <button
          type="button"
          onClick={() => onChange(getRandomAssistantColor())}
          className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Generate random color"
          aria-label="Generate random color"
        >
          🎲 Random
        </button>
      </div>
      
      {/* Validation errors */}
      {hasError && validationErrors.length > 0 && (
        <div className="mt-1">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 🎨 Component Features:
 * =====================
 * 
 * 1. **Palette Selection**: Grid of predefined professional colors
 * 2. **Custom Input**: Text field for custom hex codes with validation
 * 3. **Visual Preview**: Real-time color preview bubble
 * 4. **Random Generator**: Quick way to try different colors
 * 5. **Validation**: Error display and visual feedback
 * 6. **Accessibility**: Proper ARIA labels and keyboard navigation
 * 7. **Change Detection**: Visual indicator when value differs from original
 * 
 * Usage Examples:
 * ===============
 * 
 * ```tsx
 * <ColorPickerField
 *   value={formData.color}
 *   hasError={hasFieldError('color')}
 *   hasChanged={hasFieldChanged('color')}
 *   validationErrors={getFieldErrors('color')}
 *   onChange={(value) => onInputChange('color', value)}
 *   onBlur={() => onFieldBlur('color')}
 * />
 * ```
 */
