const GoogleSpeechService = require('../services/googleSpeech');
const DeepSpeechService = require('../services/deepSpeech');
const Transcription = require('../models/Transcription');

/**
 * Transcription Controller
 * Manages speech-to-text transcription using multiple providers
 */
class TranscriptionController {
  constructor() {
    this.googleService = new GoogleSpeechService();
    this.deepSpeechService = new DeepSpeechService();
    this.defaultProvider = process.env.DEFAULT_STT_PROVIDER || 'google';
  }

  /**
   * Transcribe audio file using the specified provider
   * @param {string} filePath - Path to the audio file
   * @param {string} provider - STT provider ('google' or 'deepspeech')
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(filePath, provider = null, languageCode = 'en-US') {
    const selectedProvider = provider || this.defaultProvider;

    try {
      let result;

      switch (selectedProvider.toLowerCase()) {
        case 'google':
          result = await this.googleService.transcribe(filePath, languageCode);
          break;
        case 'deepspeech':
          result = await this.deepSpeechService.transcribe(filePath, languageCode);
          break;
        default:
          throw new Error(`Unsupported provider: ${selectedProvider}`);
      }

      return result;
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
  async transcribeAndSave(fileData, provider = null, languageCode = 'en-US') {
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
        if (result.transcription.words && result.transcription.words.length > 0) {
          const lastWord = result.transcription.words[result.transcription.words.length - 1];
          transcription.duration = lastWord.endTime ? lastWord.endTime.seconds : 0;
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
      const fs = require('fs');
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
      google: {
        available: true,
        configured: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      },
      deepspeech: {
        available: true,
        configured: this.deepSpeechService.isConfigured(),
        modelInfo: this.deepSpeechService.getModelInfo(),
      },
    };
  }
}

module.exports = TranscriptionController;
