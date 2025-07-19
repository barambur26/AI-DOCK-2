// 🎯 Assistant Edit Popup Component
// Large popup modal for comfortable assistant editing
// Replaces embedded sidebar editing with spacious modal interface

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Wand2, Settings, Save, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { Assistant, AssistantFormData, ASSISTANT_VALIDATION, hasValidationErrors } from '../../types/assistant';
import { assistantService } from '../../services/assistantService';

interface AssistantEditPopupProps {
  isOpen: boolean;
  assistantId: number | null;
  onClose: () => void;
  onSaved?: () => void;
}

/**
 * AssistantEditPopup Component
 * 
 * 🎯 LARGE POPUP MODAL for Assistant Editing
 * ==========================================
 * - Much larger interface than embedded sidebar
 * - Clean, spacious form layout with proper fitting
 * - Dark glassmorphism theme matching app aesthetic
 * - All form elements fit comfortably without overlap
 * - Better user experience for editing assistants
 */
export const AssistantEditPopup: React.FC<AssistantEditPopupProps> = ({
  isOpen,
  assistantId,
  onClose,
  onSaved
}) => {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [formData, setFormData] = useState<AssistantFormData>({
    name: '',
    description: '',
    system_prompt: '',
    color: '#3B82F6',
    is_active: true
  });
  const [originalData, setOriginalData] = useState<AssistantFormData>({
    name: '',
    description: '',
    system_prompt: '',
    color: '#3B82F6',
    is_active: true
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Color palette for color picker with specific names
  const COLOR_PALETTE = {
    'Blues': [
      { color: '#3B82F6', name: 'Sky Blue' },
      { color: '#1E40AF', name: 'Royal Blue' },
      { color: '#1D4ED8', name: 'Navy Blue' },
      { color: '#2563EB', name: 'Ocean Blue' },
      { color: '#60A5FA', name: 'Light Blue' },
      { color: '#93C5FD', name: 'Baby Blue' }
    ],
    'Greens': [
      { color: '#10B981', name: 'Emerald' },
      { color: '#059669', name: 'Forest Green' },
      { color: '#047857', name: 'Dark Green' },
      { color: '#065F46', name: 'Pine Green' },
      { color: '#34D399', name: 'Mint Green' },
      { color: '#6EE7B7', name: 'Seafoam' }
    ],
    'Purples': [
      { color: '#8B5CF6', name: 'Violet' },
      { color: '#7C3AED', name: 'Purple' },
      { color: '#6D28D9', name: 'Deep Purple' },
      { color: '#5B21B6', name: 'Dark Purple' },
      { color: '#A78BFA', name: 'Lavender' },
      { color: '#C4B5FD', name: 'Light Purple' }
    ],
    'Reds': [
      { color: '#EF4444', name: 'Red' },
      { color: '#DC2626', name: 'Crimson' },
      { color: '#B91C1C', name: 'Dark Red' },
      { color: '#991B1B', name: 'Burgundy' },
      { color: '#F87171', name: 'Light Red' },
      { color: '#FCA5A5', name: 'Pink Red' }
    ],
    'Oranges': [
      { color: '#F97316', name: 'Orange' },
      { color: '#EA580C', name: 'Dark Orange' },
      { color: '#C2410C', name: 'Burnt Orange' },
      { color: '#9A3412', name: 'Rust' },
      { color: '#FB923C', name: 'Light Orange' },
      { color: '#FDBA74', name: 'Peach' }
    ],
    'Yellows': [
      { color: '#EAB308', name: 'Yellow' },
      { color: '#CA8A04', name: 'Golden' },
      { color: '#A16207', name: 'Amber' },
      { color: '#854D0E', name: 'Dark Yellow' },
      { color: '#FACC15', name: 'Light Yellow' },
      { color: '#FDE047', name: 'Cream' }
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
      { color: '#5EEAD4', name: 'Light Teal' },
      { color: '#99F6E4', name: 'Mint Teal' }
    ]
  };

  // Load assistant data when modal opens
  useEffect(() => {
    if (isOpen && assistantId) {
      loadAssistant();
    }
  }, [isOpen, assistantId]);

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

  // Close color dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const colorButton = colorDropdownRef.current;
      const colorDropdown = document.querySelector('[data-color-dropdown]');
      
      // Check if click is outside both the color button and the dropdown
      if (colorButton && !colorButton.contains(target) && 
          colorDropdown && !colorDropdown.contains(target)) {
        setIsColorDropdownOpen(false);
      }
    };

    if (isColorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorDropdownOpen]);

  const loadAssistant = async () => {
    if (!assistantId) return;

    try {
      setIsLoading(true);
      const data = await assistantService.getAssistant(assistantId);
      setAssistant(data);
      
      const formValues: AssistantFormData = {
        name: data.name || '',
        description: data.description || '',
        system_prompt: data.system_prompt || '',
        color: data.color || '#3B82F6',
        is_active: data.is_active ?? true
      };
      
      setFormData(formValues);
      setOriginalData(formValues);
      setValidationErrors({});
      setSubmitError(null);
      setSubmitSuccess(false);
      
    } catch (error: any) {
      console.error('❌ Failed to load assistant:', error);
      setSubmitError(error.message || 'Failed to load assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof AssistantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleColorSelect = (color: string) => {
    handleInputChange('color', color);
    setIsColorDropdownOpen(false);
  };

  const hasFormChanged = () => {
    return Object.keys(formData).some(key => {
      const field = key as keyof AssistantFormData;
      return (formData[field] || '') !== (originalData[field] || '');
    });
  };

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    // Name validation
    if (!formData.name?.trim()) {
      errors.name = ['Name is required'];
    } else if (formData.name.length > ASSISTANT_VALIDATION.NAME.MAX_LENGTH) {
      errors.name = [`Name must be ${ASSISTANT_VALIDATION.NAME.MAX_LENGTH} characters or less`];
    }

    // System prompt validation
    if (!formData.system_prompt?.trim()) {
      errors.system_prompt = ['System prompt is required'];
    } else if (formData.system_prompt.length > ASSISTANT_VALIDATION.SYSTEM_PROMPT.MAX_LENGTH) {
      errors.system_prompt = [`System prompt must be ${ASSISTANT_VALIDATION.SYSTEM_PROMPT.MAX_LENGTH} characters or less`];
    }

    // Description validation (optional)
    if (formData.description && formData.description.length > ASSISTANT_VALIDATION.DESCRIPTION.MAX_LENGTH) {
      errors.description = [`Description must be ${ASSISTANT_VALIDATION.DESCRIPTION.MAX_LENGTH} characters or less`];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !assistantId) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await assistantService.updateAssistant(assistantId, formData);
      
      setSubmitSuccess(true);
      setOriginalData(formData);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        if (onSaved) onSaved();
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Failed to save assistant:', error);
      setSubmitError(error.message || 'Failed to save assistant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(originalData);
    setValidationErrors({});
    setSubmitError(null);
  };

  const selectedColorName = Object.entries(COLOR_PALETTE)
    .flatMap(([theme, colors]) => colors.map(colorObj => ({ color: colorObj.color, name: colorObj.name, theme })))
    .find(item => item.color === formData.color);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-3xl mx-auto">
          
          {/* Main Modal */}
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: formData.color || '#6B7280' }}
                  />
                  <h2 className="text-2xl font-semibold text-white">
                    Edit Assistant
                  </h2>
                  {hasFormChanged() && (
                    <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                      Modified
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-3 text-white">Loading assistant...</span>
                </div>
              ) : submitSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Save className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">Assistant Updated!</h3>
                  <p className="text-green-300">{formData.name} has been saved successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Information */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Wand2 className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-medium text-white/90">Basic Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Assistant Name *
                          <span className="ml-2 text-xs text-white/50">
                            {formData.name?.length || 0}/{ASSISTANT_VALIDATION.NAME.MAX_LENGTH}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder='e.g., "Research Assistant"'
                          className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white/90 placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm ${
                            validationErrors.name?.length ? 'border-red-400/50' : 'border-white/20'
                          }`}
                        />
                        {validationErrors.name?.map((error, i) => (
                          <p key={i} className="text-red-400 text-sm mt-1">{error}</p>
                        ))}
                      </div>
                      
                      {/* Color */}
                      <div className="lg:col-span-1 relative" ref={colorDropdownRef}>
                        <label className="block text-sm font-medium text-white/90 mb-2">Color</label>
                        <button
                          type="button"
                          onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/15 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-5 h-5 rounded-lg border-2 border-white/30 shadow-lg"
                              style={{ backgroundColor: formData.color || '#6B7280' }}
                            />
                            <span className="text-white/90 font-medium text-sm">
                              {selectedColorName?.name || ''}
                            </span>
                          </div>
                          <ChevronDown 
                            className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
                              isColorDropdownOpen ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>

                        {/* Color Dropdown */}
                        {isColorDropdownOpen && createPortal(
                          <div 
                            data-color-dropdown
                            className="fixed z-[9999] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
                            style={{
                              top: colorDropdownRef.current ? colorDropdownRef.current.getBoundingClientRect().bottom + 8 : 0,
                              left: colorDropdownRef.current ? colorDropdownRef.current.getBoundingClientRect().left : 0,
                              width: colorDropdownRef.current ? colorDropdownRef.current.getBoundingClientRect().width : 'auto',
                              maxWidth: '300px'
                            }}
                          >
                            <div className="p-4">
                              {Object.entries(COLOR_PALETTE).map(([themeName, colors]) => (
                                <div key={themeName} className="mb-4 last:mb-0">
                                  <div className="text-xs text-white/60 mb-2 font-medium">{themeName}</div>
                                  <div className="grid grid-cols-6 gap-2">
                                    {colors.map((colorObj) => (
                                      <button
                                        key={colorObj.color}
                                        type="button"
                                        onClick={() => handleColorSelect(colorObj.color)}
                                        className={
                                          `relative w-8 h-8 rounded-lg border-2 transition-all duration-200 
                                          hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30
                                          ${
                                            formData.color === colorObj.color 
                                              ? 'border-white shadow-lg scale-110' 
                                              : 'border-white/20 hover:border-white/40'
                                          }
                                        `
                                        }
                                        style={{ backgroundColor: colorObj.color }}
                                        title={`Select ${colorObj.name}`}
                                      >
                                        {formData.color === colorObj.color && (
                                          <Check className="w-3 h-3 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                      
                      {/* Description */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-white/90 mb-2">
                          Description
                          <span className="ml-2 text-xs text-white/50">
                            {formData.description?.length || 0}/{ASSISTANT_VALIDATION.DESCRIPTION.MAX_LENGTH}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Brief description of your assistant's purpose"
                          className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white/90 placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 text-sm ${
                            validationErrors.description?.length ? 'border-red-400/50' : 'border-white/20'
                          }`}
                        />
                        {validationErrors.description?.map((error, i) => (
                          <p key={i} className="text-red-400 text-sm mt-1">{error}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="h-5 w-5 text-green-400" />
                      <h3 className="text-lg font-medium text-white/90">System Prompt</h3>
                    </div>
                    
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Instructions *
                      <span className="ml-2 text-xs text-white/50">
                        {formData.system_prompt?.length || 0}/{ASSISTANT_VALIDATION.SYSTEM_PROMPT.MAX_LENGTH}
                      </span>
                    </label>
                    <textarea
                      value={formData.system_prompt || ''}
                      onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                      placeholder="Define how your assistant should behave, its personality, expertise, and response style..."
                      rows={6}
                      className={`w-full px-3 py-2 bg-white/10 backdrop-blur-md border rounded-lg text-white/90 placeholder-white/40 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-vertical min-h-[80px] text-sm ${
                        validationErrors.system_prompt?.length ? 'border-red-400/50' : 'border-white/20'
                      }`}
                    />
                    {validationErrors.system_prompt?.map((error, i) => (
                      <p key={i} className="text-red-400 text-sm mt-1">{error}</p>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        disabled={!hasFormChanged() || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
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
                          Save failed: {submitError}
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={!hasFormChanged() || hasValidationErrors(validationErrors) || isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
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
 * 🎯 Compact Popup Features:
 * =========================
 * 
 * ✨ **Compact Modal**: Max width 3xl (768px) fits on standard screens
 * 📏 **2-Column Grid**: Efficient layout with better space usage
 * 🎨 **Smaller Elements**: Reduced padding (px-3 py-2) and text-sm for compact feel
 * 📝 **6-Row Textarea**: Reasonable height for system prompt editing
 * 🌙 **Dark Theme**: Matches app's glassmorphism aesthetic perfectly
 * 🎯 **Perfect Fit**: All elements fit comfortably on screen without overflow
 * ♿ **Better UX**: Compact but still usable, no cramping
 * 🔄 **Smooth Animations**: Professional transitions and hover effects
 * 
 * **Size Improvements**:
 * - Modal width: 1152px → 768px (33% smaller, fits standard screens)
 * - Input padding: px-4 py-3 → px-3 py-2 (more compact)
 * - Grid layout: 4-column → 2-column (more efficient)
 * - Text area rows: 10 → 6 (still functional but smaller)
 * - Color grid: 8 columns with smaller swatches
 * - Everything fits without scrolling or zoom-out!
 */
