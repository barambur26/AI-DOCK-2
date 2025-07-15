// 🏆 Top Users Table Component - MODERNIZED
// Displays users with highest usage by various metrics (cost, tokens, requests)
// Updated with modern glassmorphism design to match dashboard theme

import React, { useState, useMemo } from 'react';
import { TopUsersResponse, TopUserMetric } from '../../types/usage';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';

interface TopUsersTableProps {
  topUsersByCost: TopUsersResponse | null;
  topUsersByTokens: TopUsersResponse | null;
  topUsersByRequests: TopUsersResponse | null;
  isLoading: boolean;
  error: string | null;
  onUserClick?: (userId: number) => void;
}

const TopUsersTable: React.FC<TopUsersTableProps> = ({
  topUsersByCost,
  topUsersByTokens,
  topUsersByRequests,
  isLoading,
  error,
  onUserClick
}) => {

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [selectedMetric, setSelectedMetric] = useState<TopUserMetric>('total_cost');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // =============================================================================
  // DATA PROCESSING
  // =============================================================================

  const currentData = useMemo(() => {
    switch (selectedMetric) {
      case 'total_cost':
        return topUsersByCost;
      case 'total_tokens':
        return topUsersByTokens;
      case 'request_count':
        return topUsersByRequests;
      default:
        return topUsersByCost;
    }
  }, [selectedMetric, topUsersByCost, topUsersByTokens, topUsersByRequests]);

  const formatMetricValue = (metric: TopUserMetric, value: number): string => {
    switch (metric) {
      case 'total_cost':
        return formatCurrency(value);
      case 'total_tokens':
        return formatNumber(value);
      case 'request_count':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getMetricInfo = (metric: TopUserMetric) => {
    switch (metric) {
      case 'total_cost':
        return {
          label: 'Total Cost',
          icon: '💰',
          description: 'Users ranked by total AI usage cost'
        };
      case 'total_tokens':
        return {
          label: 'Token Usage',
          icon: '🔢',
          description: 'Users ranked by total token consumption'
        };
      case 'request_count':
        return {
          label: 'Request Count',
          icon: '📊',
          description: 'Users ranked by number of AI requests'
        };
      default:
        return {
          label: 'Usage',
          icon: '📈',
          description: 'User ranking'
        };
    }
  };

  const toggleRowExpansion = (userId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 95) return 'text-green-400 bg-green-400/20';
    if (rate >= 85) return 'text-yellow-400 bg-yellow-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getRankingBadge = (index: number): string => {
    switch (index) {
      case 0: return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30 ring-2 ring-yellow-400/20'; // Gold
      case 1: return 'bg-gray-400/20 text-gray-300 border-gray-400/30 ring-2 ring-gray-400/20';       // Silver
      case 2: return 'bg-orange-400/20 text-orange-300 border-orange-400/30 ring-2 ring-orange-400/20'; // Bronze
      default: return 'bg-blue-400/20 text-blue-300 border-blue-400/30';      // Regular
    }
  };

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

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

  const renderError = () => (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Top Users</h3>
      <p className="text-blue-200 mb-4">{error}</p>
    </div>
  );

  const renderEmpty = () => (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Usage Data</h3>
      <p className="text-blue-200">No usage data available for the selected period and filters.</p>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
        {renderError()}
      </div>
    );
  }

  if (!currentData || currentData.top_users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
        {renderEmpty()}
      </div>
    );
  }

  const metricInfo = getMetricInfo(selectedMetric);

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Top Users by {metricInfo.label}</h3>
            <p className="text-sm text-blue-200">{metricInfo.description}</p>
          </div>
        </div>
        
        {/* Metric selector buttons */}
        <div className="flex space-x-2">
          {(['total_cost', 'total_tokens', 'request_count'] as TopUserMetric[]).map((metric) => {
            const info = getMetricInfo(metric);
            return (
              <button
                key={`metric-${metric}`}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 transform ${
                  selectedMetric === metric
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-400/50'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20 backdrop-blur-lg border border-white/10'
                }`}
              >
                {info.icon} {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          renderLoading()
        ) : (
          <div>
            <div className="max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
              {currentData.top_users.slice(0, 5).map((userStats, index) => (
              <div key={`user-${userStats.user.id}-${index}`} className="p-4 bg-white/5 backdrop-blur-lg rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10">
                
                {/* Main row */}
                <div className="flex items-center justify-between">
                  
                  {/* User info with ranking */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${getRankingBadge(index)}`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-white">{userStats.user.email}</h4>
                        <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">
                          {userStats.user.role}
                        </span>
                        {userStats.user.department_id && (
                          <span className="text-xs text-blue-200">
                            Dept: {userStats.user.department_id}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-blue-200">
                        <span>{userStats.metrics.request_count.toLocaleString()} requests</span>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getSuccessRateColor(userStats.metrics.success_rate_percent)}`}>
                          {userStats.metrics.success_rate_percent.toFixed(1)}% success
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metric value and expand button */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {formatMetricValue(selectedMetric, 
                          selectedMetric === 'total_cost' ? userStats.metrics.total_cost :
                          selectedMetric === 'total_tokens' ? userStats.metrics.total_tokens :
                          userStats.metrics.request_count
                        )}
                      </div>
                      <div className="text-sm text-blue-300">
                        {selectedMetric === 'total_cost' && `${formatCurrency(userStats.metrics.average_cost_per_request)} avg/req`}
                        {selectedMetric === 'total_tokens' && `${(userStats.metrics.total_tokens / userStats.metrics.successful_requests).toFixed(0)} avg/req`}
                        {selectedMetric === 'request_count' && `${userStats.metrics.average_response_time_ms.toFixed(0)}ms avg`}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleRowExpansion(userStats.user.id)}
                      className="text-blue-300 hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedRows.has(userStats.user.id) ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedRows.has(userStats.user.id) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      
                      <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-3 border border-blue-400/30">
                        <div className="font-medium text-blue-200">Total Requests</div>
                        <div className="text-blue-100 text-lg font-semibold">
                          {userStats.metrics.request_count.toLocaleString()}
                        </div>
                        <div className="text-blue-300 text-xs">
                          {userStats.metrics.failed_requests} failed
                        </div>
                      </div>

                      <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-3 border border-green-400/30">
                        <div className="font-medium text-green-200">Total Cost</div>
                        <div className="text-green-100 text-lg font-semibold">
                          {formatCurrency(userStats.metrics.total_cost)}
                        </div>
                        <div className="text-green-300 text-xs">
                          {formatCurrency(userStats.metrics.average_cost_per_request)} avg
                        </div>
                      </div>

                      <div className="bg-purple-500/20 backdrop-blur-lg rounded-xl p-3 border border-purple-400/30">
                        <div className="font-medium text-purple-200">Total Tokens</div>
                        <div className="text-purple-100 text-lg font-semibold">
                          {userStats.metrics.total_tokens.toLocaleString()}
                        </div>
                        <div className="text-purple-300 text-xs">
                          {Math.round(userStats.metrics.total_tokens / userStats.metrics.successful_requests)} avg/req
                        </div>
                      </div>

                      <div className="bg-orange-500/20 backdrop-blur-lg rounded-xl p-3 border border-orange-400/30">
                        <div className="font-medium text-orange-200">Avg Response</div>
                        <div className="text-orange-100 text-lg font-semibold">
                          {userStats.metrics.average_response_time_ms.toFixed(0)}ms
                        </div>
                        <div className="text-orange-300 text-xs">
                          {userStats.metrics.success_rate_percent.toFixed(1)}% success
                        </div>
                      </div>

                    </div>
                    
                    {/* User actions */}
                    <div className="flex justify-end mt-4 space-x-2">
                      {onUserClick && (
                        <button
                          onClick={() => onUserClick(userStats.user.id)}
                          className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-blue-100 px-3 py-2 rounded-lg transition-all duration-300 backdrop-blur-lg border border-blue-400/30"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ))}
            </div>
            
            {/* Footer Info */}
            {currentData.top_users.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <p className="text-sm text-blue-200">
                  Showing top 5 users{currentData.top_users.length > 5 && ` of ${currentData.top_users.length}`} for {currentData.period.days} day period • 
                  Updated: {new Date(currentData.generated_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default TopUsersTable;
