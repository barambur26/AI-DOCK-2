// 🔧 Redesigned Form Field Component
// Dark theme form input with glassmorphism styling
// Matches the app's sleek, minimalist aesthetic

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  value: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  hasError: boolean;
  hasChanged: boolean;
  validationErrors: string[];
  rows?: number;
  onChange: (value: string) => void;
  onBlur: () => void;
}

/**
 * FormField Component
 * 
 * 🎨 REDESIGNED: Dark Theme Form Input
 * ==================================
 * - Dark glassmorphism styling
 * - Better visual states and feedback
 * - Improved typography and spacing
 * - Consistent with app's aesthetic
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  placeholder,
  required = false,
  maxLength,
  currentLength,
  hasError,
  hasChanged,
  validationErrors,
  rows = 4,
  onChange,
  onBlur
}) => {

  /**
   * Get input styling based on state
   */
  const getInputClassName = () => {
    const baseClasses = `
      w-full px-5 py-4 
      bg-white/10 backdrop-blur-md 
      border border-white/20 rounded-xl 
      text-white/90 placeholder-white/40
      focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
      transition-all duration-200
      text-base
    `;
    
    if (hasError) {
      return `${baseClasses} border-red-400/50 focus:border-red-400/70 focus:ring-red-500/30`;
    }
    
    if (hasChanged) {
      return `${baseClasses} border-blue-400/50 bg-blue-500/10`;
    }
    
    return baseClasses;
  };

  /**
   * Get character counter styling
   */
  const getCounterClassName = () => {
    if (maxLength && currentLength !== undefined && currentLength > maxLength) {
      return 'text-red-400';
    }
    return 'text-white/50';
  };

  return (
    <div>
      {/* Label with indicators */}
      <label className="block text-sm font-medium text-white/90 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {hasChanged && (
          <span className="ml-2 text-xs text-blue-400 font-medium">
            • Modified
          </span>
        )}
        {maxLength && currentLength !== undefined && (
          <span className={`ml-2 text-xs ${getCounterClassName()}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </label>
      
      {/* Input field */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={rows}
            className={`${getInputClassName()} resize-vertical min-h-[120px]`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            className={getInputClassName()}
          />
        )}
      </div>
      
      {/* Validation errors */}
      {hasError && validationErrors.length > 0 && (
        <div className="mt-2">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 🎨 ENHANCED Input Features:
 * ===========================
 * 
 * ✨ **Dark Theme**: Glassmorphism background with proper contrast
 * 🎯 **Larger Padding**: More comfortable input areas (px-5 py-4)
 * 📝 **Better Font Size**: Increased from text-sm to text-base for readability
 * 📏 **Bigger Textarea**: Increased min-height from 100px to 120px
 * 🌟 **Visual States**: Clear indication of errors, changes, focus
 * 📱 **Improved Typography**: Better font sizes and spacing
 * ♿ **Accessibility**: Proper contrast ratios for white text
 * 🔄 **Smooth Transitions**: Better hover and focus animations
 * 📄 **Cleaner Labels**: Less clutter, better visual hierarchy
 * 
 * **Sizing Improvements**:
 * - Input padding: px-4 py-3 → px-5 py-4 (more comfortable)
 * - Font size: text-sm → text-base (better readability)
 * - Textarea min-height: 100px → 120px (more editing space)
 * - Glassmorphism backgrounds with better blur effects
 * - Improved placeholder and text colors
 * - More professional error styling
 * - Consistent with app's expanded design
 */
