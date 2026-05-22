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
   * Transcribe audio file using the specified provider with fallback
   * Fallback order: Whisper → Deepgram → Error (for browser STT fallback)
   * @param {string} filePath - Path to the audio file
   * @param {string} provider - STT provider ('whisper', 'deepgram', or 'auto' for fallback)
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(filePath, provider = null, languageCode = 'en') {
    const selectedProvider = provider || this.defaultProvider;
    const providersToTry = [];

    // Determine which providers to try based on selection
    if (selectedProvider.toLowerCase() === 'auto') {
      // Try all available providers in order
      if (this.whisperService) providersToTry.push('whisper');
      if (this.deepgramService) providersToTry.push('deepgram');
    } else if (selectedProvider.toLowerCase() === 'whisper') {
      providersToTry.push('whisper');
      if (this.deepgramService) providersToTry.push('deepgram'); // Fallback
    } else if (selectedProvider.toLowerCase() === 'deepgram') {
      providersToTry.push('deepgram');
      if (this.whisperService) providersToTry.push('whisper'); // Fallback
    } else {
      throw new Error(`Unsupported provider: ${selectedProvider}. Use 'whisper', 'deepgram', or 'auto'.`);
    }

    // Try each provider in order
    for (const currentProvider of providersToTry) {
      try {
        let result;
        
        if (currentProvider === 'whisper') {
          if (!this.whisperService) {
            console.warn('Whisper service not configured, skipping...');
            continue;
          }
          console.log('Attempting transcription with Whisper...');
          const audioBuffer = fs.readFileSync(filePath);
          result = await this.whisperService.transcribe(audioBuffer, languageCode);
        } else if (currentProvider === 'deepgram') {
          if (!this.deepgramService) {
            console.warn('Deepgram service not configured, skipping...');
            continue;
          }
          console.log('Attempting transcription with Deepgram...');
          const dgBuffer = fs.readFileSync(filePath);
          result = await this.deepgramService.transcribe(dgBuffer, languageCode);
        }

        return {
          success: true,
          transcription: result,
          provider: currentProvider,
        };
      } catch (error) {
        console.error(`${currentProvider} transcription failed:`, error.message);
        // Continue to next provider
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All transcription providers failed. Please use browser-based transcription as fallback.',
      useBrowserFallback: true,
    };
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
        transcription.provider = result.provider || provider;
        
        // Update duration if available
        if (result.transcription.duration) {
          transcription.duration = result.transcription.duration;
        }
      } else {
        transcription.status = 'failed';
        transcription.error = result.error;
        transcription.useBrowserFallback = result.useBrowserFallback || false;
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
