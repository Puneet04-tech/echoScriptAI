const speech = require('@google-cloud/speech');
const fs = require('fs');

/**
 * Google Cloud Speech-to-Text Service
 * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
 * or a service account JSON file
 */
class GoogleSpeechService {
  constructor() {
    this.client = new speech.SpeechClient();
  }

  /**
   * Transcribe audio file using Google Speech-to-Text
   * @param {string} filePath - Path to the audio file
   * @param {string} languageCode - Language code (e.g., 'en-US')
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(filePath, languageCode = 'en-US') {
    try {
      // Read the audio file
      const file = fs.readFileSync(filePath);
      const audioBytes = file.toString('base64');

      const audio = {
        content: audioBytes,
      };

      const config = {
        encoding: this.detectEncoding(filePath),
        sampleRateHertz: 16000,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Detects speech in the audio file
      const [response] = await this.client.recognize(request);

      const transcription = {
        text: response.results
          .map(result => result.alternatives[0].transcript)
          .join('\n'),
        confidence: response.results[0]?.alternatives[0]?.confidence || 0,
        language: languageCode,
        words: response.results[0]?.alternatives[0]?.words || [],
      };

      return {
        success: true,
        transcription: transcription,
      };
    } catch (error) {
      console.error('Google Speech-to-Text error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Detect audio encoding based on file extension
   * @param {string} filePath - Path to the audio file
   * @returns {string} Google Speech encoding
   */
  detectEncoding(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    
    const encodingMap = {
      'mp3': 'MP3',
      'wav': 'LINEAR16',
      'flac': 'FLAC',
      'ogg': 'OGG_OPUS',
      'webm': 'WEBM_OPUS',
      'm4a': 'MP3',
      'aac': 'AAC',
    };

    return encodingMap[ext] || 'LINEAR16';
  }

  /**
   * Transcribe with streaming (for real-time applications)
   * @param {string} filePath - Path to the audio file
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Streaming transcription result
   */
  async transcribeStream(filePath, languageCode = 'en-US') {
    try {
      const file = fs.readFileSync(filePath);
      const audioBytes = file.toString('base64');

      const request = {
        config: {
          encoding: this.detectEncoding(filePath),
          sampleRateHertz: 16000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
        },
        audio: { content: audioBytes },
      };

      const stream = this.client.streamingRecognize(request);

      const transcription = {
        text: '',
        isFinal: false,
      };

      stream.on('data', (response) => {
        const content = response.results[0]?.alternatives[0]?.transcript || '';
        transcription.text += content;
        transcription.isFinal = response.results[0]?.isFinal || false;
      });

      stream.on('error', (error) => {
        console.error('Streaming error:', error);
      });

      stream.on('end', () => {
        console.log('Streaming transcription complete');
      });

      return transcription;
    } catch (error) {
      console.error('Google Speech-to-Text streaming error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = GoogleSpeechService;
