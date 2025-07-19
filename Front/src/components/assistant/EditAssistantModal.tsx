// ✏️ Redesigned Assistant Edit Modal
// Sleek, minimalist modal matching the app's dark theme aesthetic
// Improved layout, spacing, and visual hierarchy

import React, { useEffect } from 'react';
import { Assistant } from '../../types/assistant';
import { hasValidationErrors } from '../../types/assistant';
import {
  ModalHeader,
  LoadingState,
  SuccessState,
  BasicInformationSection,
  SystemPromptSection,
  FormActions,
  useEditAssistantForm
} from './edit-modal';
import { FileManagementSection } from './edit-modal/FileManagementSection';

interface EditAssistantModalProps {
  isOpen: boolean;
  assistant: Assistant | null;
  onClose: () => void;
  onAssistantUpdated: () => void;
}

/**
 * EditAssistantModal Component
 * 
 * 🎨 REDESIGNED: Expanded Modal with Better Fitting
 * ===============================================
 * - Much larger modal (max-w-7xl) for comfortable editing
 * - Enhanced spacing and padding throughout
 * - Improved form layout with 4-column grid
 * - Better input field sizing and comfort
 * - Larger textarea areas for system prompts
 * - Dark glassmorphism theme matching main app
 * - Improved visual hierarchy and content organization
 */
export const EditAssistantModal: React.FC<EditAssistantModalProps> = ({
  isOpen,
  assistant,
  onClose,
  onAssistantUpdated
}) => {

  // Custom hook containing all form logic
  const {
    formData,
    originalData,
    validationErrors,
    isSubmitting,
    submitSuccess,
    submitError,
    isLoading,
    nameLength,
    descriptionLength,
    systemPromptLength,
    showFileManagement,
    setShowFileManagement,
    handleInputChange,
    handleSubmit,
    resetForm,
    validateField,
    toggleFileManagement,
    hasFormChanged,
    canSubmit
  } = useEditAssistantForm({
    isOpen,
    assistant,
    onAssistantUpdated,
    onClose
  });

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if modal is closed
  if (!isOpen || !assistant) return null;

  return (
    <>
      {/* Enhanced Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-7xl mx-auto">
          
          {/* Main Modal */}
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{ backgroundColor: assistant.color || '#6B7280' }}
                  />
                  <h2 className="text-xl font-semibold text-white">
                    Edit Assistant
                  </h2>
                  {hasFormChanged() && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      Modified
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {isLoading ? (
                <LoadingState />
              ) : submitSuccess ? (
                <SuccessState assistantName={formData.name} />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Basic Information Section */}
                  <BasicInformationSection
                    formData={formData}
                    originalData={originalData}
                    validationErrors={validationErrors}
                    nameLength={nameLength}
                    descriptionLength={descriptionLength}
                    onInputChange={handleInputChange}
                    onFieldBlur={validateField}
                  />

                  {/* System Prompt Section */}
                  <SystemPromptSection
                    formData={formData}
                    originalData={originalData}
                    validationErrors={validationErrors}
                    systemPromptLength={systemPromptLength}
                    onInputChange={handleInputChange}
                    onFieldBlur={validateField}
                  />

                  {/* File Management Section */}
                  <FileManagementSection
                    assistantId={assistant.id}
                    assistantName={assistant.name}
                    isVisible={showFileManagement}
                    onToggle={toggleFileManagement}
                  />

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={!hasFormChanged() || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white/70 bg-transparent border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {submitError && (
                        <span className="text-sm text-red-400">
                          Save failed
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={!hasFormChanged() || hasValidationErrors(validationErrors) || isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {isSubmitting && (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                        )}
                        <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * 🎨 EXPANDED Modal Features:
 * ==========================
 * 
 * ✨ **Much Larger Modal**: Max width increased to 7xl (1280px) for comfortable editing
 * 📏 **4-Column Grid Layout**: Better organization with xl:grid-cols-4 for optimal space usage
 * 📝 **Enhanced Input Areas**: Larger padding (px-5 py-4) and base text size for better comfort
 * 📄 **Bigger Textarea**: Increased rows (10) and min-height (120px) for system prompts
 * 📊 **Better Spacing**: Increased padding and margins throughout (p-6, p-8, space-y-8)
 * 🌙 **Dark Theme**: Full glassmorphism with gray-900 background
 * 🎯 **Better Header**: Enhanced padding and gradient header with assistant color indicator
 * 📱 **Improved Layout**: Professional spacing, padding, and visual hierarchy
 * 🚀 **Enhanced Backdrop**: Stronger blur and overlay for focus
 * ♿ **Better Actions**: Clearer button placement and states with more spacing
 * 🔄 **Smooth Animations**: Better transitions and hover effects
 * 📄 **Less Clutter**: Cleaner, more organized content sections
 * 
 * **Size & Layout Improvements**:
 * - Modal width: 896px → 1280px (43% larger!)
 * - Input padding: px-4 py-3 → px-5 py-4 (more comfortable)
 * - Font size: text-sm → text-base (better readability)
 * - Grid layout: 3-column → 4-column (better space utilization)
 * - Section spacing: space-y-6 → space-y-8 (cleaner separation)
 * - Everything fits properly now! 🎉
 */
