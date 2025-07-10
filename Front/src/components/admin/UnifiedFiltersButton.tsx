// 🔧 Modern Unified Filters Button Component
// Combines all filtering options with smart logic and modern UI

import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
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
 * Modern Unified Filters Button Component
 * 
 * Features:
 * - Smart provider/model syncing
 * - Modern chip-based UI
 * - Intuitive selection logic
 * - Clear visual states
 * - Auto-selection behaviors
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

  // Smart provider toggle with model syncing
  const handleProviderToggle = (providerId: string) => {
    const isCurrentlySelected = selectedProviders.includes(providerId);
    const providerModels = modelsByProvider[providerId] || [];
    const providerModelIds = providerModels.map(m => m.value);
    
    if (isCurrentlySelected) {
      // Deselecting provider - remove it and its models
      const newProviders = selectedProviders.filter(id => id !== providerId);
      const newModels = selectedModels.filter(id => !providerModelIds.includes(id));
      onProvidersChange(newProviders);
      onModelsChange(newModels);
    } else {
      // Selecting provider - add it and all its models
      const newProviders = [...selectedProviders, providerId];
      const newModels = [...new Set([...selectedModels, ...providerModelIds])];
      onProvidersChange(newProviders);
      onModelsChange(newModels);
    }
  };

  // Smart model toggle with provider syncing
  const handleModelToggle = (modelId: string) => {
    const isCurrentlySelected = selectedModels.includes(modelId);
    const model = models.find(m => m.value === modelId);
    
    if (!model) return;
    
    const providerModels = modelsByProvider[model.provider] || [];
    const providerModelIds = providerModels.map(m => m.value);
    
    if (isCurrentlySelected) {
      // Deselecting model
      const newModels = selectedModels.filter(id => id !== modelId);
      
      // Check if this was the last model for this provider
      const remainingProviderModels = newModels.filter(id => providerModelIds.includes(id));
      
      if (remainingProviderModels.length === 0) {
        // Remove the provider as well
        const newProviders = selectedProviders.filter(id => id !== model.provider);
        onProvidersChange(newProviders);
      }
      
      onModelsChange(newModels);
    } else {
      // Selecting model
      const newModels = [...selectedModels, modelId];
      
      // Check if all models for this provider are now selected
      const allProviderModelsSelected = providerModelIds.every(id => 
        newModels.includes(id)
      );
      
      if (allProviderModelsSelected && !selectedProviders.includes(model.provider)) {
        // Add the provider as well
        const newProviders = [...selectedProviders, model.provider];
        onProvidersChange(newProviders);
      }
      
      onModelsChange(newModels);
    }
  };

  // Check if provider is partially selected (some but not all models selected)
  const isProviderPartiallySelected = (providerId: string): boolean => {
    const providerModels = modelsByProvider[providerId] || [];
    const providerModelIds = providerModels.map(m => m.value);
    const selectedProviderModels = selectedModels.filter(id => providerModelIds.includes(id));
    
    return selectedProviderModels.length > 0 && selectedProviderModels.length < providerModelIds.length;
  };

  // Check if provider is fully selected
  const isProviderFullySelected = (providerId: string): boolean => {
    return selectedProviders.includes(providerId);
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

      {/* Modern Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Department Filter */}
            <div className="p-6 border-b border-white/5">
              <h4 className="text-sm font-medium text-blue-200 mb-3">Department</h4>
              <select
                value={selectedDepartment || ''}
                onChange={(e) => onDepartmentChange(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isLoading || isRefreshing}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm transition-all duration-300 hover:bg-white/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
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
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-blue-200">Providers</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onProvidersChange(providers.map(p => p.value))}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                    disabled={isLoading || isRefreshing}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      onProvidersChange([]);
                      onModelsChange([]);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                    disabled={isLoading || isRefreshing}
                  >
                    None
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {providers.map((provider) => {
                  const isFullySelected = isProviderFullySelected(provider.value);
                  const isPartiallySelected = isProviderPartiallySelected(provider.value);
                  const modelCount = (modelsByProvider[provider.value] || []).length;
                  
                  return (
                    <button
                      key={provider.value}
                      onClick={() => handleProviderToggle(provider.value)}
                      disabled={isLoading || isRefreshing}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                        isFullySelected
                          ? 'bg-blue-500/20 border border-blue-400/30 text-blue-100'
                          : isPartiallySelected
                          ? 'bg-blue-500/10 border border-blue-400/20 text-blue-200'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          isFullySelected
                            ? 'bg-blue-500 border-blue-500'
                            : isPartiallySelected
                            ? 'bg-blue-500/50 border-blue-400'
                            : 'border-white/30'
                        }`}>
                          {isFullySelected && <Check className="w-3 h-3 text-white" />}
                          {isPartiallySelected && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
                        </div>
                        <span className="font-medium">{provider.label}</span>
                      </div>
                      <span className="text-xs opacity-70">{modelCount} models</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Models Filter */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-blue-200">Models</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onModelsChange(models.map(m => m.value))}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                    disabled={isLoading || isRefreshing}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      onModelsChange([]);
                      onProvidersChange([]);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                    disabled={isLoading || isRefreshing}
                  >
                    None
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(modelsByProvider).map(([providerValue, providerModels]) => (
                  <div key={providerValue} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium text-blue-300 uppercase tracking-wider">{providerValue}</h5>
                      <button
                        onClick={() => {
                          const providerModelIds = providerModels.map(m => m.value);
                          const allSelected = providerModelIds.every(id => selectedModels.includes(id));
                          
                          if (allSelected) {
                            // Deselect all models for this provider
                            const newModels = selectedModels.filter(id => !providerModelIds.includes(id));
                            const newProviders = selectedProviders.filter(id => id !== providerValue);
                            onModelsChange(newModels);
                            onProvidersChange(newProviders);
                          } else {
                            // Select all models for this provider
                            const newModels = [...new Set([...selectedModels, ...providerModelIds])];
                            const newProviders = [...new Set([...selectedProviders, providerValue])];
                            onModelsChange(newModels);
                            onProvidersChange(newProviders);
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded hover:bg-white/10"
                        disabled={isLoading || isRefreshing}
                      >
                        {providerModels.every(m => selectedModels.includes(m.value)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {providerModels.map((model) => {
                        const isSelected = selectedModels.includes(model.value);
                        
                        return (
                          <button
                            key={model.value}
                            onClick={() => handleModelToggle(model.value)}
                            disabled={isLoading || isRefreshing}
                            className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-left ${
                              isSelected
                                ? 'bg-blue-500/20 border border-blue-400/30 text-blue-100'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-white/30'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <span className="text-sm">{model.label}</span>
                            </div>
                          </button>
                        );
                      })}
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