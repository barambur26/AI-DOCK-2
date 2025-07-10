// 🐛 Debug Service
// Utility service for debugging environment and build issues

/**
 * Debug service to help identify environment variable and build issues
 */
export class DebugService {
  
  /**
   * Log environment variable status to console
   */
  static logEnvironmentStatus(): void {
    console.log('🔍 Environment Debug Information:');
    console.log('NODE_ENV:', import.meta.env.MODE);
    console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
    console.log('Current API URL being used:', import.meta.env.VITE_API_URL || 'https://idyllic-moxie-aedb62.netlify.app/0');
    console.log('Available env vars:', Object.keys(import.meta.env));
    console.log('Full env object:', import.meta.env);
  }

  /**
   * Test if we can reach the configured API
   */
  static async testApiConnection(): Promise<{
    success: boolean;
    url: string;
    status?: number;
    message: string;
  }> {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://idyllic-moxie-aedb62.netlify.app/0';
    
    try {
      console.log('🔌 Testing API connection to:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        // No auth needed for health endpoint
      });

      const success = response.ok;
      
      return {
        success,
        url: apiUrl,
        status: response.status,
        message: success 
          ? `✅ API connection successful (${response.status})` 
          : `❌ API connection failed (${response.status})`
      };
      
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      
      return {
        success: false,
        url: apiUrl,
        message: `❌ API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get build information
   */
  static getBuildInfo(): {
    isDevelopment: boolean;
    isProduction: boolean;
    mode: string;
    buildTime: string;
    expectedApiUrl: string;
    actualApiUrl: string;
  } {
    const expectedApiUrl = 'https://ai-dock-2-production.up.railway.app';
    const actualApiUrl = import.meta.env.VITE_API_URL || 'https://idyllic-moxie-aedb62.netlify.app/0';
    
    return {
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      buildTime: new Date().toISOString(),
      expectedApiUrl,
      actualApiUrl,
    };
  }

  /**
   * Check if environment variables are configured correctly
   */
  static validateEnvironment(): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    const apiUrl = import.meta.env.VITE_API_URL;
    
    // Check if API URL is set
    if (!apiUrl) {
      issues.push('VITE_API_URL environment variable is not set');
    } else if (apiUrl.includes('localhost')) {
      if (import.meta.env.PROD) {
        issues.push('Using localhost URL in production build');
      } else {
        warnings.push('Using localhost URL (OK for development)');
      }
    } else if (!apiUrl.startsWith('https://')) {
      warnings.push('API URL does not use HTTPS');
    }
    
    // Check if API URL is the expected Railway URL
    if (apiUrl && !apiUrl.includes('ai-dock-2-production.up.railway.app')) {
      warnings.push(`API URL (${apiUrl}) does not match expected Railway URL`);
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Run all debug checks and log results
   */
  static async runFullDiagnostics(): Promise<void> {
    console.log('🚀 Running AI Dock Frontend Diagnostics...\n');
    
    // Environment status
    this.logEnvironmentStatus();
    console.log('');
    
    // Build info
    const buildInfo = this.getBuildInfo();
    console.log('🏗️ Build Information:');
    console.table(buildInfo);
    console.log('');
    
    // Environment validation
    const validation = this.validateEnvironment();
    console.log('✅ Environment Validation:');
    console.log('Valid:', validation.isValid);
    if (validation.issues.length > 0) {
      console.log('Issues:', validation.issues);
    }
    if (validation.warnings.length > 0) {
      console.log('Warnings:', validation.warnings);
    }
    console.log('');
    
    // API connection test
    console.log('🔌 Testing API Connection...');
    const connectionTest = await this.testApiConnection();
    console.log(connectionTest.message);
    console.log('URL tested:', connectionTest.url);
    if (connectionTest.status) {
      console.log('Status code:', connectionTest.status);
    }
    
    console.log('\n🎯 Diagnostics Complete');
  }
}

// Export for easy access
export const debugService = new DebugService();

// Auto-run diagnostics in development mode
if (import.meta.env.DEV) {
  console.log('🐛 Debug Service loaded - run debugService.runFullDiagnostics() to test');
}
