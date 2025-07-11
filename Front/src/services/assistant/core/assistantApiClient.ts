// Assistant API Client
// Core HTTP client for assistant service operations

import { authService } from '../../authService';

/**
 * Assistant API Client
 * 
 * 🎓 LEARNING: API Client Pattern
 * ==============================
 * Centralized HTTP client provides:
 * - Consistent authentication handling
 * - Shared base URL configuration
 * - Reusable request methods
 * - Error response handling
 * - Type-safe request/response
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-dock-2-production.up.railway.app';

export class AssistantApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number = 30000; // 30 seconds timeout

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create fetch request with timeout handling
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - the server took too long to respond');
      }
      throw error;
    }
  }

  /**
   * Handle response and errors consistently
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw { status: response.status, data: errorData };
      } catch (parseError) {
        // If we can't parse the error response, throw a generic error
        throw { 
          status: response.status, 
          data: { 
            message: `HTTP ${response.status}: ${response.statusText}` 
          } 
        };
      }
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw new Error('Invalid response format from server');
    }
  }

  /**
   * Get authentication headers for API requests
   */
  private getHeaders(): HeadersInit {
    return authService.getAuthHeaders();
  }

  /**
   * Build full URL for assistant endpoints
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/api/assistants/${cleanEndpoint}`;
  }

  /**
   * Generic GET request method
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(this.buildUrl(endpoint));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await this.fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic POST request method
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic PUT request method
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Generic DELETE request method
   */
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.fetchWithTimeout(this.buildUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const assistantApiClient = new AssistantApiClient();
