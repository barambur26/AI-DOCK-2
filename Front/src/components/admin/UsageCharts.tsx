// 📊 Usage Charts Component - MODERNIZED
// Data visualization for usage analytics with modern glassmorphism design
// Uses Recharts library for professional chart rendering with dark theme

import React, { useMemo, useState, useEffect } from 'react';
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

import { ProviderStats, UsageSummary, MostUsedModelsResponse, DepartmentAnalyticsResponse, DepartmentChartData } from '../../types/usage';
import { usageAnalyticsService } from '../../services/usageAnalyticsService';
import { formatCurrency } from '../../utils/formatUtils';

interface UsageChartsProps {
  summary: UsageSummary | null;
  mostUsedModels: MostUsedModelsResponse | null;
  isLoading: boolean;
  error: string | null;
}

// Utility to safely coerce any value to a finite number (fallback to 0)
function safeNumber(val: any): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
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

  const [viewMode, setViewMode] = useState<'models' | 'providers' | 'departments'>('models');
  const [showAllModels, setShowAllModels] = useState(false);
  const defaultModelLimit = 5;
  
  // Department analytics state
  const [departmentAnalytics, setDepartmentAnalytics] = useState<DepartmentAnalyticsResponse | null>(null);
  const [isDepartmentLoading, setIsDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

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

  // Enhanced dark theme with 3D effects for charts
  const DARK_THEME = {
    background: 'transparent',
    text: '#E5E7EB',
    grid: 'rgba(55, 65, 81, 0.6)',
    axis: '#6B7280',
    gridGlow: 'rgba(59, 130, 246, 0.1)'
  };

  // 3D Enhanced chart colors with gradients
  const ENHANCED_CHART_COLORS = [
    { fill: '#3B82F6', gradient: 'url(#blueGradient)' },
    { fill: '#10B981', gradient: 'url(#greenGradient)' },
    { fill: '#F59E0B', gradient: 'url(#amberGradient)' },
    { fill: '#EF4444', gradient: 'url(#redGradient)' },
    { fill: '#8B5CF6', gradient: 'url(#purpleGradient)' },
    { fill: '#06B6D4', gradient: 'url(#cyanGradient)' },
    { fill: '#F97316', gradient: 'url(#orangeGradient)' },
    { fill: '#84CC16', gradient: 'url(#limeGradient)' }
  ];

  // Enhanced gradients for 3D effect
  const renderGradientDefs = () => (
    <defs>
      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#047857" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F87171" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#0891B2" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FB923C" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#EA580C" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A3E635" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#65A30D" stopOpacity={0.7} />
      </linearGradient>
      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34D399" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="failureGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F87171" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#DC2626" stopOpacity={0.8} />
      </linearGradient>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
      </linearGradient>
      <linearGradient id="textGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#E5E7EB" stopOpacity={1} />
        <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/> 
        </feMerge>
      </filter>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
  );

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

  // Department data processing - new functionality
  const departmentChartData = useMemo(() => {
    if (!departmentAnalytics?.departments) return [];
    
    return departmentAnalytics.departments
      .map((dept, index) => ({
        name: dept.department_info.code || dept.department_name,
        displayName: dept.department_info.code || dept.department_name.substring(0, 15),
        fullName: dept.department_name,
        department_id: dept.department_id,
        requests: safeNumber(dept.requests.total),
        successfulRequests: safeNumber(dept.requests.successful),
        failedRequests: safeNumber(dept.requests.failed),
        tokens: safeNumber(dept.tokens.total),
        cost: safeNumber(dept.cost.total_usd),
        avgResponseTime: safeNumber(dept.performance.average_response_time_ms),
        successRate: safeNumber(dept.requests.success_rate),
        budget: safeNumber(dept.budget_analysis.monthly_budget),
        budgetUtilization: safeNumber(dept.budget_analysis.budget_utilization_percent),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.requests - a.requests);
  }, [departmentAnalytics?.departments]);

  const departmentCostBreakdownData = useMemo(() => {
    if (!departmentAnalytics?.departments) return [];
    
    const totalCost = departmentAnalytics.departments.reduce((sum, dept) => sum + safeNumber(dept.cost.total_usd), 0);
    const hasAnyCost = departmentAnalytics.departments.some(dept => safeNumber(dept.cost.total_usd) > 0);
    
    if (!hasAnyCost && departmentAnalytics.departments.length > 0) {
      return departmentAnalytics.departments.map((dept, index) => ({
        name: dept.department_info.code || dept.department_name,
        displayName: dept.department_info.code || dept.department_name.substring(0, 15),
        fullName: dept.department_name,
        cost: 0,
        percentage: (100 / departmentAnalytics.departments.length).toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: true
      }));
    }
    
    return departmentAnalytics.departments
      .filter(dept => safeNumber(dept.cost.total_usd) > 0)
      .map((dept, index) => ({
        name: dept.department_info.code || dept.department_name,
        displayName: dept.department_info.code || dept.department_name.substring(0, 15),
        fullName: dept.department_name,
        cost: safeNumber(dept.cost.total_usd),
        percentage: totalCost > 0 ? (safeNumber(dept.cost.total_usd) / totalCost * 100).toFixed(1) : '0',
        color: CHART_COLORS[index % CHART_COLORS.length],
        isZeroCost: false
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [departmentAnalytics?.departments]);

  const departmentPerformanceData = useMemo(() => {
    if (!departmentAnalytics?.departments) return [];
    
    return departmentAnalytics.departments
      .map((dept, index) => ({
        name: dept.department_info.code || dept.department_name,
        displayName: dept.department_info.code || dept.department_name.substring(0, 15),
        fullName: dept.department_name,
        responseTime: safeNumber(dept.performance.average_response_time_ms),
        successRate: safeNumber(dept.requests.success_rate),
        costPerRequest: safeNumber(dept.cost.average_per_request),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => a.responseTime - b.responseTime);
  }, [departmentAnalytics?.departments]);

  const quotaFulfillmentData = useMemo(() => {
    if (!departmentAnalytics?.departments) return [];
    
    return departmentAnalytics.departments
      .map((dept, index) => {
        // 🔧 CRITICAL: Add NaN protection for all numeric values
        const budget = safeNumber(dept.budget_analysis?.monthly_budget);
        const used = safeNumber(dept.cost?.total_usd);
        const remaining = Math.max(0, budget - used);
        const utilization = budget > 0 ? (used / budget) * 100 : 0;
        
        // 🔧 Validate all numbers are finite before using in charts
        const safeValues = {
          budget: safeNumber(budget),
          used: safeNumber(used),
          remaining: safeNumber(remaining),
          utilization: safeNumber(utilization)
        };
        
        return {
          name: dept.department_info?.code || dept.department_name,
          displayName: (dept.department_info?.code || dept.department_name)?.substring(0, 15) || 'Unknown',
          fullName: dept.department_name || 'Unknown Department',
          budget: safeValues.budget,
          used: safeValues.used,
          remaining: safeValues.remaining,
          utilization: safeValues.utilization,
          color: CHART_COLORS[index % CHART_COLORS.length],
          isOverBudget: safeValues.used > safeValues.budget && safeValues.budget > 0
        };
      })
      .filter(item => {
        // 🔧 Filter out any items with invalid data
        const isValid = isFinite(item.budget) && isFinite(item.used) && 
                       isFinite(item.remaining) && isFinite(item.utilization);
        if (!isValid) {
          console.warn(`⚠️ Filtering out invalid department data:`, item);
        }
        return isValid;
      })
      .sort((a, b) => b.budget - a.budget);
  }, [departmentAnalytics?.departments]);

  // Dynamic data selection based on view mode - defined after all base data
  const currentChartData = viewMode === 'models' ? modelChartData : 
                          viewMode === 'providers' ? providerChartData : 
                          departmentChartData;
  const currentCostData = viewMode === 'models' ? modelCostBreakdownData : 
                         viewMode === 'providers' ? costBreakdownData : 
                         departmentCostBreakdownData;
  const currentPerformanceData = viewMode === 'models' ? modelPerformanceData : 
                                viewMode === 'providers' ? performanceData : 
                                departmentPerformanceData;

  // =============================================================================
  // DATA LOADING EFFECTS
  // =============================================================================

  /**
   * Load department analytics when switching to departments view
   * Reset state when switching away from departments view
   */
  useEffect(() => {
    if (viewMode === 'departments') {
      // Only load if we don't have data and we're not already loading
      if (!departmentAnalytics && !isDepartmentLoading) {
        console.log('📊 Loading department analytics...');
        setIsDepartmentLoading(true);
        setDepartmentError(null);
        
        usageAnalyticsService.getDepartmentAnalytics(30)
          .then(data => {
            console.log('✅ Department analytics loaded:', data);
            setDepartmentAnalytics(data);
            setDepartmentError(null);
          })
          .catch(error => {
            console.error('❌ Failed to load department analytics:', error);
            setDepartmentError(error.message || 'Failed to load department analytics');
            setDepartmentAnalytics(null);
          })
          .finally(() => {
            setIsDepartmentLoading(false);
          });
      }
    } else {
      // 🔧 Clear department data when switching away from departments view
      if (departmentAnalytics || departmentError) {
        console.log('🗑️ Clearing department analytics (switched away from departments view)');
        setDepartmentAnalytics(null);
        setDepartmentError(null);
        setIsDepartmentLoading(false);
      }
    }
  }, [viewMode]); // 🔧 FIXED: Only depend on viewMode

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
        <div className="bg-gray-900/95 backdrop-blur-lg border border-cyan-400/30 rounded-xl shadow-2xl p-4 min-w-[200px] transform transition-all duration-200 hover:scale-105" style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 20px rgba(6, 182, 212, 0.3)'
        }}>
          <p className="font-medium text-white mb-3 text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{fullLabel}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-blue-200 mb-1 flex items-center space-x-2" style={{ color: entry.color }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }}></div>
              <span className="font-medium">{entry.name}:</span> 
              <span className="text-white font-semibold">{entry.value.toLocaleString()}</span>
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
        <div className="bg-gray-900/95 backdrop-blur-lg border border-purple-400/30 rounded-xl shadow-2xl p-4 min-w-[200px] transform transition-all duration-200 hover:scale-105" style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          <p className="font-semibold text-white mb-2 text-sm bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{data.fullName}</p>
          <div className="text-sm text-blue-200">
            {data.isZeroCost ? (
              <p className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" style={{ boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)' }}></div>
                <span className="font-medium text-white">Distribution:</span> 
                <span className="text-purple-300 font-semibold">{data.percentage}%</span>
              </p>
            ) : (
              <>
                <p className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" style={{ boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }}></div>
                  <span className="font-medium text-white">Cost:</span> 
                  <span className="text-green-300 font-semibold">{formatCurrency(Number(data.cost))}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)' }}></div>
                  <span className="font-medium text-white">Percentage:</span> 
                  <span className="text-purple-300 font-semibold">{data.percentage}%</span>
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Enhanced pie chart label with 3D glow effect
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
      <g>
        {/* Shadow text for 3D effect */}
        <text 
          x={x + 1} 
          y={y + 1} 
          fill="rgba(0, 0, 0, 0.5)" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
        >
          {`${shortName}: ${(percent * 100).toFixed(1)}%`}
        </text>
        {/* Main text with enhanced styling */}
        <text 
          x={x} 
          y={y} 
          fill="#E5E7EB" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          style={{ filter: 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' }}
        >
          {`${shortName}: ${(percent * 100).toFixed(1)}%`}
        </text>
      </g>
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

  // Show loading if main data is loading OR if departments view is loading
  if (isLoading || (viewMode === 'departments' && isDepartmentLoading && !departmentAnalytics)) {
    return renderLoading();
  }

  // Show error for main data only - departments errors are handled gracefully
  if (error || !summary) {
    return renderError();
  }

  // 🔧 For departments view: show graceful fallback if there's an error
  const isDepartmentsViewWithError = viewMode === 'departments' && departmentError && !departmentAnalytics;
  const shouldShowDepartmentsError = isDepartmentsViewWithError;

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
                Viewing by {viewMode === 'models' ? 'AI Models' : viewMode === 'providers' ? 'Providers' : 'Departments'}
                {viewMode === 'models' && mostUsedModels?.models && (
                  <span className="ml-2">
                    • Showing {showAllModels ? mostUsedModels.models.length : Math.min(defaultModelLimit, mostUsedModels.models.length)} of {mostUsedModels.models.length} models
                  </span>
                )}
                {viewMode === 'departments' && departmentAnalytics?.departments && (
                  <span className="ml-2">
                    • Showing {departmentAnalytics.departments.length} departments with usage data
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
              <button
                onClick={() => setViewMode('departments')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  viewMode === 'departments'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-white/20'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Departments</span>
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
              <h3 className="text-lg font-semibold text-white">Requests by {viewMode === 'models' ? 'Model' : viewMode === 'providers' ? 'Provider' : 'Department'}</h3>
              <p className="text-sm text-blue-200">Success vs failed requests</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentChartData}>
              {renderGradientDefs()}
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke={DARK_THEME.grid} 
                strokeOpacity={0.6}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text, fontWeight: 500 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text, fontWeight: 500 }} 
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: DARK_THEME.text, fontWeight: 600 }} />
              <Bar 
                dataKey="successfulRequests" 
                name="Successful" 
                fill="url(#successGradient)"
                stackId="requests"
                radius={[0, 0, 0, 0]}
                filter="url(#shadow)"
                animationDuration={1000}
              />
              <Bar 
                dataKey="failedRequests" 
                name="Failed" 
                fill="url(#failureGradient)"
                stackId="requests"
                radius={[6, 6, 0, 0]}
                filter="url(#shadow)"
                animationDuration={1200}
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
                Cost Distribution by {viewMode === 'models' ? 'Model' : viewMode === 'providers' ? 'Provider' : 'Department'}
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
              {renderGradientDefs()}
              <Pie
                data={currentCostData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderPieLabel}
                outerRadius={85}
                innerRadius={30}
                fill="#8884d8"
                dataKey={currentCostData.length > 0 && currentCostData[0]?.isZeroCost ? "percentage" : "cost"}
                paddingAngle={3}
                animationDuration={1000}
                animationBegin={0}
              >
                {currentCostData.map((entry, index) => {
                  const enhancedColor = ENHANCED_CHART_COLORS[index % ENHANCED_CHART_COLORS.length];
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={enhancedColor.gradient}
                      stroke={enhancedColor.fill}
                      strokeWidth={2}
                      filter="url(#shadow)"
                    />
                  );
                })}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {currentCostData.length === 0 ? (
              <div className="text-center text-blue-200 text-sm py-4">
                No {viewMode === 'models' ? 'model' : viewMode === 'providers' ? 'provider' : 'department'} data available
              </div>
            ) : currentCostData[0]?.isZeroCost ? (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">i</span>
                  </div>
                  <span className="text-blue-200 text-sm font-medium">
                    No costs recorded in the selected period. Chart shows {viewMode === 'models' ? 'model' : viewMode === 'providers' ? 'provider' : 'department'} availability.
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
              <h3 className="text-lg font-semibold text-white">Average Response Time by {viewMode === 'models' ? 'Model' : viewMode === 'providers' ? 'Provider' : 'Department'}</h3>
              <p className="text-sm text-blue-200">Performance comparison</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currentPerformanceData}>
              {renderGradientDefs()}
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke={DARK_THEME.grid} 
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text, fontWeight: 500 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text, fontWeight: 500 }}
                label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text, fontWeight: 600 } }}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  color: '#E5E7EB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.3)'
                }}
                formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Response Time']}
              />
              <Area
                type="monotone"
                dataKey="responseTime"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#areaGradient)"
                animationDuration={1500}
                filter="url(#glow)"
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
              <h3 className="text-lg font-semibold text-white">Success Rate by {viewMode === 'models' ? 'Model' : viewMode === 'providers' ? 'Provider' : 'Department'}</h3>
              <p className="text-sm text-blue-200">Reliability metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentPerformanceData}>
              {renderGradientDefs()}
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke={DARK_THEME.grid} 
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text, fontWeight: 500 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text, fontWeight: 500 }}
                domain={[80, 100]}
                label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text, fontWeight: 600 } }}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  color: '#E5E7EB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.3)'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
              />
              <Bar 
                dataKey="successRate" 
                fill="url(#successGradient)"
                radius={[8, 8, 0, 0]}
                filter="url(#shadow)"
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Quota Fulfillment by Department - Double Bar Chart */}
      {viewMode === 'departments' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Quota Fulfillment by Department</h3>
              <p className="text-sm text-blue-200">Budget usage and remaining allocation</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={departmentChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              {renderGradientDefs()}
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke={DARK_THEME.grid} 
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <XAxis 
                dataKey="displayName" 
                tick={{ fontSize: 11, fill: DARK_THEME.text, fontWeight: 500 }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: DARK_THEME.text, fontWeight: 500 }}
                axisLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                tickLine={{ stroke: DARK_THEME.axis, strokeWidth: 2 }}
                label={{ value: 'Dollars ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: DARK_THEME.text, fontWeight: 600 } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  borderRadius: '12px', 
                  color: '#E5E7EB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)'
                }}
                formatter={(value: number, name: string) => [`${value.toFixed(2)}`, name]} 
              />
              <Legend wrapperStyle={{ color: DARK_THEME.text, fontWeight: 600 }} />
              {/* Side-by-side bars with 3D gradients */}
              <Bar 
                dataKey="budget" 
                name="Monthly Budget" 
                fill="url(#blueGradient)" 
                radius={[6, 6, 0, 0]}
                filter="url(#shadow)"
                animationDuration={1000}
              />
              <Bar 
                dataKey="cost" 
                name="Amount Used" 
                fill="url(#greenGradient)" 
                radius={[6, 6, 0, 0]}
                filter="url(#shadow)"
                animationDuration={1200}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {departmentChartData.map((item) => (
              <div key={item.name} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="font-semibold text-white mb-3 text-center">{item.fullName}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-200">
                    <span>Budget:</span>
                    <span className="font-medium text-white">${item.budget.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Used:</span>
                    <span className={`font-medium ${item.isOverBudget ? 'text-red-400' : 'text-green-400'}`}>${item.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Remaining:</span>
                    <span className={`font-medium ${item.budget - item.cost < 0 ? 'text-red-400' : 'text-green-400'}`}>${Math.max(0, item.budget - item.cost).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-blue-200">
                    <span>Utilization:</span>
                    <span className={`font-medium ${item.cost / item.budget > 1 ? 'text-red-400' : item.cost / item.budget > 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>{item.budget > 0 ? ((item.cost / item.budget) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                  {item.isOverBudget && (
                    <div className="mt-2 p-2 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-xs text-center">
                      ⚠️ Over Budget
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default UsageCharts;
