// 🎯 Redesigned System Prompt Form Section
// Dark theme system prompt configuration
// Matches the app's glassmorphism aesthetic

import React from 'react';
import { Settings } from 'lucide-react';
import { FormField } from './FormField';
import { AssistantFormData, ASSISTANT_VALIDATION } from '../../../types/assistant';

interface SystemPromptSectionProps {
  formData: AssistantFormData;
  originalData: AssistantFormData;
  validationErrors: Record<string, string[]>;
  systemPromptLength: number;
  onInputChange: (field: keyof AssistantFormData, value: any) => void;
  onFieldBlur: (fieldName: keyof AssistantFormData) => void;
}

/**
 * SystemPromptSection Component
 * 
 * 🎨 REDESIGNED: Dark Theme System Prompt Section
 * =============================================
 * - Dark glassmorphism styling
 * - Better visual hierarchy and spacing
 * - Improved typography and contrast
 * - Consistent with app's aesthetic
 */
export const SystemPromptSection: React.FC<SystemPromptSectionProps> = ({
  formData,
  originalData,
  validationErrors,
  systemPromptLength,
  onInputChange,
  onFieldBlur
}) => {

  /**
   * Check if system prompt field has changed from original value
   */
  const hasFieldChanged = (): boolean => {
    return (formData.system_prompt || '') !== (originalData.system_prompt || '');
  };

  /**
   * Check if system prompt field has validation errors
   */
  const hasFieldError = (): boolean => {
    return validationErrors.system_prompt?.length > 0;
  };

  /**
   * Get validation errors for system prompt field
   */
  const getFieldErrors = (): string[] => {
    return validationErrors.system_prompt || [];
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-5">
        <Settings className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-medium text-white/90">System Prompt</h3>
      </div>
      
      {/* System Prompt Textarea */}
      <FormField
        name="system_prompt"
        label="Instructions"
        type="textarea"
        value={formData.system_prompt || ''}
        placeholder="Define how your assistant should behave, its personality, expertise, and response style..."
        required={true}
        maxLength={ASSISTANT_VALIDATION.SYSTEM_PROMPT.MAX_LENGTH}
        currentLength={systemPromptLength}
        hasError={hasFieldError()}
        hasChanged={hasFieldChanged()}
        validationErrors={getFieldErrors()}
        rows={10}
        onChange={(value) => onInputChange('system_prompt', value)}
        onBlur={() => onFieldBlur('system_prompt')}
      />
    </div>
  );
};

/**
 * 🎨 Redesigned Features:
 * ======================
 * 
 * ✨ **Dark Theme**: Glassmorphism background matching app style
 * 🎯 **Better Layout**: Consistent with other sections
 * 🌟 **Visual Hierarchy**: Clear section header with icon
 * 📏 **Improved Spacing**: Better padding and margins
 * 📱 **Larger Textarea**: More rows for better editing experience
 * ♿ **Accessibility**: Proper contrast and focus states
 * 🔄 **Consistent**: Matches the overall modal design
 * 
 * **Visual Improvements**:
 * - Glassmorphism panel background
 * - Better icon color (green for system/settings)
 * - Consistent spacing with other sections
 * - Improved label (changed from "System Prompt" to "Instructions")
 * - More comfortable editing area
 */
