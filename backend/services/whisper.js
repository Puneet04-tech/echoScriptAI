const OpenAI = require('openai');

class WhisperService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribe(audioFile, language = 'en') {
    const startTime = Date.now();
    
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      const processingTime = Date.now() - startTime;

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments,
        processingTime,
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  async transcribeWithTimestamps(audioFile, language = 'en') {
    const startTime = Date.now();
    
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment', 'word'],
      });

      const processingTime = Date.now() - startTime;

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments,
        words: transcription.words,
        processingTime,
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  isConfigured() {
    return !!process.env.OPENAI_API_KEY;
  }

  getStatus() {
    return {
      provider: 'OpenAI Whisper',
      configured: this.isConfigured(),
      model: 'whisper-1',
      supportedLanguages: [
        'af', 'ar', 'hy', 'az', 'be', 'bs', 'bg', 'ca', 'zh', 'hr', 'cs', 'da', 'nl', 'en',
        'et', 'fi', 'fr', 'gl', 'de', 'el', 'he', 'hi', 'hu', 'is', 'id', 'it', 'ja', 'kn',
        'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mi', 'mr', 'ne', 'no', 'fa', 'pl',
        'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'sv', 'tl', 'ta', 'th', 'tr', 'uk', 'ur',
        'vi', 'cy'
      ],
    };
  }
}

module.exports = WhisperService;
