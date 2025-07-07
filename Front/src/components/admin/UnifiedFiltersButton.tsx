// 🔧 Unified Filters Button Component
// Combines all filtering options (departments, providers, models) into one clean interface

import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Department, Provider, Model } from '../../services/usageAnalyticsService';

interface UnifiedFiltersButtonProps {
  // Filter data
  departments: Department[];
  providers: Provider[];
  models: Model[];
  modelsByProvider: Record<string, Model[]>;
  
  // Current selections
  selectedDepartment: number | null;
  selectedProviders: string[];
  selectedModels: string[];
  
  // Event handlers
  onDepartmentChange: (departmentId: number | null) => void;
  onProvidersChange: (providers: string[]) => void;
  onModelsChange: (models: string[]) => void;
  
  // UI state
  isLoading?: boolean;
  isRefreshing?: boolean;
}

/**
 * Unified Filters Button Component
 * 
 * Learning: This component provides a clean, unified interface for all filtering
 * options. It follows modern UI patterns with a dropdown interface and active
 * filter indicators.
 * 
 * Features:
 * - Single button that opens a comprehensive filter panel
 * - Active filter count badge
 * - Clear all filters functionality
 * - Organized sections for different filter types
 * - Responsive design with proper accessibility
 */
const UnifiedFiltersButton: React.FC<UnifiedFiltersButtonProps> = ({
  departments,
  providers,
  models,
  modelsByProvider,
  selectedDepartment,
  selectedProviders,
  selectedModels,
  onDepartmentChange,
  onProvidersChange,
  onModelsChange,
  isLoading = false,
  isRefreshing = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total active filters
  const activeFiltersCount = [
    selectedDepartment !== null ? 1 : 0,
    selectedProviders.length,
    selectedModels.length
  ].reduce((sum, count) => sum + count, 0);

  // Handle clear all filters
  const handleClearAll = () => {
    onDepartmentChange(null);
    onProvidersChange([]);
    onModelsChange([]);
  };

  // Handle individual provider toggle
  const handleProviderToggle = (providerId: string) => {
    const newSelection = selectedProviders.includes(providerId)
      ? selectedProviders.filter(id => id !== providerId)
      : [...selectedProviders, providerId];
    onProvidersChange(newSelection);
  };

  // Handle individual model toggle
  const handleModelToggle = (modelId: string) => {
    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];
    onModelsChange(newSelection);
  };

  // Handle provider group toggle (select/deselect all models for a provider)
  const handleProviderGroupToggle = (providerValue: string) => {
    const providerModels = modelsByProvider[providerValue] || [];
    const providerModelIds = providerModels.map(m => m.value);
    
    // Check if all models for this provider are selected
    const allSelected = providerModelIds.every(id => selectedModels.includes(id));
    
    if (allSelected) {
      // Deselect all models for this provider
      const newSelection = selectedModels.filter(id => !providerModelIds.includes(id));
      onModelsChange(newSelection);
    } else {
      // Select all models for this provider
      const newSelection = [...new Set([...selectedModels, ...providerModelIds])];
      onModelsChange(newSelection);
    }
  };

  return (
    <div className="relative">
      {/* Main Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isRefreshing}
        className="bg-white/10 backdrop-blur-lg border border-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 flex items-center space-x-2"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl z-50">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-200">Department</h4>
              <select
                value={selectedDepartment || ''}
                onChange={(e) => onDepartmentChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isLoading || isRefreshing}
                className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-white/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="" className="bg-gray-800 text-white">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.value} value={dept.value} className="bg-gray-800 text-white">
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Providers Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-200">Providers</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onProvidersChange(providers.map(p => p.value))}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isLoading || isRefreshing}
                  >
                    All
                  </button>
                  <span className="text-xs text-blue-200">•</span>
                  <button
                    onClick={() => onProvidersChange([])}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isLoading || isRefreshing}
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {providers.map((provider) => (
                  <label
                    key={provider.value}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProviders.includes(provider.value)}
                      onChange={() => handleProviderToggle(provider.value)}
                      disabled={isLoading || isRefreshing}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-white">{provider.label}</span>
                    <span className="text-xs text-blue-300">
                      ({(modelsByProvider[provider.value] || []).length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Models Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-blue-200">Models</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onModelsChange(models.map(m => m.value))}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isLoading || isRefreshing}
                  >
                    All
                  </button>
                  <span className="text-xs text-blue-200">•</span>
                  <button
                    onClick={() => onModelsChange([])}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isLoading || isRefreshing}
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(modelsByProvider).map(([providerValue, providerModels]) => (
                  <div key={providerValue} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium text-blue-300">{providerValue}</h5>
                      <button
                        onClick={() => handleProviderGroupToggle(providerValue)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        disabled={isLoading || isRefreshing}
                      >
                        {providerModels.every(m => selectedModels.includes(m.value)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="ml-4 space-y-1">
                      {providerModels.map((model) => (
                        <label
                          key={model.value}
                          className="flex items-center space-x-2 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedModels.includes(model.value)}
                            onChange={() => handleModelToggle(model.value)}
                            disabled={isLoading || isRefreshing}
                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-xs text-white">{model.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UnifiedFiltersButton; 