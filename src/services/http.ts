import axios, { type AxiosResponse as AxiosResponseType } from 'axios';

// In development, use relative URL to go through Vite proxy (bypasses CORS)
// In production, use full URL from environment variable
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

// Use relative URL in development (goes through Vite proxy) to avoid CORS
// Use full URL in production
const baseURL = isDevelopment
  ? '/api/v1' // Relative URL - will be proxied by Vite
  : `${API_BASE_URL}/api/v1`; // Full URL for production

// Log the configuration (only in development)
if (isDevelopment) {
  console.log('🔧 API Client Configuration:', {
    mode: 'Development (using Vite proxy)',
    baseURL,
    backend: API_BASE_URL,
    note: 'Requests will be proxied through Vite to avoid CORS issues',
  });
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details for debugging (especially for conversation endpoints)
    if (config.url?.includes('/conversations')) {
      console.log('🔵 Request Interceptor - Conversations API:', {
        url: config.url,
        fullUrl: `${config.baseURL}${config.url}`,
        method: config.method,
        params: config.params,
        headers: {
          Authorization: config.headers.Authorization ? 'Bearer ***' : 'None',
          'Content-Type': config.headers['Content-Type'],
        },
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle the response structure
axiosClient.interceptors.response.use(
  (response: AxiosResponseType<ApiResponse<unknown>>) => {
    // If the response already has our expected structure, return it
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response;
    }

    // Transform the response to match our ApiResponse structure
    return {
      ...response,
      data: {
        data: response.data,
        message: 'Success',
      },
    };
  },
  (error) => {
    // Handle error responses - preserve original error structure from backend
    const originalError = error.response?.data;

    // Check for CORS errors
    const isCorsError =
      !error.response &&
      (error.message?.includes('CORS') ||
        error.message?.includes('Network Error') ||
        error.code === 'ERR_NETWORK');

    // Log error details for debugging (especially for conversation endpoints)
    if (error.config?.url?.includes('/conversations') || isCorsError) {
      console.error('🔴 Error Interceptor - API Request Failed:', {
        url: error.config?.url,
        fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'N/A',
        method: error.config?.method,
        isCorsError,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorMessage: error.message,
        errorCode: error.code,
        responseHeaders: error.response?.headers,
        requestHeaders: error.config?.headers,
        data: originalError,
        message: originalError?.message || originalError?.error,
        details: originalError?.details,
      });

      if (isCorsError) {
        console.error('🚨 CORS Error Detected!', {
          suggestion:
            'Check backend CORS configuration. Ensure the endpoint is allowed in CORS settings.',
          endpoint: error.config?.url,
          baseURL: error.config?.baseURL,
        });
      }
    }

    // Preserve the original error structure so components can access details
    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: originalError || {
          error: error.message || 'An error occurred',
          message: error.message || 'An error occurred',
          isCorsError,
        },
      },
    });
  }
);

export default axiosClient;
