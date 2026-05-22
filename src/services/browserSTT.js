/**
 * Browser-based Speech-to-Text using Web Speech API
 * No API key required, no billing, works entirely in the browser
 */

class BrowserSTTService {
  constructor() {
    this.recognition = null;
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    this.language = 'en-US';
  }

  /**
   * Check if browser supports Web Speech API
   */
  isBrowserSupported() {
    return this.isSupported;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    // Common languages supported by Web Speech API
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'fr-FR', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ar-SA', name: 'Arabic' },
      { code: 'hi-IN', name: 'Hindi' },
    ];
  }

  /**
   * Set language for transcription
   */
  setLanguage(language) {
    this.language = language;
  }

  /**
   * Transcribe audio file using Web Speech API
   * Note: Web Speech API is designed for real-time speech recognition,
   * not for pre-recorded audio files. This method will play the audio
   * and transcribe it in real-time.
   */
  async transcribeAudioFile(audioFile, onProgress, onComplete, onError) {
    if (!this.isSupported) {
      throw new Error('Browser does not support Web Speech API');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.lang = this.language;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let isRecording = false;

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (onProgress) {
          onProgress({
            final: finalTranscript,
            interim: interimTranscript,
            isComplete: false,
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          if (onError) onError('No speech detected. Please try again.');
        } else if (event.error === 'audio-capture') {
          if (onError) onError('No microphone found. Please ensure microphone is connected.');
        } else if (event.error === 'not-allowed') {
          if (onError) onError('Microphone permission denied. Please allow microphone access.');
        } else {
          if (onError) onError(`Speech recognition error: ${event.error}`);
        }
        
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        if (onComplete) {
          onComplete({
            text: finalTranscript.trim(),
            isComplete: true,
          });
        }
        resolve({
          text: finalTranscript.trim(),
          provider: 'browser',
        });
      };

      // Create audio element to play the file
      const audio = new Audio(URL.createObjectURL(audioFile));
      
      audio.onplay = () => {
        if (!isRecording) {
          this.recognition.start();
          isRecording = true;
        }
      };

      audio.onended = () => {
        if (isRecording) {
          this.recognition.stop();
          isRecording = false;
        }
      };

      audio.onerror = (error) => {
        if (onError) onError('Failed to play audio file');
        reject(error);
      };

      // Start playback
      audio.play().catch((error) => {
        if (onError) onError('Failed to play audio. Please try a different file format.');
        reject(error);
      });
    });
  }

  /**
   * Start real-time speech recognition from microphone
   */
  startRealTimeRecognition(onResult, onEnd, onError) {
    if (!this.isSupported) {
      throw new Error('Browser does not support Web Speech API');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.lang = this.language;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (onResult) {
        onResult({
          final: finalTranscript,
          interim: interimTranscript,
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };

    this.recognition.start();
  }

  /**
   * Stop speech recognition
   */
  stopRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      provider: 'Browser Web Speech API',
      configured: this.isSupported,
      supported: this.isSupported,
      language: this.language,
      features: ['real-time', 'no-api-key', 'no-billing', 'offline-capable'],
      limitations: [
        'Requires audio to be played for file transcription',
        'Browser-dependent (Chrome, Edge, Safari best support)',
        'Limited language support compared to cloud APIs',
        'No word-level timestamps',
        'No speaker diarization',
      ],
    };
  }
}

// Export singleton instance
const browserSTTService = new BrowserSTTService();
export default browserSTTService;
