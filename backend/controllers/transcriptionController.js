const WhisperService = require('../services/whisper');
const DeepgramService = require('../services/deepgram');
const Transcription = require('../models/Transcription');
const fs = require('fs');

/**
 * Transcription Controller
 * Manages speech-to-text transcription using OpenAI Whisper and Deepgram
 */
class TranscriptionController {
  constructor() {
    try {
      this.whisperService = new WhisperService();
    } catch (error) {
      console.warn('Whisper service not configured:', error.message);
      this.whisperService = null;
    }

    try {
      this.deepgramService = new DeepgramService();
    } catch (error) {
      console.warn('Deepgram service not configured:', error.message);
      this.deepgramService = null;
    }

    this.defaultProvider = process.env.DEFAULT_STT_PROVIDER || 'whisper';
  }

  /**
   * Transcribe audio file using the specified provider
   * @param {string} filePath - Path to the audio file
   * @param {string} provider - STT provider ('whisper' or 'deepgram')
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(filePath, provider = null, languageCode = 'en') {
    const selectedProvider = provider || this.defaultProvider;

    try {
      let result;

      switch (selectedProvider.toLowerCase()) {
        case 'whisper':
          if (!this.whisperService) {
            throw new Error('Whisper service is not configured. Please set OPENAI_API_KEY.');
          }
          // Read file as buffer for Whisper
          const audioBuffer = fs.readFileSync(filePath);
          result = await this.whisperService.transcribe(audioBuffer, languageCode);
          break;
        case 'deepgram':
          if (!this.deepgramService) {
            throw new Error('Deepgram service is not configured. Please set DEEPGRAM_API_KEY.');
          }
          // Read file as buffer for Deepgram
          const dgBuffer = fs.readFileSync(filePath);
          result = await this.deepgramService.transcribe(dgBuffer, languageCode);
          break;
        default:
          throw new Error(`Unsupported provider: ${selectedProvider}. Use 'whisper' or 'deepgram'.`);
      }

      return {
        success: true,
        transcription: result,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transcribe and save to database
   * @param {Object} fileData - File information from multer
   * @param {string} provider - STT provider
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Transcription record
   */
  async transcribeAndSave(fileData, provider = null, languageCode = 'en') {
    try {
      // Create transcription record with pending status
      const transcription = new Transcription({
        audioFile: {
          filename: fileData.filename,
          originalName: fileData.originalname,
          path: fileData.path,
          mimetype: fileData.mimetype,
          size: fileData.size,
        },
        status: 'processing',
        language: languageCode,
      });

      await transcription.save();

      // Perform transcription
      const result = await this.transcribe(fileData.path, provider, languageCode);

      if (result.success) {
        // Update transcription with results
        transcription.transcription = result.transcription.text;
        transcription.status = 'completed';
        transcription.processingTime = result.transcription.processingTime || 0;
        
        // Update duration if available
        if (result.transcription.duration) {
          transcription.duration = result.transcription.duration;
        }
      } else {
        transcription.status = 'failed';
        transcription.error = result.error;
      }

      await transcription.save();

      return transcription;
    } catch (error) {
      console.error('Transcribe and save error:', error);
      throw error;
    }
  }

  /**
   * Get transcription by ID
   * @param {string} id - Transcription ID
   * @returns {Promise<Object>} Transcription record
   */
  async getTranscriptionById(id) {
    try {
      return await Transcription.findById(id);
    } catch (error) {
      console.error('Get transcription error:', error);
      throw error;
    }
  }

  /**
   * Get all transcriptions
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Array of transcriptions
   */
  async getAllTranscriptions(filters = {}) {
    try {
      return await Transcription.find(filters).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Get all transcriptions error:', error);
      throw error;
    }
  }

  /**
   * Delete transcription
   * @param {string} id - Transcription ID
   * @returns {Promise<Object>} Deleted transcription
   */
  async deleteTranscription(id) {
    try {
      const transcription = await Transcription.findById(id);
      
      if (!transcription) {
        throw new Error('Transcription not found');
      }

      // Delete audio file
      if (fs.existsSync(transcription.audioFile.path)) {
        fs.unlinkSync(transcription.audioFile.path);
      }

      await Transcription.findByIdAndDelete(id);
      return transcription;
    } catch (error) {
      console.error('Delete transcription error:', error);
      throw error;
    }
  }

  /**
   * Get provider status
   * @returns {Object} Provider status information
   */
  getProviderStatus() {
    return {
      default: this.defaultProvider,
      whisper: this.whisperService ? this.whisperService.getStatus() : {
        provider: 'OpenAI Whisper',
        configured: false,
        error: 'OPENAI_API_KEY not set',
      },
      deepgram: this.deepgramService ? this.deepgramService.getStatus() : {
        provider: 'Deepgram',
        configured: false,
        error: 'DEEPGRAM_API_KEY not set',
      },
    };
  }
}

module.exports = TranscriptionController;
