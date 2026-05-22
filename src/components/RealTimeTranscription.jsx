import { useState, useEffect, useRef } from 'react';

const RealTimeTranscription = ({ onTranscriptionComplete, language = 'en-US' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setError('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // Auto-restart if we want continuous listening
      if (finalTranscriptRef.current && onTranscriptionComplete) {
        onTranscriptionComplete(finalTranscriptRef.current);
      }
    };

    recognitionRef.current.onresult = (event) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' ';
          setTranscript(finalTranscriptRef.current);
        } else {
          interim += result[0].transcript;
        }
      }
      
      setInterimTranscript(interim);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscriptionComplete]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError('');
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    
    // Call completion callback with final transcript
    if (onTranscriptionComplete && finalTranscriptRef.current) {
      onTranscriptionComplete(finalTranscriptRef.current);
    }
  };

  const clearTranscript = () => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  };

  if (!isSupported) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Real-Time Transcription</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Real-Time Transcription</h2>
      
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex space-x-3">
          {!isListening ? (
            <button
              onClick={startListening}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span>Start Listening</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>Stop Listening</span>
            </button>
          )}
          
          <button
            onClick={clearTranscript}
            className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            title="Clear transcript"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Status */}
        {isListening && (
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded p-3">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span className="text-green-700 text-sm font-medium">Listening... Speak now</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
          <div className="space-y-2">
            {transcript && (
              <p className="text-gray-800 whitespace-pre-wrap font-medium">{transcript}</p>
            )}
            {interimTranscript && (
              <p className="text-purple-600 italic whitespace-pre-wrap font-medium animate-pulse">{interimTranscript}</p>
            )}
            {!transcript && !interimTranscript && (
              <p className="text-gray-400 text-center py-8">
                {isListening ? 'Speak to see your words appear...' : 'Click "Start Listening" to begin'}
              </p>
            )}
          </div>
        </div>

        {/* Word Count */}
        {transcript && (
          <div className="text-sm text-gray-500">
            Words: {transcript.split(/\s+/).filter(word => word.length > 0).length}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeTranscription;
