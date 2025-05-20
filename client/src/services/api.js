import axios from 'axios';
import { getAuthToken, clearAuthData } from '../utils/auth';

// Create axios instance with base URL
const isProduction = process.env.NODE_ENV === 'production';
const api = axios.create({
  baseURL: isProduction ? '/api' : process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: isProduction, // Enviar cookies em produção
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized responses (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      clearAuthData();
      window.location.href = '/login?sessionExpired=true';
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Helper function to handle file uploads
export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

export default api;
