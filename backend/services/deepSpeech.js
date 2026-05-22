const fs = require('fs');
const path = require('path');

/**
 * Mozilla DeepSpeech Service
 * 
 * NOTE: This service requires local installation of DeepSpeech models.
 * 
 * Setup Requirements:
 * 1. Install DeepSpeech: npm install deepspeech
 * 2. Download pre-trained models from:
 *    https://github.com/mozilla/DeepSpeech/releases
 * 3. Set DEEPSPEECH_MODEL_PATH environment variable to the model directory
 * 
 * Model files needed:
 * - output_graph.pbmm (model file)
 * - scorer.scorer (language model, optional but recommended)
 * 
 * Supported audio formats: WAV (16kHz, mono, 16-bit PCM)
 * Other formats need to be converted to WAV first.
 */
class DeepSpeechService {
  constructor() {
    this.model = null;
    this.modelPath = process.env.DEEPSPEECH_MODEL_PATH;
    this.scorerPath = process.env.DEEPSPEECH_SCORER_PATH;
    this.isInitialized = false;
  }

  /**
   * Initialize DeepSpeech model
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      // Check if deepspeech is installed
      let deepspeech;
      try {
        deepspeech = require('deepspeech');
      } catch (error) {
        console.error('DeepSpeech package not installed. Run: npm install deepspeech');
        return false;
      }

      // Check if model path is provided
      if (!this.modelPath) {
        console.error('DEEPSPEECH_MODEL_PATH environment variable not set');
        return false;
      }

      // Check if model file exists
      const modelFile = path.join(this.modelPath, 'output_graph.pbmm');
      if (!fs.existsSync(modelFile)) {
        console.error(`Model file not found: ${modelFile}`);
        return false;
      }

      // Create model instance
      this.model = new deepspeech.Model(modelFile);

      // Load scorer if provided
      if (this.scorerPath) {
        const scorerFile = path.join(this.scorerPath, 'scorer.scorer');
        if (fs.existsSync(scorerFile)) {
          this.model.enableExternalScorer(scorerFile);
          console.log('DeepSpeech scorer loaded');
        }
      }

      this.isInitialized = true;
      console.log('DeepSpeech model initialized successfully');
      return true;
    } catch (error) {
      console.error('DeepSpeech initialization error:', error);
      return false;
    }
  }

  /**
   * Transcribe audio file using DeepSpeech
   * @param {string} filePath - Path to the audio file
   * @param {string} languageCode - Language code (DeepSpeech primarily supports English)
   * @returns {Promise<Object>} Transcription result
   */
  async transcribe(filePath, languageCode = 'en') {
    try {
      // Initialize model if not already done
      if (!this.isInitialized) {
        const initialized = this.initialize();
        if (!initialized) {
          return {
            success: false,
            error: 'DeepSpeech model not initialized. Check environment variables and model files.',
          };
        }
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: 'Audio file not found',
        };
      }

      // Read audio file (DeepSpeech expects 16kHz, mono, 16-bit PCM WAV)
      const audioBuffer = fs.readFileSync(filePath);

      // Perform transcription
      const startTime = Date.now();
      const text = this.model.stt(audioBuffer);
      const processingTime = Date.now() - startTime;

      const transcription = {
        text: text,
        confidence: 0, // DeepSpeech doesn't provide confidence scores
        language: languageCode,
        processingTime: processingTime,
      };

      return {
        success: true,
        transcription: transcription,
      };
    } catch (error) {
      console.error('DeepSpeech transcription error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if DeepSpeech is properly configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return this.isInitialized || (this.modelPath && fs.existsSync(path.join(this.modelPath, 'output_graph.pbmm')));
  }

  /**
   * Get model information
   * @returns {Object} Model information
   */
  getModelInfo() {
    return {
      initialized: this.isInitialized,
      modelPath: this.modelPath,
      scorerPath: this.scorerPath,
      configured: this.isConfigured(),
    };
  }
}

module.exports = DeepSpeechService;
