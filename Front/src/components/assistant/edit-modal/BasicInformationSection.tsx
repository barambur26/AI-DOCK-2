// 📝 Redesigned Basic Information Form Section
// Dark theme form section with improved layout and styling
// Matches the app's glassmorphism aesthetic

import React from 'react';
import { Wand2 } from 'lucide-react';
import { FormField } from './FormField';
import { ColorPickerField } from './ColorPickerField';
import { AssistantFormData, ASSISTANT_VALIDATION } from '../../../types/assistant';

interface BasicInformationSectionProps {
  formData: AssistantFormData;
  originalData: AssistantFormData;
  validationErrors: Record<string, string[]>;
  nameLength: number;
  descriptionLength: number;
  onInputChange: (field: keyof AssistantFormData, value: any) => void;
  onFieldBlur: (fieldName: keyof AssistantFormData) => void;
}

/**
 * BasicInformationSection Component
 * 
 * 🎨 REDESIGNED: Dark Theme Form Section
 * ====================================
 * - Dark glassmorphism styling
 * - Better grid layout for larger modal
 * - Improved spacing and typography
 * - Consistent with app's aesthetic
 */
export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  formData,
  originalData,
  validationErrors,
  nameLength,
  descriptionLength,
  onInputChange,
  onFieldBlur
}) => {

  /**
   * Check if a field has changed from original value
   */
  const hasFieldChanged = (field: keyof AssistantFormData): boolean => {
    return (formData[field] || '') !== (originalData[field] || '');
  };

  /**
   * Check if a field has validation errors
   */
  const hasFieldError = (field: keyof AssistantFormData): boolean => {
    return validationErrors[field]?.length > 0;
  };

  /**
   * Get validation errors for a field
   */
  const getFieldErrors = (field: keyof AssistantFormData): string[] => {
    return validationErrors[field] || [];
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-5">
        <Wand2 className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white/90">Basic Information</h3>
      </div>
      
      {/* Form Fields Grid - Improved layout for larger modal */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Assistant Name Field - Takes 3 columns on extra large screens */}
        <div className="xl:col-span-3">
          <FormField
            name="name"
            label="Assistant Name"
            type="text"
            value={formData.name || ''}
            placeholder='e.g., "Research Assistant"'
            required={true}
            maxLength={ASSISTANT_VALIDATION.NAME.MAX_LENGTH}
            currentLength={nameLength}
            hasError={hasFieldError('name')}
            hasChanged={hasFieldChanged('name')}
            validationErrors={getFieldErrors('name')}
            onChange={(value) => onInputChange('name', value)}
            onBlur={() => onFieldBlur('name')}
          />
        </div>
        
        {/* Color Picker Field - Takes 1 column */}
        <div className="xl:col-span-1">
          <ColorPickerField
            value={formData.color || ''}
            hasError={hasFieldError('color')}
            hasChanged={hasFieldChanged('color')}
            validationErrors={getFieldErrors('color')}
            onChange={(value) => onInputChange('color', value)}
            onBlur={() => onFieldBlur('color')}
          />
        </div>
        
        {/* Description Field - Takes all 4 columns */}
        <div className="xl:col-span-4">
          <FormField
            name="description"
            label="Description"
            type="text"
            value={formData.description || ''}
            placeholder="Brief description of your assistant's purpose"
            required={false}
            maxLength={ASSISTANT_VALIDATION.DESCRIPTION.MAX_LENGTH}
            currentLength={descriptionLength}
            hasError={hasFieldError('description')}
            hasChanged={hasFieldChanged('description')}
            validationErrors={getFieldErrors('description')}
            onChange={(value) => onInputChange('description', value)}
            onBlur={() => onFieldBlur('description')}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * 🎨 EXPANDED Layout Features:
 * ===========================
 * 
 * ✨ **Dark Theme**: Glassmorphism background matching app style
 * 📏 **4-Column Grid**: Expanded from 3 to 4 columns for better space usage
 * 🎯 **Enhanced Spacing**: Increased padding (p-6) and gaps (gap-6)
 * 🌟 **Visual Hierarchy**: Clear section header with icon
 * 📱 **Responsive**: Adapts to different screen sizes (xl: breakpoint)
 * ♿ **Accessibility**: Proper contrast and focus states
 * 🔄 **Consistent**: Matches the overall modal design
 * 
 * **Layout Improvements**:
 * - Name field takes 3 columns (even more space for longer names)
 * - Color picker takes 1 column (perfect for dropdown)
 * - Description spans full 4 columns (maximum space for text)
 * - Better visual grouping with background panel
 * - Larger gaps and padding for comfortable editing
 */
