import { useState, useRef, useEffect } from 'react';
import browserSTTService from '../services/browserSTT';

const BrowserTranscription = ({ audioFile, onTranscriptionComplete, onCancel }) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [language, setLanguage] = useState('en-US');
  const audioRef = useRef(null);

  useEffect(() => {
    setIsSupported(browserSTTService.isBrowserSupported());
    if (!isSupported) {
      setError('Your browser does not support Web Speech API. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  const handleTranscribe = async () => {
    if (!audioFile) return;

    setIsTranscribing(true);
    setError('');
    setTranscript('');
    setInterimTranscript('');

    browserSTTService.setLanguage(language);

    try {
      const result = await browserSTTService.transcribeAudioFile(
        audioFile,
        (progress) => {
          setTranscript(progress.final);
          setInterimTranscript(progress.interim);
        },
        (complete) => {
          setTranscript(complete.text);
          setInterimTranscript('');
        },
        (err) => {
          setError(err);
        }
      );

      if (result && result.text) {
        onTranscriptionComplete(result.text, 'browser');
      }
    } catch (err) {
      setError(err.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCancel = () => {
    browserSTTService.stopRecognition();
    setIsTranscribing(false);
    onCancel();
  };

  const supportedLanguages = browserSTTService.getSupportedLanguages();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Browser-Based Transcription</h2>
      
      {!isSupported ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> This uses your browser's built-in speech recognition.
              No API key or billing required. The audio will be played during transcription.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isTranscribing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {audioFile && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">File:</span> {audioFile.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Size: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {(transcript || interimTranscript) && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1 font-medium">Transcription:</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcript}
                <span className="text-gray-400">{interimTranscript}</span>
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleTranscribe}
              disabled={!audioFile || isTranscribing}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors
                ${!audioFile || isTranscribing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
              {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>

          {isTranscribing && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="text-sm text-gray-600">Playing audio and transcribing...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowserTranscription;
