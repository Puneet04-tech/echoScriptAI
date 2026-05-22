const { Deepgram } = require('@deepgram/sdk');

class DeepgramService {
  constructor() {
    if (!process.env.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY environment variable is not set');
    }
    
    // Temporarily disable Deepgram due to SDK version compatibility issues
    // User can use real-time transcription (Web Speech API) as alternative
    throw new Error('Deepgram service temporarily disabled. Use Whisper or real-time transcription instead.');
    
    // This code is for future reference when SDK compatibility is resolved
    // this.deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
  }

  async transcribe(audioBuffer, language = 'en') {
    const startTime = Date.now();
    
    try {
      const response = await this.deepgram.transcription.preRecorded(
        audioBuffer,
        {
          model: 'nova-2',
          language: language,
          punctuate: true,
          paragraphs: true,
          smart_format: true,
        }
      );

      const processingTime = Date.now() - startTime;
      const result = response.results;

      return {
        text: result.channels[0].alternatives[0].transcript,
        language: language,
        duration: result.channels[0].alternatives[0].words?.length > 0 
          ? result.channels[0].alternatives[0].words[result.channels[0].alternatives[0].words.length - 1].end 
          : 0,
        words: result.channels[0].alternatives[0].words,
        confidence: result.channels[0].alternatives[0].confidence,
        processingTime,
      };
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw new Error(`Deepgram transcription failed: ${error.message}`);
    }
  }

  async transcribeWithDiarization(audioBuffer, language = 'en') {
    const startTime = Date.now();
    
    try {
      const response = await this.deepgram.transcription.preRecorded(
        audioBuffer,
        {
          model: 'nova-2',
          language: language,
          punctuate: true,
          paragraphs: true,
          diarize: true,
          smart_format: true,
        }
      );

      const processingTime = Date.now() - startTime;
      const result = response.results;

      return {
        text: result.channels[0].alternatives[0].transcript,
        language: language,
        duration: result.channels[0].alternatives[0].words?.length > 0 
          ? result.channels[0].alternatives[0].words[result.channels[0].alternatives[0].words.length - 1].end 
          : 0,
        words: result.channels[0].alternatives[0].words,
        confidence: result.channels[0].alternatives[0].confidence,
        speakerLabels: result.channels[0].alternatives[0].words?.map(w => w.speaker),
        processingTime,
      };
    } catch (error) {
      console.error('Deepgram transcription error:', error);
      throw new Error(`Deepgram transcription failed: ${error.message}`);
    }
  }

  isConfigured() {
    return !!process.env.DEEPGRAM_API_KEY;
  }

  getStatus() {
    return {
      provider: 'Deepgram',
      configured: this.isConfigured(),
      model: 'nova-2',
      supportedLanguages: [
        'af', 'ar', 'az', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi',
        'fil', 'fr', 'gl', 'gu', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'jv', 'ka', 'kk', 'km', 'kn',
        'ko', 'lt', 'lv', 'mk', 'ml', 'mr', 'ms', 'my', 'ne', 'nl', 'no', 'pa', 'pl', 'pt', 'ro',
        'ru', 'si', 'sk', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'
      ],
      features: ['punctuation', 'paragraphs', 'diarization', 'smart_format'],
    };
  }
}

module.exports = DeepgramService;
