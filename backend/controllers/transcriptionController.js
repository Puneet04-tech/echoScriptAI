const WhisperService = require('../services/whisper');
const DeepgramService = require('../services/deepgram');
const Transcription = require('../models/Transcription');
const fs = require('fs');
const OpenAI = require('openai');

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

    // Initialize OpenAI for AI text utilities
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      this.openai = null;
      console.warn('OpenAI API key not set. AI text utilities will use basic implementations.');
    }
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
    let selectedProvider = provider || this.defaultProvider;
    
    // Normalize and validate provider
    let providerLower = selectedProvider ? selectedProvider.toLowerCase() : 'auto';
    if (providerLower !== 'whisper' && providerLower !== 'deepgram' && providerLower !== 'auto') {
      console.warn(`Unsupported provider: ${selectedProvider}. Falling back to 'auto'.`);
      providerLower = 'auto';
    }

    const providersToTry = [];

    // Determine which providers to try based on selection
    if (providerLower === 'auto') {
      // Try all available providers in order
      if (this.whisperService) providersToTry.push('whisper');
      if (this.deepgramService) providersToTry.push('deepgram');
    } else if (providerLower === 'whisper') {
      providersToTry.push('whisper');
      if (this.deepgramService) providersToTry.push('deepgram'); // Fallback
    } else if (providerLower === 'deepgram') {
      providersToTry.push('deepgram');
      if (this.whisperService) providersToTry.push('whisper'); // Fallback
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
   * Update transcription
   * @param {string} id - Transcription ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated transcription
   */
  async updateTranscription(id, updates) {
    try {
      return await Transcription.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true }
      );
    } catch (error) {
      console.error('Update transcription error:', error);
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

  /**
   * Generate executive summary using OpenAI
   * @param {string} text - Transcription text
   * @returns {Promise<string>} Summary
   */
  async generateSummary(text) {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise executive summaries of meeting transcripts. Summarize the key points, decisions made, and important outcomes in 3-5 bullet points.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        return response.choices[0].message.content;
      } catch (error) {
        console.error('OpenAI summary error:', error);
        return this.generateBasicSummary(text);
      }
    }
    return this.generateBasicSummary(text);
  }

  /**
   * Generate basic summary without AI
   * @param {string} text - Transcription text
   * @returns {string} Basic summary
   */
  generateBasicSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = sentences.slice(0, 5);
    return keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join('\n');
  }

  /**
   * Extract action items using OpenAI
   * @param {string} text - Transcription text
   * @returns {Promise<Array>} Array of action items
   */
  async extractActionItems(text) {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts action items from meeting transcripts. Return a JSON array of action items, each with "task", "assignee" (if mentioned), and "priority" (high/medium/low).'
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.5,
        });
        const content = response.choices[0].message.content;
        try {
          return JSON.parse(content);
        } catch {
          return this.extractBasicActionItems(text);
        }
      } catch (error) {
        console.error('OpenAI action items error:', error);
        return this.extractBasicActionItems(text);
      }
    }
    return this.extractBasicActionItems(text);
  }

  /**
   * Extract basic action items without AI
   * @param {string} text - Transcription text
   * @returns {Array} Array of action items
   */
  extractBasicActionItems(text) {
    const actionKeywords = ['need to', 'should', 'must', 'will', 'going to', 'have to', 'task', 'action', 'follow up'];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionItems = [];

    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (actionKeywords.some(keyword => lower.includes(keyword))) {
        actionItems.push({
          task: sentence.trim(),
          assignee: 'Unassigned',
          priority: 'medium'
        });
      }
    });

    return actionItems.slice(0, 5);
  }

  /**
   * Remove filler words
   * @param {string} text - Transcription text
   * @returns {string} Cleaned text
   */
  async removeFillerWords(text) {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'sort of', 'kind of'];
    let cleanedText = text;

    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, '');
    });

    // Clean up extra spaces
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    return cleanedText;
  }

  /**
   * Generate analytics for transcription
   * @param {string} text - Transcription text
   * @param {number} duration - Audio duration in seconds
   * @returns {Promise<Object>} Analytics data
   */
  async generateAnalytics(text, duration) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Calculate words per minute
    let wpm = 0;
    if (duration && duration > 0) {
      wpm = Math.round((wordCount / duration) * 60);
    }

    // Extract key terms (most frequent words, excluding common stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'];
    const wordFrequency = {};
    words.forEach(word => {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '');
      if (lower.length > 2 && !stopWords.includes(lower)) {
        wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
      }
    });

    const keyTerms = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'positive', 'success', 'happy', 'love', 'like', 'best', 'better', 'improve', 'agree', 'yes', 'right', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'negative', 'failure', 'unhappy', 'hate', 'dislike', 'worst', 'worse', 'decline', 'disagree', 'no', 'wrong', 'problem', 'issue', 'concern'];

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const lower = word.toLowerCase();
      if (positiveWords.some(pw => lower.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => lower.includes(nw))) negativeCount++;
    });

    const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
    const sentimentScore = Math.round(((positiveCount - negativeCount) / wordCount) * 100);

    return {
      wordCount,
      sentenceCount,
      wordsPerMinute: wpm,
      keyTerms,
      sentiment: {
        overall: sentiment,
        score: sentimentScore,
        positiveWords: positiveCount,
        negativeWords: negativeCount
      },
      duration: duration || 0
    };
  }
}

module.exports = TranscriptionController;
