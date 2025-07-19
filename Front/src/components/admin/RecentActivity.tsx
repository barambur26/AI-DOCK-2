// 📋 Recent Activity Component - FIXED MESSAGE DISPLAY
// Real-time monitoring of LLM usage logs with improved data handling
// BUGFIX: Handles missing/zero message count gracefully

import React, { useState, useMemo, useEffect } from 'react';
import { RecentLogsResponse, UsageLogEntry, LogFilters } from '../../types/usage';
import { formatConversationTimestamp } from '../../utils/chatHelpers';
import { formatCurrency } from '../../utils/formatUtils';

interface RecentActivityProps {
  recentLogs: RecentLogsResponse | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onLoadMore?: () => void;
  onFilterChange?: (filters: LogFilters) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  recentLogs,
  isLoading,
  error,
  onRefresh,
  onLoadMore,
  onFilterChange
}) => {

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // =============================================================================
  // AUTO REFRESH FUNCTIONALITY
  // =============================================================================

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      onRefresh();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  // =============================================================================
  // 🔧 BUGFIX: MESSAGE COUNT UTILITIES
  // =============================================================================

  // Helper function to get meaningful message info even when backend data is incomplete
  const getMessageInfo = (log: UsageLogEntry) => {
    const messageCount = log.request_info?.messages_count || 0;
    const totalChars = log.request_info?.total_chars || 0;
    const tokenCount = log.usage?.total_tokens || 0;
    
    // If we have message count from backend, use it
    if (messageCount > 0) {
      return {
        display: `${messageCount} messages`,
        count: messageCount,
        hasData: true
      };
    }
    
    // If we have character count, estimate messages (rough estimate: 100 chars per message)
    if (totalChars > 0) {
      const estimatedMessages = Math.max(1, Math.round(totalChars / 100));
      return {
        display: `~${estimatedMessages} messages`,
        count: estimatedMessages,
        hasData: true
      };
    }
    
    // If we have tokens, estimate messages (rough estimate: 75 tokens per message)
    if (tokenCount > 0) {
      const estimatedMessages = Math.max(1, Math.round(tokenCount / 75));
      return {
        display: `~${estimatedMessages} messages`,
        count: estimatedMessages,
        hasData: false
      };
    }
    
    // Last resort - show that there was activity
    return {
      display: 'chat request',
      count: 1,
      hasData: false
    };
  };

  const getCharacterInfo = (log: UsageLogEntry) => {
    const totalChars = log.request_info?.total_chars || 0;
    const tokenCount = log.usage?.total_tokens || 0;
    
    // If we have character count from backend, use it
    if (totalChars > 0) {
      return {
        display: totalChars.toLocaleString(),
        hasData: true
      };
    }
    
    // If we have tokens, estimate characters (rough estimate: 4 chars per token)
    if (tokenCount > 0) {
      const estimatedChars = tokenCount * 4;
      return {
        display: `~${estimatedChars.toLocaleString()}`,
        hasData: false
      };
    }
    
    return {
      display: '—',
      hasData: false
    };
  };

  // =============================================================================
  // DATA FILTERING AND PROCESSING
  // =============================================================================

  const availableProviders = useMemo(() => {
    if (!recentLogs?.logs) return [];
    
    const providers = new Set(recentLogs.logs.map(log => log.llm.provider));
    return Array.from(providers).sort();
  }, [recentLogs?.logs]);

  useEffect(() => {
    if (recentLogs?.logs && recentLogs.logs.length > 0) {
      const hasRealisticIds = recentLogs.logs.some(log => log.id > 100);
      const hasDemoEmails = recentLogs.logs.some(log => log.user.email.includes('@example.com'));
      const isFallbackData = !hasRealisticIds && hasDemoEmails;

      console.log('🐛 DEBUG: Recent logs received:', {
        totalLogs: recentLogs.logs.length,
        generatedAt: recentLogs.generated_at,
        dataType: isFallbackData ? 'FALLBACK_SAMPLE_DATA' : 'REAL_USAGE_DATA',
        sampleTimestamps: recentLogs.logs.slice(0, 3).map(log => ({
          id: log.id,
          timestamp: log.timestamp,
          parsedDate: log.timestamp ? new Date(log.timestamp).toISOString() : 'invalid',
          timeDiffMinutes: log.timestamp ? Math.round((new Date().getTime() - new Date(log.timestamp).getTime()) / (1000 * 60)) : 'N/A',
          userEmail: log.user.email,
          messageInfo: getMessageInfo(log)
        }))
      });

      if (isFallbackData) {
        console.log('💡 INFO: You are seeing sample/fallback data. To see real timestamps:');
        console.log('   1. Make LLM requests through the chat interface');
        console.log('   2. Ensure the backend usage logging is working');
        console.log('   3. Check the admin user authentication');
      }
    } else if (recentLogs?.logs?.length === 0) {
      console.log('🐛 DEBUG: No recent logs available - this could be why you see no timestamps');
    }
  }, [recentLogs]);

  const availableUsers = useMemo(() => {
    if (!recentLogs?.logs) return [];
    
    const users = new Set(recentLogs.logs.map(log => log.user.email));
    return Array.from(users).sort();
  }, [recentLogs?.logs]);

  const filteredLogs = useMemo(() => {
    if (!recentLogs?.logs) return [];
    
    return recentLogs.logs.filter(log => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          log.user.email.toLowerCase().includes(searchLower) ||
          log.llm.provider.toLowerCase().includes(searchLower) ||
          log.llm.model.toLowerCase().includes(searchLower) ||
          log.llm.config_name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      if (selectedProvider && log.llm.provider !== selectedProvider) {
        return false;
      }
      
      if (successFilter === 'success' && !log.performance.success) {
        return false;
      }
      if (successFilter === 'failed' && log.performance.success) {
        return false;
      }
      
      if (selectedUser && log.user.email !== selectedUser) {
        return false;
      }
      
      return true;
    });
  }, [recentLogs?.logs, searchTerm, selectedProvider, successFilter, selectedUser]);

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const formatCost = (cost: number | null): string => {
    if (cost === null || cost === 0) return 'Free';
    if (cost >= 1) {
      return `${cost.toFixed(2)}`;
    } else if (cost >= 0.01) {
      return `${(cost * 100).toFixed(1)}¢`;
    } else {
      return `${cost.toFixed(4)}`;
    }
  };

  const getStatusStyling = (success: boolean) => {
    return success 
      ? 'bg-green-400/20 text-green-300 border-green-400/30'
      : 'bg-red-400/20 text-red-300 border-red-400/30';
  };

  const getProviderStyling = (provider: string) => {
    const providerColors: Record<string, string> = {
      'openai': 'bg-blue-400/20 text-blue-300 border-blue-400/30',
      'anthropic': 'bg-purple-400/20 text-purple-300 border-purple-400/30',
      'google': 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
      'cohere': 'bg-green-400/20 text-green-300 border-green-400/30'
    };
    return providerColors[provider.toLowerCase()] || 'bg-gray-400/20 text-gray-300 border-gray-400/30';
  };

  const toggleLogExpansion = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // =============================================================================
  // LOADING AND ERROR STATES
  // =============================================================================

  const renderLoading = () => (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-white/10 rounded-xl p-4 animate-pulse bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10">
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load recent activity</h3>
        <p className="text-blue-200 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (isLoading && !recentLogs) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 hover:shadow-3xl transition-all duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <span>Recent Activity</span>
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </h3>
              <p className="text-sm text-blue-200">
                Live monitoring of LLM requests and responses
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 transform ${
                autoRefresh 
                  ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg ring-2 ring-green-400/50'
                  : 'bg-white/10 text-blue-200 hover:bg-white/20 backdrop-blur-lg border border-white/10'
              }`}
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
            <button
              onClick={onRefresh}
              className="bg-white/10 hover:bg-white/20 text-blue-200 hover:text-blue-100 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-lg border border-white/10 hover:scale-105 transform"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search users, providers, models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/10 text-white placeholder-blue-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
            />
          </div>

          {/* Provider filter */}
          <div>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
            >
              <option value="" className="bg-gray-800 text-white">All Providers</option>
              {availableProviders.map(provider => (
                <option key={provider} value={provider} className="bg-gray-800 text-white">
                  {provider.charAt(0).toUpperCase() + provider.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Success filter */}
          <div>
            <select
              value={successFilter}
              onChange={(e) => setSuccessFilter(e.target.value as 'all' | 'success' | 'failed')}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
            >
              <option value="all" className="bg-gray-800 text-white">All Requests</option>
              <option value="success" className="bg-gray-800 text-white">Successful Only</option>
              <option value="failed" className="bg-gray-800 text-white">Failed Only</option>
            </select>
          </div>

          {/* User filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-lg border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300"
            >
              <option value="" className="bg-gray-800 text-white">All Users</option>
              {availableUsers.map(user => (
                <option key={user} value={user} className="bg-gray-800 text-white">
                  {user}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Activity feed */}
      <div className="max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 px-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-blue-200 mb-2">
              {searchTerm || selectedProvider || selectedUser || successFilter !== 'all' 
                ? 'No activity matches your filters.' 
                : recentLogs?.logs?.length === 0 
                  ? 'No recent LLM activity to display.'
                  : 'No recent activity to display.'
              }
            </p>
            {(!searchTerm && !selectedProvider && !selectedUser && successFilter === 'all' && 
              recentLogs?.logs?.length === 0) && (
              <div className="text-sm text-blue-300 mt-2">
                <p>This could mean:</p>
                <ul className="mt-1 space-y-1 text-blue-300">
                  <li>• No LLM requests have been made recently</li>
                  <li>• The usage logging system is not active</li>
                  <li>• Database connectivity issues</li>
                </ul>
                <p className="mt-2">
                  Try making an LLM request through the chat interface to generate activity.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredLogs.map((log) => {
              const messageInfo = getMessageInfo(log);
              const charInfo = getCharacterInfo(log);
              
              return (
                <div key={log.id} className="p-4 hover:bg-white/5 transition-all duration-300">
                  
                  {/* Main log entry */}
                  <div className="flex items-center justify-between">
                    
                    <div className="flex items-center space-x-4 flex-1">
                      
                      {/* Status indicator */}
                      <div className={`w-3 h-3 rounded-full ${log.performance.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      
                      {/* Request details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-medium text-white">{log.user.email}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs border backdrop-blur-lg ${getProviderStyling(log.llm.provider)}`}>
                            {log.llm.provider} / {log.llm.model}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-xs border backdrop-blur-lg ${getStatusStyling(log.performance.success)}`}>
                            {log.performance.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-blue-200">
                          <span>{log.usage.total_tokens.toLocaleString()} tokens</span>
                          <span>{formatCurrency(log.usage.estimated_cost)}</span>
                          {log.performance.response_time_ms && (
                            <span>{log.performance.response_time_ms}ms</span>
                          )}
                          <span className={`${!messageInfo.hasData ? 'text-blue-300 opacity-75' : ''}`}>
                            {messageInfo.display}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp and expand button */}
                    <div className="flex items-center space-x-3">
                      <span 
                        className="text-sm text-blue-300"
                        title={`Full timestamp: ${log.timestamp} | Parsed: ${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Invalid'}`}
                      >
                        {formatConversationTimestamp(log.timestamp)}
                      </span>
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="text-blue-300 hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${expandedLogs.has(log.id) ? 'rotate-180' : ''}`}
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
                  {expandedLogs.has(log.id) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        
                        <div className="bg-blue-500/20 backdrop-blur-lg rounded-xl p-3 border border-blue-400/30">
                          <h5 className="font-medium text-blue-200 mb-2 flex items-center">
                            Request Info
                            {!messageInfo.hasData && !charInfo.hasData && (
                              <span className="ml-2 text-xs text-blue-300 opacity-75" title="Estimated values based on tokens">
                                📊
                              </span>
                            )}
                          </h5>
                          <div className="space-y-1 text-blue-100">
                            <div className={`${!messageInfo.hasData ? 'opacity-75' : ''}`}>
                              Messages: {messageInfo.display}
                            </div>
                            <div className={`${!charInfo.hasData ? 'opacity-75' : ''}`}>
                              Characters: {charInfo.display}
                            </div>
                            {log.request_info?.session_id && (
                              <div>Session: {log.request_info.session_id.slice(0, 8)}...</div>
                            )}
                          </div>
                        </div>

                        <div className="bg-purple-500/20 backdrop-blur-lg rounded-xl p-3 border border-purple-400/30">
                          <h5 className="font-medium text-purple-200 mb-2">Token Usage</h5>
                          <div className="space-y-1 text-purple-100">
                            <div>Input: {log.usage.input_tokens.toLocaleString()}</div>
                            <div>Output: {log.usage.output_tokens.toLocaleString()}</div>
                            <div>Total: {log.usage.total_tokens.toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="bg-orange-500/20 backdrop-blur-lg rounded-xl p-3 border border-orange-400/30">
                          <h5 className="font-medium text-orange-200 mb-2">Performance</h5>
                          <div className="space-y-1 text-orange-100">
                            {log.performance.response_time_ms && (
                              <div>Response: {log.performance.response_time_ms}ms</div>
                            )}
                            <div>Status: {log.performance.success ? 'Success' : 'Failed'}</div>
                            <div>Cost: {formatCurrency(log.usage.estimated_cost)}</div>
                          </div>
                        </div>

                      </div>

                      {/* Error details if failed */}
                      {log.error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl backdrop-blur-lg">
                          <h5 className="font-medium text-red-200 mb-1">Error Details</h5>
                          <div className="text-sm text-red-300">
                            <div>Type: {log.error.error_type}</div>
                            <div>Message: {log.error.error_message}</div>
                          </div>
                        </div>
                      )}

                      {/* Data quality indicator */}
                      {(!messageInfo.hasData || !charInfo.hasData) && (
                        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-400/20 rounded-lg backdrop-blur-lg">
                          <div className="text-xs text-yellow-300 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Some values are estimated from token usage due to incomplete logging data
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {recentLogs && (
        <div className="px-6 py-3 bg-white/5 border-t border-white/10 rounded-b-3xl">
          <div className="flex items-center justify-between text-sm text-blue-200">
            <span>
              Showing {filteredLogs.length} of {recentLogs.logs.length} recent requests
            </span>
            <div className="flex items-center space-x-4">
              {recentLogs.pagination.has_more && onLoadMore && (
                <button
                  onClick={onLoadMore}
                  className="text-blue-300 hover:text-blue-200 font-medium transition-colors hover:underline"
                >
                  Load More
                </button>
              )}
              <span>
                Updated: {new Date(recentLogs.generated_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RecentActivity;