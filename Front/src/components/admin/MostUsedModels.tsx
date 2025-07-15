// 🤖 Most Used Models Component
// Display analytics for the most popular AI models being used

import React from 'react';
import { MostUsedModelsResponse } from '../../services/usageAnalyticsService';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';

interface MostUsedModelsProps {
  mostUsedModels: MostUsedModelsResponse | null;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

/**
 * Most Used Models Component
 * 
 * Learning: This component provides insights into which AI models are being
 * used most frequently, helping admins understand model adoption patterns,
 * costs, and performance across the organization.
 * 
 * Design Pattern: This follows the same pattern as other dashboard components
 * with loading states, error handling, and responsive design.
 */
const MostUsedModels: React.FC<MostUsedModelsProps> = ({
  mostUsedModels,
  isLoading = false,
  error = null,
  onRefresh
}) => {

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render loading state
   */
  const renderLoading = () => (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Models</h3>
      <p className="text-blue-200 mb-4">{error}</p>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          Try Again
        </button>
      )}
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Model Usage Found</h3>
      <p className="text-blue-200">No AI model usage data available for the selected period and filters.</p>
    </div>
  );



  /**
   * Get provider color
   */
  const getProviderColor = (provider: string): string => {
    const colors: { [key: string]: string } = {
      'openai': 'bg-green-500',
      'anthropic': 'bg-orange-500',
      'google': 'bg-blue-500',
      'azure': 'bg-cyan-500',
      'aws': 'bg-yellow-500'
    };
    return colors[provider.toLowerCase()] || 'bg-gray-500';
  };

  /**
   * Get success rate color
   */
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  /**
   * Render model item
   */
  const renderModelItem = (model: any, index: number) => (
    <div key={`${model.provider}-${model.model}`} className="p-4 bg-white/5 backdrop-blur-lg rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10">
      <div className="flex items-center justify-between">
        
        {/* Model Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-blue-300">#{index + 1}</span>
            <div className={`w-3 h-3 rounded-full ${getProviderColor(model.provider)}`}></div>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">
              {model.model}
            </h4>
            <p className="text-xs text-blue-200 capitalize">
              {model.provider}
            </p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="text-right">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <p className="font-semibold text-white">{formatNumber(model.requests.total)}</p>
              <p className="text-xs text-blue-200">requests</p>
            </div>
            <div>
              <p className="font-semibold text-white">{formatCurrency(model.cost.total_usd)}</p>
              <p className="text-xs text-blue-200">cost</p>
            </div>
            <div>
              <p className={`font-semibold ${getSuccessRateColor(model.requests.success_rate_percent)}`}>
                {model.requests.success_rate_percent.toFixed(1)}%
              </p>
              <p className="text-xs text-blue-200">success</p>
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Stats */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-blue-200">Tokens</p>
            <p className="font-semibold text-white">{formatNumber(model.tokens.total)}</p>
            <p className="text-blue-300">{formatNumber(model.tokens.average_per_request)} avg</p>
          </div>
          <div>
            <p className="text-blue-200">Response Time</p>
            <p className="font-semibold text-white">{model.performance.average_response_time_ms}ms</p>
            <p className="text-blue-300">avg</p>
          </div>
          <div>
            <p className="text-blue-200">Cost per 1K Tokens</p>
            <p className="font-semibold text-white">{formatCurrency(model.cost.cost_per_1k_tokens)}</p>
            <p className="text-blue-300">rate</p>
          </div>
        </div>
      </div>

    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Most Used Models</h3>
            <p className="text-sm text-blue-200">AI model usage patterns and performance</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-xl transition-all duration-300 hover:scale-105 transform"
            title="Refresh Models Data"
          >
            <svg className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {error ? (
          renderError()
        ) : isLoading ? (
          renderLoading()
        ) : !mostUsedModels || mostUsedModels.models.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="space-y-3">
            {mostUsedModels.models.map((model, index) => renderModelItem(model, index))}
            
            {/* Footer Info */}
            {mostUsedModels.models.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-blue-200">
                  Showing top {mostUsedModels.models.length} models • 
                  Period: {new Date(mostUsedModels.period.start_date).toLocaleDateString()} - {new Date(mostUsedModels.period.end_date).toLocaleDateString()}
                  {mostUsedModels.filters_applied.department_id && <span> • Department filtered</span>}
                  {mostUsedModels.filters_applied.provider_name && <span> • Provider: {mostUsedModels.filters_applied.provider_name}</span>}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default MostUsedModels;
