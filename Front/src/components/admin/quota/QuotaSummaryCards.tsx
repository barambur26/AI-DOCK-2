// 🎯 Quota Summary Cards Component
// Displays quota statistics overview cards

import React from 'react';

// =============================================================================
// INTERFACES
// =============================================================================

interface QuotaSummary {
  totalQuotas: number;
  activeQuotas: number;
  exceededQuotas: number;
  nearLimitQuotas: number;
}

interface QuotaSummaryCardsProps {
  summary: QuotaSummary;
  loading?: boolean;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Quota Summary Cards Component
 * 
 * Displays overview statistics in glassmorphism-themed cards.
 * Learning: This demonstrates the single responsibility principle - 
 * one component focused only on displaying summary data.
 */
export const QuotaSummaryCards: React.FC<QuotaSummaryCardsProps> = ({
  summary,
  loading = false,
  className = ''
}) => {
  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render a single summary card
   */
  const renderCard = (
    value: number,
    label: string,
    colorClass: string,
    bgGradient: string,
    icon?: string
  ) => (
    <div className={`relative bg-gradient-to-br ${bgGradient} backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 group overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`text-3xl font-bold ${colorClass} mb-2`}>
            {loading ? (
              <div className="animate-pulse bg-gray-200/50 h-8 w-16 rounded-lg"></div>
            ) : (
              <span className="tabular-nums">{value.toLocaleString()}</span>
            )}
          </div>
          <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</div>
        </div>
        {icon && (
          <div className="text-4xl opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110 transform transition-transform">
            {icon}
          </div>
        )}
      </div>
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${bgGradient}`}></div>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={`quota-summary-cards ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {renderCard(
          summary.totalQuotas,
          'Total Quotas',
          'text-slate-900',
          'from-slate-50 to-gray-100',
          '📊'
        )}
        
        {renderCard(
          summary.activeQuotas,
          'Active Quotas',
          'text-emerald-700',
          'from-emerald-50 to-green-100',
          '✅'
        )}
        
        {renderCard(
          summary.nearLimitQuotas,
          'Near Limit',
          'text-amber-700',
          'from-amber-50 to-yellow-100',
          '⚠️'
        )}
        
        {renderCard(
          summary.exceededQuotas,
          'Exceeded',
          'text-red-700',
          'from-red-50 to-rose-100',
          '🚨'
        )}
      </div>
    </div>
  );
};

export default QuotaSummaryCards;