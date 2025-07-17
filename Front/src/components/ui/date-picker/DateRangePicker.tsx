// 📅 Custom Date Range Picker Component
// Modern, sleek date range selector optimized for corporate dashboard usage
// Expedia-style UX with AI Dock's glass morphism design language

import React, { useState, useRef, useEffect } from 'react';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  placeholder?: string;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  disabled = false,
  maxDate = new Date(),
  minDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
  placeholder = 'Select date range',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get display text for the trigger button
  const getDisplayText = (): string => {
    if (value.startDate && value.endDate) {
      return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
    } else if (value.startDate) {
      return `${formatDate(value.startDate)} - Select end date`;
    }
    return placeholder;
  };

  // Generate calendar grid for a given month
  const generateCalendarDays = (month: Date): (Date | null)[] => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), day));
    }

    return days;
  };

  // Check if a date is in the selected range
  const isDateInRange = (date: Date): boolean => {
    if (!value.startDate || !value.endDate) return false;
    return date >= value.startDate && date <= value.endDate;
  };

  // Check if a date is in the hover preview range
  const isDateInHoverRange = (date: Date): boolean => {
    if (!value.startDate || !hoverDate || value.endDate) return false;
    const start = value.startDate < hoverDate ? value.startDate : hoverDate;
    const end = value.startDate < hoverDate ? hoverDate : value.startDate;
    return date >= start && date <= end;
  };

  // Check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    if (date < minDate || date > maxDate) return true;
    return false;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (selectingStart || !value.startDate) {
      // Selecting start date
      onChange({
        startDate: date,
        endDate: null
      });
      setSelectingStart(false);
    } else {
      // Selecting end date
      if (date < value.startDate) {
        // If end date is before start date, swap them
        onChange({
          startDate: date,
          endDate: value.startDate
        });
      } else {
        onChange({
          startDate: value.startDate,
          endDate: date
        });
      }
      setSelectingStart(true);
      setIsOpen(false);
    }
  };

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Quick preset buttons
  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const handlePresetClick = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    onChange({ startDate, endDate });
    setIsOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    onChange({ startDate: null, endDate: null });
    setSelectingStart(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-3 px-4 py-2 
          bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed
          text-blue-200 hover:text-white
          border border-white/10 hover:border-white/20
          rounded-xl backdrop-blur-lg
          transition-all duration-300 hover:scale-105 transform
          shadow-lg hover:shadow-xl
          font-medium text-sm
          ${isOpen ? 'ring-2 ring-blue-400/50' : ''}
        `}
      >
        {/* Calendar Icon */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        {/* Display Text */}
        <span className="whitespace-nowrap">
          {getDisplayText()}
        </span>
        
        {/* Dropdown Arrow */}
        <svg 
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 left-0 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          style={{ minWidth: '380px' }}
        >
          {/* Quick Presets */}
          <div className="p-4 border-b border-white/10">
            <div className="text-xs font-medium text-blue-200 mb-2 uppercase tracking-wide">Quick Select</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => handlePresetClick(preset.days)}
                  className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  {preset.label}
                </button>
              ))}
              {(value.startDate || value.endDate) && (
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Calendar Header */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-white font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-blue-300 py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays(currentMonth).map((date, index) => {
                if (!date) {
                  return <div key={index} className="w-10 h-10" />;
                }

                const isDisabled = isDateDisabled(date);
                const isSelected = (value.startDate && date.getTime() === value.startDate.getTime()) || 
                                  (value.endDate && date.getTime() === value.endDate.getTime());
                const isInRange = isDateInRange(date);
                const isInHover = isDateInHoverRange(date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    disabled={isDisabled}
                    className={`
                      w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200
                      flex items-center justify-center
                      ${isDisabled 
                        ? 'text-gray-500 cursor-not-allowed opacity-30' 
                        : 'text-blue-200 hover:text-white cursor-pointer hover:scale-110'
                      }
                      ${isSelected 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : isInRange || isInHover
                        ? 'bg-blue-500/30 text-white' 
                        : 'hover:bg-white/10'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-blue-400/50' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Text */}
          {(value.startDate && !value.endDate) && (
            <div className="px-4 pb-4 text-xs text-blue-300 text-center">
              Select an end date to complete your range
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
