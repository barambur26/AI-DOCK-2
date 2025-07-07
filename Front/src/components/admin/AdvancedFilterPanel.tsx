// 🔧 Advanced Filter Panel - Multi-select Provider & Model Filtering
// Comprehensive filtering interface for usage analytics with provider grouping

import React, { useState } from 'react';
import { Provider, Model } from '../../services/usageAnalyticsService';

interface AdvancedFilterPanelProps {
  // Provider state and handlers
  providers: Provider[];
  selectedProviders: string[];
  onProvidersChange: (providers: string[]) => void;
  
  // Model state and handlers
  models: Model[];
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  modelsByProvider: Record<string, Model[]>;
  
  // UI state
  isLoading?: boolean;
  isRefreshing?: boolean;
}

/**
 * Advanced Filter Panel Component
 * 
 * Learning: This component provides advanced multi-select filtering for providers
 * and models. It follows the AI Dock design patterns with glassmorphism theme
 * and responsive behavior.
 * 
 * Features:
 * - Tabbed interface for providers vs models
 * - Select all/clear all functionality
 * - Provider grouping for models
 * - Active filter counting and badges
 * - Keyboard and accessibility support
 */
const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  providers,
  selectedProviders,
  onProvidersChange,
  models,
  selectedModels,
  onModelsChange,
  modelsByProvider,
  isLoading = false,
  isRefreshing = false
}) => {

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'models'>('providers');

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle individual provider toggle
   */
  const handleProviderToggle = (providerId: string) => {
    const newSelection = selectedProviders.includes(providerId)
      ? selectedProviders.filter(id => id !== providerId)
      : [...selectedProviders, providerId];
    onProvidersChange(newSelection);
  };

  /**
   * Handle individual model toggle
   */
  const handleModelToggle = (modelId: string) => {
    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];
    onModelsChange(newSelection);
  };

  /**
   * Handle provider select all
   */
  const handleProviderSelectAll = () => {
    onProvidersChange(providers.map(p => p.value));
  };

  /**
   * Handle provider clear all
   */
  const handleProviderClearAll = () => {
    onProvidersChange([]);
  };

  /**
   * Handle model select all
   */
  const handleModelSelectAll = () => {
    onModelsChange(models.map(m => m.value));
  };

  /**
   * Handle model clear all
   */
  const handleModelClearAll = () => {
    onModelsChange([]);
  };

  /**
   * Handle provider group toggle (select/deselect all models for a provider)
   */
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

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render provider filters tab content
   */
  const renderProviderFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Providers</h4>
        <div className="flex space-x-2">
          <button
            onClick={handleProviderSelectAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading || isRefreshing}
          >
            Select All
          </button>
          <span className="text-xs text-blue-200">•</span>
          <button
            onClick={handleProviderClearAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading || isRefreshing}
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {providers.map((provider) => (
          <label
            key={provider.value}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
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
              ({(modelsByProvider[provider.value] || []).length} models)
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  /**
   * Render model filters tab content with provider grouping
   */
  const renderModelFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Models</h4>
        <div className="flex space-x-2">
          <button
            onClick={handleModelSelectAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading || isRefreshing}
          >
            Select All
          </button>
          <span className="text-xs text-blue-200">•</span>
          <button
            onClick={handleModelClearAll}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            disabled={isLoading || isRefreshing}
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {Object.entries(modelsByProvider).map(([providerValue, providerModels]) => {
          const provider = providers.find(p => p.value === providerValue);
          const allModelsSelected = providerModels.every(m => selectedModels.includes(m.value));
          const someModelsSelected = providerModels.some(m => selectedModels.includes(m.value));
          
          return (
            <div key={providerValue} className="space-y-2">
              <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                <input
                  type="checkbox"
                  checked={allModelsSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someModelsSelected && !allModelsSelected;
                  }}
                  onChange={() => handleProviderGroupToggle(providerValue)}
                  disabled={isLoading || isRefreshing}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-blue-200">
                  {provider?.label || providerValue}
                </span>
                <span className="text-xs text-blue-400">
                  ({providerModels.filter(m => selectedModels.includes(m.value)).length}/{providerModels.length})
                </span>
              </div>
              
              <div className="ml-6 space-y-1">
                {providerModels.map((model) => (
                  <label
                    key={model.value}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.value)}
                      onChange={() => handleModelToggle(model.value)}
                      disabled={isLoading || isRefreshing}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-white flex-1">{model.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /**
   * Render filter panel content
   */
  const renderFilterContent = () => (
    <>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('providers')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'providers'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-blue-200 hover:text-white hover:bg-white/10'
          }`}
        >
          Providers ({selectedProviders.length}/{providers.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === 'models'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-blue-200 hover:text-white hover:bg-white/10'
          }`}
        >
          Models ({selectedModels.length}/{models.length})
        </button>
      </div>

      {/* Filter Content */}
      {activeTab === 'providers' ? renderProviderFilters() : renderModelFilters()}

      {/* Quick Summary */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-blue-200 space-y-1">
          <div>Active Providers: {selectedProviders.length} of {providers.length}</div>
          <div>Active Models: {selectedModels.length} of {models.length}</div>
        </div>
      </div>
    </>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        disabled={isLoading || isRefreshing}
        className="bg-white/10 backdrop-blur-lg border border-white/10 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span>Advanced Filters</span>
        {(selectedProviders.length < providers.length || selectedModels.length < models.length) && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
            {(selectedProviders.length < providers.length ? 1 : 0) + (selectedModels.length < models.length ? 1 : 0)}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filter Panel */}
      {showAdvancedFilters && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl z-50 p-6">
          {renderFilterContent()}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
