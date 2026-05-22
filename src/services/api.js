const API_BASE_URL = 'http://localhost:5000/api/upload';

export const api = {
  // Upload and transcribe audio file
  async transcribeAudio(file, provider = 'google', language = 'en-US') {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('provider', provider);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    return response.json();
  },

  // Get all transcriptions
  async getTranscriptions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/transcriptions${queryParams ? `?${queryParams}` : ''}`);

    if (!response.ok) {
      throw new Error('Failed to fetch transcriptions');
    }

    return response.json();
  },

  // Get single transcription by ID
  async getTranscription(id) {
    const response = await fetch(`${API_BASE_URL}/transcription/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch transcription');
    }

    return response.json();
  },

  // Delete transcription
  async deleteTranscription(id) {
    const response = await fetch(`${API_BASE_URL}/transcription/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete transcription');
    }

    return response.json();
  },

  // Get provider status
  async getProviderStatus() {
    const response = await fetch(`${API_BASE_URL}/provider-status`);

    if (!response.ok) {
      throw new Error('Failed to fetch provider status');
    }

    return response.json();
  },
};
