// 📊 Usage Charts Component - MODERNIZED
// Data visualization for usage analytics with modern glassmorphism design
// Uses Recharts library for professional chart rendering with dark theme

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

import { ProviderStats, UsageSummary, MostUsedModelsResponse } from '../../types/usage';

interface UsageChartsProps {
  summary: UsageSummary | null;
  mostUsedModels: MostUsedModelsResponse | null;
  isLoading: boolean;
  error: string | null;
}

const UsageCharts: React.FC<UsageChartsProps> = ({
  summary,
  mostUsedModels,
  isLoading,
  error
}) => {

  // =============================================================================
  // VIEW STATE MANAGEMENT
  // =============================================================================

  const [viewMode, setViewMode] = useState<'models' | 'providers'>('models');
  const [showAllModels, setShowAllModels] = useState(false);
  const defaultModelLimit = 5;

  // =============================================================================
  // CHART CONFIGURATION (DEFINE COLORS FIRST)
  // =============================================================================

  const CHART_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16'  // Lime
  ];

  // Dark theme colors for charts
  const DARK_THEME = {
    background: 'transparent',
    text: '#E5E7EB',
    grid: '#374151',
    axis: '#6B7280'
  };

  // =============================================================================
  // CHART DATA PROCESSING
  // =============================================================================

  // Helper function to create short display names for charts
  const getShortDisplayName = (provider: string): string => {
    const nameMap: { [key: string]: string } = {
      'anthropic': 'Claude',
      'openai': 'OpenAI',
      'xai': 'xAI',
      'test-provider': 'Test',
      'groq': 'Groq',
      'cohere': 'Cohere',
      'mistral': 'Mistral'
    };
    return nameMap[provider.toLowerCase()] || provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const providerChartData = useMemo(() => {
    if (!summary?.providers) return [];
    
    return summary.providers
      .map((provider, index) => ({
        name: provider.provider,
        displayName: getShortDisplayName(provider.provider),
        fullName: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
        requests: provider.requests.total,
        successfulRequests: provider.requests.successful,
        failedRequests: provider.requests.total - provider.requests.successful,
        tokens: provider.tokens.total,
        cost: provider.cost.total_usd,
        avgResponseTime: provider.performance.average_response_time_ms,
        successRate: provider.requests.success_rate,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [summary?.providers]);

  // Model data processing - new functionality
  const getShortModelName = (model: string): string => {
    // Truncate very long model names for better chart display
    if (model.length > 15) {
      return model.substring(0, 12) + '...';
    }
    return model;
  };

  const modelChartData = useMemo(() => {
    if (!mostUsedModels?.models) return [];
    
    const modelsToShow = showAllModels 
      ? mostUsedModels.models 
      : mostUsedModels.models.slice(0, defaultModelLimit);
    
    return modelsToShow
      .map((model, index) => ({
        name: model.model,
        displayName: getShortModelName(model.model),
        fullName: `${model.model} (${model.provider})`,
        provider: model.provider,
        requests: model.requests.total,
        successfulRequests: model.requests.successful,
        failedRequests: model.requests.failed,
        tokens: model.tokens.total,
        cost: model.cost.total_usd,
        avgResponseTime: model.performance.average_response_time_ms,
        successRate: model.requests.success_rate_percent,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }));
  }, [mostUsedModels?.models, showAllModels]);

  const modelCostBreakdownData = useMemo(() => {
    if (!mostUsedModels?.models) return [];
    
    const modelsToShow = showAllModels 
      ? mostUsedModels.models 
      : mostUsedModels.models.slice(0, defaultModelLimit);
    
    const totalCost = modelsToShow.reduce((sum, model) => sum + model.cost.total_usd, 0);
    const hasAnyCost = modelsToShow.some(model => model.cost.total_usd > 0);
    
    if (!hasAnyCost && modelsToShow.length > 0) {
      return modelsToShow.map((model, index) => ({
        name: model.model,
        displayName: getShortModelName(model.model),
        fullName: `${model.model} (${model.provider})`,
        provider: model.provider,
        cost: 0,
        percentage: (100 / modelsToShow.length).toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: true
      }));
    }
    
    return modelsToShow
      .filter(model => model.cost.total_usd > 0)
      .map((model, index) => ({
        name: model.model,
        displayName: getShortModelName(model.model),
        fullName: `${model.model} (${model.provider})`,
        provider: model.provider,
        cost: model.cost.total_usd,
        percentage: totalCost > 0 ? (model.cost.total_usd / totalCost * 100).toFixed(1) : '0',
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: false
      }));
  }, [mostUsedModels?.models, showAllModels]);

  const modelPerformanceData = useMemo(() => {
    if (!mostUsedModels?.models) return [];
    
    const modelsToShow = showAllModels 
      ? mostUsedModels.models 
      : mostUsedModels.models.slice(0, defaultModelLimit);
    
    return modelsToShow
      .map((model, index) => ({
        name: model.model,
        displayName: getShortModelName(model.model),
        fullName: `${model.model} (${model.provider})`,
        provider: model.provider,
        responseTime: model.performance.average_response_time_ms,
        successRate: model.requests.success_rate_percent,
        costPerRequest: model.cost.average_per_request,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }));
  }, [mostUsedModels?.models, showAllModels]);

  const costBreakdownData = useMemo(() => {
    if (!summary?.providers) return [];
    
    const totalCost = summary.overview.total_cost_usd;
    const hasAnyCost = summary.providers.some(provider => provider.cost.total_usd > 0);
    
    if (!hasAnyCost && summary.providers.length > 0) {
      return summary.providers.map((provider, index) => ({
        name: provider.provider,
        displayName: getShortDisplayName(provider.provider),
        fullName: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
        cost: 0,
        percentage: (100 / summary.providers.length).toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: true
      }));
    }
    
    return summary.providers
      .filter(provider => provider.cost.total_usd > 0)
      .map((provider, index) => ({
        name: provider.provider,
        displayName: getShortDisplayName(provider.provider),
        fullName: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
        cost: provider.cost.total_usd,
        percentage: (provider.cost.total_usd / totalCost * 100).toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: false
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [summary?.providers, summary?.overview.total_cost_usd]);

  const performanceData = useMemo(() => {
    if (!summary?.providers) return [];
    
    return summary.providers
      .map((provider, index) => ({
        name: provider.provider,
        displayName: getShortDisplayName(provider.provider),
        fullName: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
        responseTime: provider.performance.average_response_time_ms,
        successRate: provider.requests.success_rate,
        costPerRequest: provider.cost.average_per_request,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => a.responseTime - b.responseTime);
  }, [summary?.providers]);

  // Dynamic data selection based on view mode - defined after all base data
  const currentChartData = viewMode === 'models' ? modelChartData : providerChartData;
  const currentCostData = viewMode === 'models' ? modelCostBreakdownData : costBreakdownData;
  const currentPerformanceData = viewMode === 'models' ? modelPerformanceData : performanceData;

  // =============================================================================
  // CUSTOM COMPONENTS
  // =============================================================================

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the full name from the current data
      const dataPoint = currentChartData.find(d => d.displayName === label) || 
                       currentPerformanceData.find(d => d.displayName === label);
      const fullLabel = dataPoint?.fullName || label;
      
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl p-4 min-w-[200px]">
          <p className="font-medium text-white mb-3 text-sm">{fullLabel}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-blue-200 mb-1" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl p-4 min-w-[200px]">
          <p className="font-semibold text-white mb-2 text-sm">{data.fullName}</p>
          <div className="text-sm text-blue-200">
            {data.isZeroCost ? (
              <p><span className="font-medium text-white">Distribution:</span> {data.percentage}%</p>
            ) : (
              <>
                <p><span className="font-medium text-white">Cost:</span> ${Number(data.cost).toFixed(4)}</p>
                <p><span className="font-medium text-white">Percentage:</span> {data.percentage}%</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom pie chart label with better positioning
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if percentage is significant enough (> 5%)
    if (percent < 0.05) return null;
    
    // Use appropriate short name based on view mode
    const shortName = viewMode === 'models' ? getShortModelName(name) : getShortDisplayName(name);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#E5E7EB" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${shortName}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // =============================================================================
  // LOADING AND ERROR STATES
  // =============================================================================

  const renderLoading = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 animate-pulse border border-white/10">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  const renderError = () => (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 text-center mb-8">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Failed to Load Charts</h3>
      <p className="text-blue-200">
        {error ? `Failed to load chart data: ${error}` : 'No data available for charts.'}
      </p>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  if (isLoading) {
    return renderLoading();
  }

  if (error || !summary) {
    return renderError();
  }

  return (
    <div className="space-y-6 mb-8">
      
      {/* View Controls Header */}
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Usage Analytics Charts</h3>
              <p className="text-sm text-blue-200">
                Viewing by {viewMode === 'models' ? 'AI Models' : 'Providers'}
                {viewMode === 'models' && mostUsedModels?.models && (
                  <span className="ml-2">
                    • Showing {showAllModels ? mostUsedModels.models.length : Math.min(defaultModelLimit, mostUsedModels.models.length)} of {mostUsedModels.models.length} models
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-white/10 rounded-xl p-1 flex space-x-1">
              <button
                onClick={() => setViewMode('models')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'models'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/20'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Models</span>
                </span>
              </button>
              <button
                onClick={() => setViewMode('providers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'providers'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/20'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Providers</span>
                </span>
              </button>
            </div>
            
            {/* Show All Models Toggle - only visible in models view */}
            {viewMode === 'models' && mostUsedModels?.models && mostUsedModels.models.length > defaultModelLimit && (
              <button
                onClick={() => setShowAllModels(!showAllModels)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAllModels ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
                <span>{showAllModels ? `Show Top ${defaultModelLimit}` : `Show All ${mostUsedModels.models.length}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Requests Chart */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Requests by {viewMode === 'models' ? 'Model' : 'Provider'}</h3>
              <p className="text-sm text-blue-200">Success vs failed requests</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text }} 
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: DARK_THEME.text }} />
              <Bar 
                dataKey="successfulRequests" 
                name="Successful" 
                fill="#10B981" 
                stackId="requests"
              />
              <Bar 
                dataKey="failedRequests" 
                name="Failed" 
                fill="#EF4444" 
                stackId="requests"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Distribution Chart */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Cost Distribution by {viewMode === 'models' ? 'Model' : 'Provider'}
                {currentCostData.length > 0 && currentCostData[0]?.isZeroCost && (
                  <span className="ml-2 text-sm text-blue-300 font-normal">
                    (No costs in selected period)
                  </span>
                )}
              </h3>
              <p className="text-sm text-blue-200">Financial breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={currentCostData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={75}
                innerRadius={20}
                fill="#8884d8"
                dataKey={currentCostData.length > 0 && currentCostData[0]?.isZeroCost ? "percentage" : "cost"}
                paddingAngle={2}
              >
                {currentCostData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {currentCostData.length === 0 ? (
              <div className="text-center text-blue-200 text-sm py-4">
                No {viewMode === 'models' ? 'model' : 'provider'} data available
              </div>
            ) : currentCostData[0]?.isZeroCost ? (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <span className="text-blue-200 text-sm font-medium">
                    No costs recorded in the selected period. Chart shows {viewMode === 'models' ? 'model' : 'provider'} availability.
                  </span>
                </div>
              </div>
            ) : null}
            {currentCostData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-white font-medium">{item.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-white">
                    {item.isZeroCost ? 'Available' : `${item.cost.toFixed(4)}`}
                  </span>
                  <span className="text-blue-300 ml-2 text-xs">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Performance and Efficiency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Response Time Comparison */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Average Response Time by {viewMode === 'models' ? 'Model' : 'Provider'}</h3>
              <p className="text-sm text-blue-200">Performance comparison</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text }}
                label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text } }}
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#E5E7EB'
                }}
                formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Comparison */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Success Rate by {viewMode === 'models' ? 'Model' : 'Provider'}</h3>
              <p className="text-sm text-blue-200">Reliability metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text }}
                domain={[80, 100]}
                label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text } }}
                axisLine={{ stroke: DARK_THEME.axis }}
                tickLine={{ stroke: DARK_THEME.axis }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#E5E7EB'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
              />
              <Bar 
                dataKey="successRate" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Token Usage Analysis */}
      <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Token Usage and Cost Efficiency</h3>
            <p className="text-sm text-blue-200">Volume and cost analysis by {viewMode === 'models' ? 'model' : 'provider'}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={currentChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 11, fill: DARK_THEME.text }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: DARK_THEME.axis }}
              tickLine={{ stroke: DARK_THEME.axis }}
              tickMargin={8}
            />
            <YAxis 
              yAxisId="tokens"
              orientation="left"
              tick={{ fontSize: 12, fill: DARK_THEME.text }}
              label={{ value: 'Tokens', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text } }}
              axisLine={{ stroke: DARK_THEME.axis }}
              tickLine={{ stroke: DARK_THEME.axis }}
            />
            <YAxis 
              yAxisId="cost"
              orientation="right"
              tick={{ fontSize: 12, fill: DARK_THEME.text }}
              label={{ value: 'Cost ($)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: DARK_THEME.text } }}
              axisLine={{ stroke: DARK_THEME.axis }}
              tickLine={{ stroke: DARK_THEME.axis }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: DARK_THEME.text }} />
            <Bar 
              yAxisId="tokens"
              dataKey="tokens" 
              name="Total Tokens" 
              fill="#8B5CF6"
            />
            <Line 
              yAxisId="cost"
              type="monotone" 
              dataKey="cost" 
              name="Total Cost ($)" 
              stroke="#F59E0B"
              strokeWidth={3}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {currentChartData.map((item) => (
            <div key={item.name} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="font-semibold text-white mb-3 text-center">{item.fullName}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-200">
                  <span>Tokens:</span>
                  <span className="font-medium text-white">{item.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-200">
                  <span>Cost:</span>
                  <span className="font-medium text-white">${item.cost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-blue-200">
                  <span>Efficiency:</span>
                  <span className="font-medium text-white">
                    {item.tokens > 0 ? (item.cost / item.tokens * 1000).toFixed(2) : '0'} $/1K
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default UsageCharts;
