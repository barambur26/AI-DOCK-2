// 🎯 Quota Filters Component
// Filter controls for quota table with search and dropdown filters

import React from 'react';
import { DepartmentOption, LLMConfigOption, QuotaType } from '../../../types/quota';
import { FilterState } from '../../../hooks/quota/useQuotaTable';
import { CustomDropdown, DropdownOption } from './CustomDropdown';

// =============================================================================
// INTERFACES
// =============================================================================

interface QuotaFiltersProps {
  filters: FilterState;
  departments: DepartmentOption[];
  llmConfigs: LLMConfigOption[];
  referencesLoading: boolean;
  hasActiveFilters: boolean;
  filterSummary: string[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Quota Filters Component
 * 
 * Provides comprehensive filtering controls for the quota table.
 * Learning: This component demonstrates the separation of filtering logic
 * from the main table component, following single responsibility principle.
 */
export const QuotaFilters: React.FC<QuotaFiltersProps> = ({
  filters,
  departments,
  llmConfigs,
  referencesLoading,
  hasActiveFilters,
  filterSummary,
  onFilterChange,
  onResetFilters,
  className = ''
}) => {
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render text search input
   */
  const renderSearchInput = () => (
    <div className="w-full">
      <label htmlFor="quota-search" className="block text-sm font-semibold text-gray-700 mb-2">
        🔍 Search Quotas
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id="quota-search"
          name="quota-search"
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search by name or description..."
          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:border-gray-300 focus:shadow-lg placeholder:text-gray-500 focus:ring-offset-2"
          autoComplete="off"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: '' })}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 hover:bg-gray-100 rounded-full p-1"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  /**
   * Render department filter dropdown
   */
  const renderDepartmentFilter = () => {
    const departmentOptions: DropdownOption[] = [
      { value: '', label: 'All Departments' },
      ...departments.map(dept => ({
        value: dept.id,
        label: dept.code ? `${dept.name} (${dept.code})` : dept.name,
        disabled: !dept.is_active
      }))
    ];

    return (
      <CustomDropdown
        id="quota-department-filter"
        name="quota-department-filter"
        label="Department"
        icon="🏢"
        value={filters.departmentId || ''}
        options={departmentOptions}
        onChange={(value) => onFilterChange({ departmentId: value ? Number(value) : null })}
        placeholder="All Departments"
        disabled={referencesLoading}
      />
    );
  };

  /**
   * Render LLM config filter dropdown
   */
  const renderLLMConfigFilter = () => {
    const llmConfigOptions: DropdownOption[] = [
      { value: '', label: 'All LLM Configs' },
      ...llmConfigs.map(config => ({
        value: config.id,
        label: `${config.name} (${config.provider})`,
        disabled: !config.is_active
      }))
    ];

    return (
      <CustomDropdown
        id="quota-llm-filter"
        name="quota-llm-filter"
        label="LLM Config"
        icon="🤖"
        value={filters.llmConfigId || ''}
        options={llmConfigOptions}
        onChange={(value) => onFilterChange({ llmConfigId: value ? Number(value) : null })}
        placeholder="All LLM Configs"
        disabled={referencesLoading}
      />
    );
  };

  /**
   * Render quota type filter dropdown
   */
  const renderQuotaTypeFilter = () => {
    const quotaTypeOptions: DropdownOption[] = [
      { value: '', label: 'All Types' },
      { value: 'cost', label: 'Cost', icon: '💰' },
      { value: 'tokens', label: 'Tokens', icon: '🎯' },
      { value: 'requests', label: 'Requests', icon: '📞' }
    ];

    return (
      <CustomDropdown
        id="quota-type-filter"
        name="quota-type-filter"
        label="Type"
        icon="💰"
        value={filters.quotaType || ''}
        options={quotaTypeOptions}
        onChange={(value) => onFilterChange({ quotaType: value as QuotaType || null })}
        placeholder="All Types"
      />
    );
  };

  /**
   * Render enforcement filter
   */
  const renderEnforcementFilter = () => {
    const enforcementOptions: DropdownOption[] = [
      { value: '', label: 'All' },
      { value: 'true', label: 'Enforced', icon: '🛡️' },
      { value: 'false', label: 'Not Enforced', icon: '⚪' }
    ];

    return (
      <CustomDropdown
        id="quota-enforcement-filter"
        name="quota-enforcement-filter"
        label="Enforcement"
        icon="🛡️"
        value={filters.isEnforced === null ? '' : filters.isEnforced.toString()}
        options={enforcementOptions}
        onChange={(value) => {
          onFilterChange({ 
            isEnforced: value === '' ? null : value === 'true' 
          });
        }}
        placeholder="All"
      />
    );
  };

  /**
   * Render exceeded filter
   */
  const renderExceededFilter = () => {
    const exceededOptions: DropdownOption[] = [
      { value: '', label: 'All' },
      { value: 'true', label: 'Exceeded', icon: '🚨' },
      { value: 'false', label: 'Within Limit', icon: '✅' }
    ];

    return (
      <CustomDropdown
        id="quota-exceeded-filter"
        name="quota-exceeded-filter"
        label="Usage Status"
        icon="📈"
        value={filters.isExceeded === null ? '' : filters.isExceeded.toString()}
        options={exceededOptions}
        onChange={(value) => {
          onFilterChange({ 
            isExceeded: value === '' ? null : value === 'true' 
          });
        }}
        placeholder="All"
      />
    );
  };

  /**
   * Render clear filters button
   */
  const renderClearButton = () => {
    if (!hasActiveFilters) return null;
    
    return (
      <button
        type="button"
        onClick={onResetFilters}
        className="group px-5 py-3 text-sm font-medium text-red-600 hover:text-white border-2 border-red-500 hover:border-red-600 rounded-xl hover:bg-red-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </span>
      </button>
    );
  };

  /**
   * Render active filters summary
   */
  const renderFilterSummary = () => {
    if (filterSummary.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">🏷️ Active filters:</span>
          {filterSummary.map((filter, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200"
            >
              {filter}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={`quota-filters bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 hover:from-white/98 hover:to-white/95 ${className}`}>
      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
        <div className="lg:col-span-2 xl:col-span-2">
          {renderSearchInput()}
        </div>
        {renderDepartmentFilter()}
        {renderLLMConfigFilter()}
        {renderQuotaTypeFilter()}
        {renderEnforcementFilter()}
        <div className="flex items-end gap-2">
          {renderExceededFilter()}
          {renderClearButton()}
        </div>
      </div>

      {/* Active Filters Summary */}
      {renderFilterSummary()}

      {/* Loading State for References */}
      {referencesLoading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="animate-pulse">Loading filter options...</span>
        </div>
      )}
    </div>
  );
};

export default QuotaFilters;