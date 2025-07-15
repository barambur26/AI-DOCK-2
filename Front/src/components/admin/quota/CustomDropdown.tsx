// 🎨 Custom Modern Dropdown Component
// Replaces default browser dropdowns with modern, interactive design

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // If dropdown is not open, no need to check
      if (!isOpen) return;
      
      // Check if click is outside the dropdown container
      const isOutsideContainer = dropdownRef.current && !dropdownRef.current.contains(target);
      
      // Check if click is outside the portal menu (if it exists)
      const isOutsidePortal = listRef.current && !listRef.current.contains(target);
      
      // Close if click is outside both container and portal
      if (isOutsideContainer && isOutsidePortal) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

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

  // Handle window resize and scroll to reposition dropdown
  useEffect(() => {
    const handleWindowEvent = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleWindowEvent);
      window.addEventListener('scroll', handleWindowEvent, true);
      
      return () => {
        window.removeEventListener('resize', handleWindowEvent);
        window.removeEventListener('scroll', handleWindowEvent, true);
      };
    }
  }, [isOpen]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 240; // max-h-60 = ~240px
      
      let top = rect.bottom + scrollY + 8; // 8px gap
      
      // Check if dropdown would go below viewport
      if (rect.bottom + dropdownHeight > viewportHeight) {
        // Position above the button instead
        top = rect.top + scrollY - dropdownHeight - 8;
      }
      
      setDropdownPosition({
        top: Math.max(scrollY + 8, top), // Ensure it's not above viewport
        left: rect.left + scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        calculateDropdownPosition();
      }
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

  // Create portal element for dropdown
  const dropdownPortal = isOpen ? createPortal(
    <div 
      className="fixed bg-white/95 backdrop-blur-lg border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999
      }}
    >
      <ul
        ref={listRef}
        className="max-h-60 overflow-y-auto py-1"
        role="listbox"
      >
        {options.map(renderOption)}
      </ul>
    </div>,
    document.body
  ) : null;

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={`custom-dropdown min-w-[150px] ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>

      {/* Dropdown Button */}
      <div className="relative">
        <button
          ref={buttonRef}
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
      </div>

      {/* Render dropdown portal */}
      {dropdownPortal}
    </div>
  );
};

export default CustomDropdown;
