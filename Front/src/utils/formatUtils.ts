// 💰 Format Utilities
// Common formatting functions used across the application
// Ensures consistent display of currency, numbers, and other values

/**
 * Format currency values consistently across the application
 * 
 * This function ensures ALL costs are shown as $x.xxx with up to 3 decimal points:
 * - Large amounts ($1000+): Shows abbreviated format like "$1.500k" (always 3 decimal places)
 * - All other amounts: Shows as $x.xxx with up to 3 decimal places
 * - Amounts less than $0.001: Shows as "< $0.001"
 * 
 * @param amount - The amount in USD
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === 0) return 'Free';
  
  // Handle very small amounts
  if (amount < 0.001) {
    return '< $0.001';
  }
  
  // Handle large amounts with abbreviation - always 3 decimal places
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(3)}k`;
  }
  
  // All other amounts: show as $x.xxx with up to 3 decimal points
  // Remove trailing zeros for cleaner display
  return `$${amount.toFixed(3).replace(/\.?0+$/, '')}`;
};

/**
 * Format large numbers with proper abbreviations
 * 
 * @param num - The number to format
 * @returns Formatted number string with K/M abbreviations
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toLocaleString();
  }
};

/**
 * Format response time for display
 * 
 * @param ms - Response time in milliseconds
 * @returns Formatted time string
 */
export const formatResponseTime = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    return `${Math.round(ms)}ms`;
  }
};

/**
 * Format percentage values consistently
 * 
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format token counts with proper abbreviations
 * 
 * @param tokens - Number of tokens
 * @returns Formatted token string
 */
export const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M tokens`;
  } else if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K tokens`;
  } else {
    return `${tokens.toLocaleString()} tokens`;
  }
};

/**
 * Example usage across the app:
 * 
 * // Usage Analytics - Consistent $x.xxx formatting with 3 decimal places for large amounts
 * {formatCurrency(0.0005)}     → "< $0.001"
 * {formatCurrency(0.0096)}     → "$0.01"
 * {formatCurrency(0.15)}       → "$0.15"  
 * {formatCurrency(2.50)}       → "$2.5"
 * {formatCurrency(2.567)}      → "$2.567"
 * {formatCurrency(1500)}       → "$1.500k"
 * {formatCurrency(12345)}      → "$12.345k"
 * 
 * // Numbers and metrics
 * {formatNumber(1234)}         → "1.2K"
 * {formatTokens(15000)}        → "15.0K tokens"
 * {formatPercentage(95.7)}     → "95.7%"
 * {formatResponseTime(1250)}   → "1.3s"
 */
