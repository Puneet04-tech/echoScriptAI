import axios from 'axios';

// Use deployed backend URL or environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://echoscriptai.onrender.com/api';

// Create separate axios instances
const uploadAxios = axios.create({
  baseURL: `${API_BASE_URL}/upload`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authAxios = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for uploadAxios
uploadAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('echoscriptai_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for uploadAxios
uploadAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        throw new Error('All transcription providers failed');
      }
      if (status === 401) {
        // Token expired or invalid - clear auth
        localStorage.removeItem('echoscriptai_token');
        localStorage.removeItem('echoscriptai_user');
        window.location.href = '/';
      }
      const message = error.response.data?.message || error.response.data?.error || 'Request failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('All transcription providers failed');
    } else {
      throw new Error(error.message || 'Request setup failed');
    }
  }
);

export const api = {
  // ===== AUTHENTICATION METHODS =====
  
  // Register new user
  async register(email, password, name = '') {
    const response = await authAxios.post('/register', {
      email,
      password,
      name: name || email.split('@')[0],
    });
    
    // Store token and user data
    if (response.data.token && response.data.user) {
      localStorage.setItem('echoscriptai_token', response.data.token);
      localStorage.setItem('echoscriptai_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Login user
  async login(email, password) {
    const response = await authAxios.post('/login', {
      email,
      password,
    });
    
    // Store token and user data
    if (response.data.token && response.data.user) {
      localStorage.setItem('echoscriptai_token', response.data.token);
      localStorage.setItem('echoscriptai_user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('echoscriptai_token');
    localStorage.removeItem('echoscriptai_user');
  },

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('echoscriptai_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('echoscriptai_token');
  },

  // ===== TRANSCRIPTION METHODS =====

  // Upload and transcribe audio file
  async transcribeAudio(file, provider = 'auto', language = 'en-US') {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('provider', provider);
    formData.append('language', language);

    const response = await uploadAxios.post('/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  },

  // Get all transcriptions for authenticated user
  async getTranscriptions(filters = {}) {
    const response = await uploadAxios.get('/transcriptions', { params: filters });
    return response.data;
  },

  // Get single transcription by ID
  async getTranscription(id) {
    const response = await uploadAxios.get(`/transcription/${id}`);
    return response.data;
  },

  // Delete transcription
  async deleteTranscription(id) {
    const response = await uploadAxios.delete(`/transcription/${id}`);
    return response.data;
  },

  // Update transcription
  async updateTranscription(id, updates) {
    const response = await uploadAxios.put(`/transcription/${id}`, updates);
    return response.data;
  },

  // Get provider status
  async getProviderStatus() {
    const response = await uploadAxios.get('/provider-status');
    return response.data;
  },

  // Poll transcription status until completed or failed
  async pollTranscriptionStatus(id, onUpdate, maxAttempts = 60, interval = 2000) {
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      try {
        const transcription = await this.getTranscription(id);
        
        if (onUpdate) {
          onUpdate(transcription);
        }

        // Check if transcription is completed or failed
        if (transcription.status === 'completed' || transcription.status === 'failed') {
          return transcription;
        }

        // Continue polling if max attempts not reached
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          throw new Error('Transcription polling timeout');
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (onUpdate) {
          onUpdate({ status: 'failed', error: error.message });
        }
        throw error;
      }
    };

    return poll();
  },

  // AI Text Utilities
  async aiSummary(text) {
    const response = await uploadAxios.post('/ai/summary', { text });
    return response.data;
  },

  async aiActionItems(text) {
    const response = await uploadAxios.post('/ai/action-items', { text });
    return response.data;
  },

  async aiRemoveFillers(text) {
    const response = await uploadAxios.post('/ai/remove-fillers', { text });
    return response.data;
  },

  async aiAnalytics(text, duration) {
    const response = await uploadAxios.post('/ai/analytics', { text, duration });
    return response.data;
  },
};
