// 🎨 Custom Modern Dropdown Component
// Replaces default browser dropdowns with modern, interactive design

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// =============================================================================
// INTERFACES
// =============================================================================

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  options: DropdownOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Custom Modern Dropdown Component
 * 
 * Replaces default browser select with a custom implementation featuring:
 * - Modern glassmorphism styling
 * - Smooth animations and transitions
 * - Enhanced accessibility
 * - Custom option rendering with icons
 */
export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  icon
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            const selectedOption = options[highlightedIndex];
            if (!selectedOption.disabled) {
              onChange(selectedOption.value);
              setIsOpen(false);
              setHighlightedIndex(-1);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, options, onChange]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(-1);
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const getSelectedOption = () => {
    return options.find(option => option.value === value);
  };

  const renderOption = (option: DropdownOption, index: number) => {
    const isHighlighted = index === highlightedIndex;
    const isSelected = option.value === value;

    return (
      <li
        key={option.value}
        onClick={() => handleOptionClick(option)}
        className={`
          px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-3
          ${isHighlighted ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
          ${isSelected ? 'bg-blue-100 text-blue-800 font-medium' : ''}
          ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        {option.icon && (
          <span className="text-lg flex-shrink-0">{option.icon}</span>
        )}
        <span className="flex-1">{option.label}</span>
        {isSelected && (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </li>
    );
  };

  const selectedOption = getSelectedOption();

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={`custom-dropdown min-w-[150px] relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          id={id}
          name={name}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-left border-2 border-gray-200 rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 
            disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 
            focus:shadow-lg focus:ring-offset-2 flex items-center justify-between
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg' : ''}
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedOption?.icon && (
              <span className="text-lg flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <div className="flex-shrink-0 ml-2">
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-400 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[9999] w-full mt-2 bg-white/95 backdrop-blur-lg border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <ul
              ref={listRef}
              className="max-h-60 overflow-y-auto py-1"
              role="listbox"
            >
              {options.map(renderOption)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
