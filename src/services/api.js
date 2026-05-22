import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/upload';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 429) {
        // Quota exceeded – treat as all providers failed
        throw new Error('All transcription providers failed');
      }
      const message = error.response.data?.message || error.response.data?.error || 'Request failed';
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('All transcription providers failed');
    } else {
      // Error in request setup
      throw new Error(error.message || 'Request setup failed');
    }
  }
);

export const api = {
  // Upload and transcribe audio file
  async transcribeAudio(file, provider = 'auto', language = 'en-US') {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('provider', provider);
    formData.append('language', language);

    const response = await axiosInstance.post('/transcribe', formData, {
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

  // Get all transcriptions
  async getTranscriptions(filters = {}) {
    const response = await axiosInstance.get('/transcriptions', { params: filters });
    return response.data;
  },

  // Get single transcription by ID
  async getTranscription(id) {
    const response = await axiosInstance.get(`/transcription/${id}`);
    return response.data;
  },

  // Delete transcription
  async deleteTranscription(id) {
    const response = await axiosInstance.delete(`/transcription/${id}`);
    return response.data;
  },

  // Update transcription
  async updateTranscription(id, updates) {
    const response = await axiosInstance.put(`/transcription/${id}`, updates);
    return response.data;
  },

  // Get provider status
  async getProviderStatus() {
    const response = await axiosInstance.get('/provider-status');
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
};
