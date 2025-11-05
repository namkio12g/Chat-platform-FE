import axios, { type AxiosResponse as AxiosResponseType } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090';

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // Handle error responses
    const errorMessage =
      error.response?.data?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      response: {
        ...error.response,
        data: {
          data: null,
          message: errorMessage,
        },
      },
    });
  }
);

export default axiosClient;
