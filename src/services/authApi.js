// Auth API helper for registration and login
import axios from 'axios';

const AUTH_BASE_URL =
  (
    import.meta.env.VITE_REACT_APP_API_URL ||
    import.meta.env.REACT_APP_API_URL ||
    'https://echoscriptai.onrender.com/api/upload'
  )
    .replace('/api/upload', '') + '/api/auth';

const authInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const register = async (email, password) => {
  const response = await authInstance.post('/register', { email, password });
  return response.data; // { token }
};

export const login = async (email, password) => {
  const response = await authInstance.post('/login', { email, password });
  return response.data; // { token }
};
