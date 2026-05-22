import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionList from './components/TranscriptionList';
import BrowserTranscription from './components/BrowserTranscription';
import TranscriptionStats from './components/TranscriptionStats';
import RealTimeTranscription from './components/RealTimeTranscription';
import { api } from './services/api';

function App() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendConnected, setBackendConnected] = useState(true);
  const [showBrowserFallback, setShowBrowserFallback] = useState(false);
  const [fallbackAudioFile, setFallbackAudioFile] = useState(null);
  const [showRealTime, setShowRealTime] = useState(false);

  useEffect(() => {
    checkBackendConnection();
    loadTranscriptions();
  }, []);

  const checkBackendConnection = async () => {
    try {
      await api.getProviderStatus();
      setBackendConnected(true);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendConnected(false);
      setError('Cannot connect to backend. Please ensure the server is running.');
    }
  };

  const loadTranscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getTranscriptions();
      setTranscriptions(data);
      setError('');
    } catch (error) {
      console.error('Failed to load transcriptions:', error);
      setError(error.message || 'Failed to load transcriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, onProgress) => {
    try {
      const result = await api.transcribeAudio(file);
      
      // Start polling for transcription status
      if (result.transcription && result.transcription._id) {
        await api.pollTranscriptionStatus(
          result.transcription._id,
          (updatedTranscription) => {
            // Update the specific transcription in the list
            setTranscriptions(prev => 
              prev.map(t => 
                t._id === updatedTranscription._id ? updatedTranscription : t
              )
            );
          }
        );
      }
      
      await loadTranscriptions();
    } catch (error) {
      console.error('Upload failed:', error);
      // Check if error suggests using browser fallback
      if (error.message && error.message.includes('All transcription providers failed')) {
        setFallbackAudioFile(file);
        setShowBrowserFallback(true);
      } else {
        throw error;
      }
    }
  };

  const handleRecordingComplete = async (file) => {
    try {
      const result = await api.transcribeAudio(file);
      
      // Start polling for transcription status
      if (result.transcription && result.transcription._id) {
        await api.pollTranscriptionStatus(
          result.transcription._id,
          (updatedTranscription) => {
            setTranscriptions(prev => 
              prev.map(t => 
                t._id === updatedTranscription._id ? updatedTranscription : t
              )
            );
          }
        );
      }
      
      await loadTranscriptions();
    } catch (error) {
      console.error('Recording upload failed:', error);
      // Check if error suggests using browser fallback
      if (error.message && error.message.includes('All transcription providers failed')) {
        setFallbackAudioFile(file);
        setShowBrowserFallback(true);
      } else {
        throw error;
      }
    }
  };

  const handleDeleteTranscription = async (id) => {
    try {
      await api.deleteTranscription(id);
      await loadTranscriptions();
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error.message || 'Failed to delete transcription');
    }
  };

  const handleBrowserTranscriptionComplete = async (text, provider) => {
    try {
      // Create a manual transcription entry for browser-based transcription
      // Note: This won't be saved to the backend database
      const manualTranscription = {
        _id: `browser-${Date.now()}`,
        audioFile: {
          filename: fallbackAudioFile.name,
          originalName: fallbackAudioFile.name,
          path: '',
          mimetype: fallbackAudioFile.type,
          size: fallbackAudioFile.size,
        },
        transcription: text,
        status: 'completed',
        language: 'en',
        duration: 0,
        error: '',
        processingTime: 0,
        provider: provider,
        useBrowserFallback: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setTranscriptions(prev => [manualTranscription, ...prev]);
      setShowBrowserFallback(false);
      setFallbackAudioFile(null);
    } catch (error) {
      console.error('Failed to save browser transcription:', error);
      setError('Failed to save transcription');
    }
  };

  const handleBrowserTranscriptionCancel = () => {
    setShowBrowserFallback(false);
    setFallbackAudioFile(null);
  };

  const handleTranscriptionUpdate = (id, newText) => {
    // Update local state for browser-based transcriptions
    setTranscriptions(prev => 
      prev.map(t => 
        t._id === id ? { ...t, transcription: newText } : t
      )
    );
  };

  const handleRealTimeTranscriptionComplete = (text) => {
    // Add real-time transcription to the list
    const newTranscription = {
      _id: Date.now().toString(),
      audioFile: {
        filename: 'real-time-' + Date.now(),
        originalName: 'Real-time Transcription',
        size: 0,
        mimetype: 'audio/webm',
      },
      transcription: text,
      status: 'completed',
      language: 'en-US',
      provider: 'browser',
      createdAt: new Date().toISOString(),
      useBrowserFallback: true,
    };
    
    setTranscriptions(prev => [newTranscription, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">EchoScriptAI</h1>
              <p className="text-gray-600 mt-1">Audio Transcription Service</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRealTime(!showRealTime)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showRealTime
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showRealTime ? 'File Upload' : 'Real-Time'}
              </button>
              <div className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {backendConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Methods */}
          <div className="space-y-6">
            {showBrowserFallback ? (
              <BrowserTranscription
                audioFile={fallbackAudioFile}
                onTranscriptionComplete={handleBrowserTranscriptionComplete}
                onCancel={handleBrowserTranscriptionCancel}
              />
            ) : showRealTime ? (
              <RealTimeTranscription
                onTranscriptionComplete={handleRealTimeTranscriptionComplete}
              />
            ) : (
              <>
                <FileUpload onUpload={handleFileUpload} />
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
              </>
            )}
          </div>

          {/* Right Column - Transcriptions */}
          <div className="space-y-6">
            <TranscriptionStats transcriptions={transcriptions} />
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-gray-600">Loading transcriptions...</p>
                </div>
              </div>
            ) : (
              <TranscriptionList
                transcriptions={transcriptions}
                onDelete={handleDeleteTranscription}
                onUpdate={handleTranscriptionUpdate}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Powered by OpenAI Whisper, Deepgram & Browser Web Speech API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
