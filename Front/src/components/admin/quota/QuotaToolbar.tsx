// 🛠️ Quota Toolbar Component
// Toolbar with refresh and action buttons for quota management

import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

interface QuotaToolbarProps {
  loading: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
  onCreateQuota: () => void;
  className?: string;
}

/**
 * QuotaToolbar Component
 * 
 * Provides refresh functionality and action buttons for quota management.
 * Follows the atomic component pattern used throughout the admin interface.
 */
const QuotaToolbar: React.FC<QuotaToolbarProps> = ({
  loading,
  refreshing = false,
  onRefresh,
  onCreateQuota,
  className = ''
}) => {
  return (
    <div className={`flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 ${className}`}>
      {/* Page header */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">📊</div>
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text">
            Quota Management
          </h2>
        </div>
        <p className="text-blue-100/90 text-lg font-medium">
          💼 Manage department usage limits and monitor consumption
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center space-x-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="group flex items-center space-x-3 px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 backdrop-blur-lg border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl transform hover:scale-105"
          title={refreshing ? 'Refreshing quotas...' : 'Refresh quota data'}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="font-medium">{refreshing ? 'Refreshing...' : '🔄 Refresh'}</span>
        </button>

        {/* Create Quota Button */}
        <button
          onClick={onCreateQuota}
          className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-2xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400/30 hover:border-blue-300/50"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>✨ Create Quota</span>
        </button>
      </div>
    </div>
  );
};

export default QuotaToolbar; 