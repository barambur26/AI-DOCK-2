// 📊 Usage Dashboard - Main Component
// Complete usage analytics dashboard combining all visualization components
// Executive-level overview of AI usage, costs, performance, and activity monitoring

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usageAnalyticsService, Department, Provider, Model } from '../../services/usageAnalyticsService';
import { DashboardData, DashboardState, TopUserMetric } from '../../types/usage';

// Import our dashboard components
import UsageDashboardOverview from './UsageDashboardOverview';
import UsageCharts from './UsageCharts';
import TopUsersTable from './TopUsersTable';
import RecentActivity from './RecentActivity';
import MostUsedModels from './MostUsedModels';
import UnifiedFiltersButton from './UnifiedFiltersButton';

/**
 * Usage Dashboard Component
 * 
 * Learning: This is the "orchestrator" component that manages the entire
 * usage analytics dashboard. It handles data loading, state management,
 * and coordinates all the sub-components.
 * 
 * Design Pattern: This follows the "container component" pattern where
 * one smart component manages data and passes it to multiple presentation components.
 * This keeps the data logic centralized and components focused.
 * 
 * Architecture: 
 * - Loads all dashboard data in parallel for performance
 * - Manages loading states and error handling
 * - Provides refresh and period selection functionality
 * - Handles component coordination and communication
 */

const UsageDashboard: React.FC = () => {

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [dashboardState, setDashboardState] = useState<DashboardState>({
    isLoading: true,
    isRefreshing: false,
    error: null,
    data: null,
    lastUpdated: null,
    selectedPeriod: 30,
    selectedMetric: 'total_cost'
  });

  // Department filtering state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  // Provider filtering state  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  
  // Model filtering state
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, Model[]>>({});
  
  // Filter UI state (showAdvancedFilters and advancedFilterTab now handled in AdvancedFilterPanel component)
  


  // Prevent duplicate API calls
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  // =============================================================================
  // DATA LOADING FUNCTIONS
  // =============================================================================

  /**
   * Load departments for filter dropdown
   */
  const loadDepartments = useCallback(async () => {
    try {
      const departmentList = await usageAnalyticsService.getDepartments();
      if (mountedRef.current) {
        setDepartments(departmentList);
      }
    } catch (error) {
      console.error('Failed to load departments:', error);
      // Don't fail the entire dashboard if departments can't be loaded
      if (mountedRef.current) {
        setDepartments([]);
      }
    }
  }, []);

  /**
   * Load providers for filter dropdown
   */
  const loadProviders = useCallback(async () => {
    try {
      const providerList = await usageAnalyticsService.getProviders();
      if (mountedRef.current) {
        setProviders(providerList);
        // Initialize with all providers selected
        setSelectedProviders(providerList.map(p => p.value));
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
      // Don't fail the entire dashboard if providers can't be loaded
      if (mountedRef.current) {
        setProviders([]);
        setSelectedProviders([]);
      }
    }
  }, []);

  /**
   * Load models for filter dropdown
   */
  const loadModels = useCallback(async () => {
    try {
      const [modelList, modelsByProviderMap] = await Promise.all([
        usageAnalyticsService.getModels(),
        usageAnalyticsService.getModelsByProvider()
      ]);
      if (mountedRef.current) {
        setModels(modelList);
        setModelsByProvider(modelsByProviderMap);
        // Initialize with all models selected
        setSelectedModels(modelList.map(m => m.value));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      // Don't fail the entire dashboard if models can't be loaded
      if (mountedRef.current) {
        setModels([]);
        setModelsByProvider({});
        setSelectedModels([]);
      }
    }
  }, []);

  /**
   * Load complete dashboard data
   * 
   * Learning: Loading multiple datasets in parallel improves performance.
   * We use Promise.all to fetch everything at once rather than sequentially.
   * This provides better user experience with faster load times.
   */
  const loadDashboardData = useCallback(async (days: number = 30, departmentId: number | null = null, providerIds: string[] = [], modelIds: string[] = [], isRefresh: boolean = false) => {
    // Prevent duplicate requests
    if (loadingRef.current) {
      console.log('⏭️ Skipping dashboard load - already in progress');
      return;
    }

    console.log(`📊 Loading dashboard data for ${days} days${departmentId ? ` (department: ${departmentId})` : ''}${providerIds.length ? ` (providers: ${providerIds.join(', ')})` : ''}${modelIds.length ? ` (models: ${modelIds.join(', ')})` : ''} (refresh: ${isRefresh})`);
    loadingRef.current = true;

    // Update loading state only if not already set by optimistic update
    setDashboardState(prev => ({
      ...prev,
      isLoading: prev.isLoading || (!isRefresh && !prev.data), // Preserve optimistic loading state
      isRefreshing: isRefresh,
      error: null
    }));

    try {
      // Load all dashboard data in parallel  
      const dashboardData = await usageAnalyticsService.getDashboardData(
        days, 
        departmentId || undefined, 
        providerIds.length > 0 ? providerIds : undefined,
        modelIds.length > 0 ? modelIds : undefined
      );
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        console.log('✅ Dashboard data loaded successfully');
        setDashboardState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: null,
          data: dashboardData,
          lastUpdated: new Date().toISOString(),
          // Only update selectedPeriod if it hasn't been optimistically updated
          selectedPeriod: prev.selectedPeriod === days ? prev.selectedPeriod : days
        }));
      }

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      if (mountedRef.current) {
        setDashboardState(prev => {
          // If we have existing data and this was a period change that failed,
          // reset to a period that doesn't cause confusion
          const shouldResetPeriod = prev.data && prev.selectedPeriod !== days;
          
          return {
            ...prev,
            isLoading: false,
            isRefreshing: false,
            error: error instanceof Error ? error.message : 'Failed to load dashboard data',
            // Reset selectedPeriod if this was a failed period change to avoid UI confusion
            selectedPeriod: shouldResetPeriod ? (prev.data ? 30 : days) : days
          };
        });
      }

    } finally {
      loadingRef.current = false;
    }
  }, []);

  /**
   * Handle period change (7, 30, 90 days)
   * 
   * Learning: Period selection is a common pattern in analytics dashboards.
   * Different time periods reveal different usage patterns and trends.
   */
  const handlePeriodChange = useCallback((days: number) => {
    console.log(`📅 Changing period to ${days} days`);
    
    // Update period immediately for UI responsiveness (optimistic update)
    setDashboardState(prev => ({
      ...prev,
      selectedPeriod: days,
      isLoading: true,
      isRefreshing: false,
      error: null
    }));
    
    loadDashboardData(days, selectedDepartment, selectedProviders, selectedModels, false);
  }, [loadDashboardData, selectedDepartment, selectedProviders, selectedModels]);

  /**
   * Handle department change
   * 
   * Learning: Department filtering allows admins to focus on specific
   * organizational units and their usage patterns.
   */
  const handleDepartmentChange = useCallback((departmentId: number | null) => {
    console.log(`🏢 Changing department filter to: ${departmentId || 'All Departments'}`);
    setSelectedDepartment(departmentId);
    loadDashboardData(dashboardState.selectedPeriod, departmentId, selectedProviders, selectedModels, false);
  }, [loadDashboardData, dashboardState.selectedPeriod, selectedProviders, selectedModels]);

  /**
   * Handle multiple providers selection change
   * 
   * Learning: Multi-select provider filtering allows admins to focus on specific
   * combinations of LLM providers and their usage patterns.
   */
  const handleProvidersChange = useCallback((providerIds: string[]) => {
    console.log(`🔧 Changing provider filters to: ${providerIds.length ? providerIds.join(', ') : 'All Providers'}`);
    setSelectedProviders(providerIds);
    loadDashboardData(dashboardState.selectedPeriod, selectedDepartment, providerIds, selectedModels, false);
  }, [loadDashboardData, dashboardState.selectedPeriod, selectedDepartment, selectedModels]);

  /**
   * Handle multiple models selection change
   * 
   * Learning: Multi-select model filtering allows admins to focus on specific
   * combinations of AI models and their usage patterns.
   */
  const handleModelsChange = useCallback((modelIds: string[]) => {
    console.log(`🤖 Changing model filters to: ${modelIds.length ? modelIds.join(', ') : 'All Models'}`);
    setSelectedModels(modelIds);
    loadDashboardData(dashboardState.selectedPeriod, selectedDepartment, selectedProviders, modelIds, false);
  }, [loadDashboardData, dashboardState.selectedPeriod, selectedDepartment, selectedProviders]);



  /**
   * Handle dashboard refresh
   * 
   * Learning: Refresh functionality is essential for operational dashboards.
   * Users need to see latest data without full page reload.
   */
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing dashboard data');
    loadDashboardData(dashboardState.selectedPeriod, selectedDepartment, selectedProviders, selectedModels, true);
  }, [loadDashboardData, dashboardState.selectedPeriod, selectedDepartment, selectedProviders, selectedModels]);

  /**
   * Handle metric selection change
   * 
   * Learning: Allowing users to switch between different metrics
   * (cost vs tokens vs requests) provides different perspectives on usage.
   */
  const handleMetricChange = useCallback((metric: TopUserMetric) => {
    setDashboardState(prev => ({
      ...prev,
      selectedMetric: metric
    }));
  }, []);

  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================

  /**
   * Initialize dashboard on component mount
   * 
   * Learning: useEffect with empty dependency array runs once on mount.
   * This is where we load initial data and set up the component.
   */
  useEffect(() => {
    console.log('🚀 Usage Dashboard mounting - loading initial data');
    mountedRef.current = true;

    // Load departments, providers, models, and initial dashboard data
    const initializeDashboard = async () => {
      await Promise.all([
        loadDepartments(),
        loadProviders(),
        loadModels()
      ]);
      await loadDashboardData(30, null, [], [], false);
    };
    
    initializeDashboard();

    // Cleanup function
    return () => {
      console.log('🧹 Usage Dashboard unmounting');
      mountedRef.current = false;
      loadingRef.current = false;
    };
  }, [loadDepartments, loadProviders, loadModels, loadDashboardData]); // Include dependencies

  /**
   * Auto-refresh setup (optional)
   * 
   * Learning: Auto-refresh can be useful for operational dashboards
   * but should be configurable to avoid unnecessary API calls.
   */
  useEffect(() => {
    // Auto-refresh every 5 minutes (optional)
    const autoRefreshInterval = setInterval(() => {
      if (!loadingRef.current && dashboardState.data) {
        console.log('⏰ Auto-refreshing dashboard data');
        handleRefresh();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [handleRefresh, dashboardState.data]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  /**
   * Handle user click in top users table
   * 
   * Learning: Cross-component communication helps users drill down into data.
   * Clicking a user could open detailed analytics or filter other views.
   */
  const handleUserClick = useCallback((userId: number) => {
    console.log(`👤 User clicked: ${userId}`);
    // Future: Could open user details modal or navigate to user page
    // For now, we'll just log it
  }, []);

  /**
   * Handle error retry
   * 
   * Learning: Error recovery is important for good UX.
   * Users should always have a way to retry failed operations.
   */
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying dashboard load after error');
    loadDashboardData(dashboardState.selectedPeriod, selectedDepartment, selectedProviders, selectedModels, false);
  }, [loadDashboardData, dashboardState.selectedPeriod, selectedDepartment, selectedProviders, selectedModels]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  /**
   * Render unified filters button component
   * 
   * Learning: Unified filtering provides a clean, single interface for all
   * filtering options including departments, providers, and models.
   */
  const renderUnifiedFilters = () => (
    <UnifiedFiltersButton
      departments={departments}
      providers={providers}
      models={models}
      modelsByProvider={modelsByProvider}
      selectedDepartment={selectedDepartment}
      selectedProviders={selectedProviders}
      selectedModels={selectedModels}
      onDepartmentChange={handleDepartmentChange}
      onProvidersChange={handleProvidersChange}
      onModelsChange={handleModelsChange}
      isLoading={dashboardState.isLoading}
      isRefreshing={dashboardState.isRefreshing}
    />
  );



  /**
   * Render period selector buttons
   * 
   * Learning: Time period selection is a standard pattern in analytics.
   * Common periods are 7, 30, 90 days, and sometimes custom ranges.
   */
  const renderPeriodSelector = () => {
    const periods = [
      { days: 7, label: '7 Days' },
      { days: 30, label: '30 Days' },
      { days: 90, label: '90 Days' }
    ];

    return (
      <div className="flex space-x-2">
        {periods.map(period => (
          <button
            key={period.days}
            onClick={() => handlePeriodChange(period.days)}
            disabled={dashboardState.isLoading || dashboardState.isRefreshing}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 transform ${
              dashboardState.selectedPeriod === period.days
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-400/50'
                : 'bg-white/10 text-blue-200 hover:bg-white/20 disabled:opacity-50 backdrop-blur-lg border border-white/10'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render dashboard header with controls
   * 
   * Learning: Dashboard headers should include key controls and status information.
   * This provides users with context and control over the view.
   */
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <span>📊</span>
            <span>Usage Analytics Dashboard</span>
            {dashboardState.isRefreshing && (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h1>
          <p className="text-blue-100 mt-2">
            Comprehensive overview of AI usage, costs, and performance metrics
            {selectedDepartment && departments.length > 0 && (
              <span className="text-blue-300 ml-2">
                • Filtered by {departments.find(d => d.value === selectedDepartment)?.label}
              </span>
            )}
            {selectedProviders.length > 0 && selectedProviders.length < providers.length && (
              <span className="text-blue-300 ml-2">
                • {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
              </span>
            )}
            {selectedModels.length > 0 && selectedModels.length < models.length && (
              <span className="text-blue-300 ml-2">
                • {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </p>
          {dashboardState.lastUpdated && (
            <p className="text-sm text-blue-200 mt-1">
              Last updated: {new Date(dashboardState.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {renderUnifiedFilters()}
          {renderPeriodSelector()}
          <button
            onClick={handleRefresh}
            disabled={dashboardState.isLoading || dashboardState.isRefreshing}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 hover:scale-105 transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Render error state with retry option
   * 
   * Learning: Error states should be informative and actionable.
   * Users need to understand what went wrong and how to fix it.
   */
  const renderError = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 text-center border border-white/10">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Dashboard</h2>
        <p className="text-blue-200 mb-4">{dashboardState.error}</p>
        <button
          onClick={handleRetry}
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform hover:ring-2 hover:ring-blue-400/50"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  /**
   * Render loading state
   * 
   * Learning: Loading states should indicate progress and what's being loaded.
   * This manages user expectations during data fetching.
   */
  const renderLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHeader()}
        
        {/* Loading skeleton matching the actual layout */}
        <div className="space-y-8">
          
          {/* Overview cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 animate-pulse border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>

          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 animate-pulse border border-white/10">
                <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Tables skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 animate-pulse border border-white/10">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  // Show error state if we have an error and no data
  if (dashboardState.error && !dashboardState.data) {
    return renderError();
  }

  // Show loading state if loading and no data
  if (dashboardState.isLoading && !dashboardState.data) {
    return renderLoading();
  }

  // Main dashboard render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {renderHeader()}

        {/* Dashboard content */}
        <div className="space-y-8">
          
          {/* Overview Cards */}
          <UsageDashboardOverview
            summary={dashboardState.data?.summary || null}
            systemHealth={dashboardState.data?.systemHealth?.status || 'error'}
            isLoading={dashboardState.isRefreshing}
            error={dashboardState.error}
            onRefresh={handleRefresh}
          />

          {/* Charts Section */}
          <UsageCharts
            summary={dashboardState.data?.summary || null}
            isLoading={dashboardState.isRefreshing}
            error={dashboardState.error}
          />

          {/* Models Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Most Used Models */}
            <div>
              <MostUsedModels
                mostUsedModels={dashboardState.data?.mostUsedModels || null}
                isLoading={dashboardState.isRefreshing}
                error={dashboardState.error}
                onRefresh={handleRefresh}
              />
            </div>

            {/* Top Users Table */}
            <div>
              <TopUsersTable
                topUsersByCost={dashboardState.data?.topUsers.byCost || null}
                topUsersByTokens={dashboardState.data?.topUsers.byTokens || null}
                topUsersByRequests={dashboardState.data?.topUsers.byRequests || null}
                isLoading={dashboardState.isRefreshing}
                error={dashboardState.error}
                onUserClick={handleUserClick}
              />
            </div>

          </div>

          {/* Recent Activity Section */}
          <div>
            <RecentActivity
              recentLogs={dashboardState.data?.recentActivity || null}
              isLoading={dashboardState.isRefreshing}
              error={dashboardState.error}
              onRefresh={handleRefresh}
            />
          </div>

          {/* System Health Footer */}
          {dashboardState.data?.systemHealth && (
            <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/10 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    dashboardState.data.systemHealth.status === 'healthy' ? 'bg-green-500' :
                    dashboardState.data.systemHealth.status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-white">
                    Usage Tracking System: {dashboardState.data.systemHealth.status}
                  </span>
                </div>
                <div className="text-sm text-blue-200">
                  {dashboardState.data.summary?.overview.total_requests || 0} logs in last {dashboardState.selectedPeriod} days
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;
