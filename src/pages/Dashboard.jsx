import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import AudioRecorder from '../components/AudioRecorder';
import TranscriptionList from '../components/TranscriptionList';
import BrowserTranscription from '../components/BrowserTranscription';
import TranscriptionStats from '../components/TranscriptionStats';
import RealTimeTranscription from '../components/RealTimeTranscription';
import { api } from '../services/api';

export default function Dashboard({ user, onLogout }) {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendConnected, setBackendConnected] = useState(true);
  const [showBrowserFallback, setShowBrowserFallback] = useState(false);
  const [fallbackAudioFile, setFallbackAudioFile] = useState(null);
  const [fallbackTranscriptionId, setFallbackTranscriptionId] = useState(null);
  const [showRealTime, setShowRealTime] = useState(false);

  useEffect(() => {
    checkBackendConnection();
    loadTranscriptions();
  }, [user]);

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
      // TODO: Update API to filter transcriptions by userId
      const data = await api.getTranscriptions();
      // For now, all transcriptions are loaded. In production, filter by user.id
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
      // TODO: Pass userId to backend
      const result = await api.transcribeAudio(file);

      if (result.transcription && result.transcription._id) {
        const finalTranscription = await api.pollTranscriptionStatus(
          result.transcription._id,
          (updatedTranscription) => {
            setTranscriptions(prev =>
              prev.map(t =>
                t._id === updatedTranscription._id ? updatedTranscription : t
              )
            );
          }
        );

        if (finalTranscription.status === 'failed') {
          setFallbackAudioFile(file);
          setFallbackTranscriptionId(finalTranscription._id);
          setShowBrowserFallback(true);
        }
      }

      await loadTranscriptions();
    } catch (error) {
      console.error('Upload failed:', error);
      if (error.message && error.message.includes('All transcription providers failed')) {
        setFallbackAudioFile(file);
        setFallbackTranscriptionId(null);
        setShowBrowserFallback(true);
      } else {
        throw error;
      }
    }
  };

  const handleRecordingComplete = async (file, browserTranscript) => {
    try {
      const result = await api.transcribeAudio(file);

      if (result.transcription && result.transcription._id) {
        const finalTranscription = await api.pollTranscriptionStatus(
          result.transcription._id,
          (updatedTranscription) => {
            setTranscriptions(prev =>
              prev.map(t =>
                t._id === updatedTranscription._id ? updatedTranscription : t
              )
            );
          }
        );

        if (finalTranscription.status === 'failed') {
          if (browserTranscript) {
            await api.updateTranscription(finalTranscription._id, {
              transcription: browserTranscript,
              status: 'completed',
              provider: 'browser'
            });
            await loadTranscriptions();
            setError('Server transcription failed. Recovered with browser transcript.');
            setTimeout(() => setError(''), 5000);
          } else {
            setFallbackAudioFile(file);
            setFallbackTranscriptionId(finalTranscription._id);
            setShowBrowserFallback(true);
          }
        }
      }

      await loadTranscriptions();
    } catch (error) {
      console.error('Recording upload failed:', error);
      if (browserTranscript) {
        const manualTranscription = {
          _id: `browser-${Date.now()}`,
          audioFile: {
            filename: file.name,
            originalName: file.name,
            path: '',
            mimetype: file.type,
            size: file.size,
          },
          transcription: browserTranscript,
          status: 'completed',
          language: 'en',
          duration: 0,
          error: '',
          processingTime: 0,
          provider: 'browser',
          useBrowserFallback: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTranscriptions(prev => [manualTranscription, ...prev]);
        setError('Backend unavailable. Saved live transcription locally.');
        setTimeout(() => setError(''), 5000);
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
      if (fallbackTranscriptionId) {
        await api.updateTranscription(fallbackTranscriptionId, {
          transcription: text,
          status: 'completed',
          provider: provider
        });
        await loadTranscriptions();
      } else {
        const manualTranscription = {
          _id: `browser-${Date.now()}`,
          audioFile: {
            filename: fallbackAudioFile ? fallbackAudioFile.name : 'recorded-audio',
            originalName: fallbackAudioFile ? fallbackAudioFile.name : 'recorded-audio',
            path: '',
            mimetype: fallbackAudioFile ? fallbackAudioFile.type : 'audio/webm',
            size: fallbackAudioFile ? fallbackAudioFile.size : 0,
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
      }
      setShowBrowserFallback(false);
      setFallbackAudioFile(null);
      setFallbackTranscriptionId(null);
    } catch (error) {
      console.error('Failed to save browser transcription:', error);
      setError('Failed to save transcription');
    }
  };

  const handleBrowserTranscriptionCancel = () => {
    setShowBrowserFallback(false);
    setFallbackAudioFile(null);
    setFallbackTranscriptionId(null);
  };

  const handleTranscriptionUpdate = (id, newText) => {
    setTranscriptions(prev =>
      prev.map(t =>
        t._id === id ? { ...t, transcription: newText } : t
      )
    );
  };

  const handleRetryBrowserFallback = (transcription) => {
    // Set up browser fallback for this specific transcription
    setFallbackAudioFile({ name: transcription.audioFile.originalName });
    setFallbackTranscriptionId(transcription._id);
    setShowBrowserFallback(true);
  };

  const handleRealTimeTranscriptionComplete = (text) => {
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
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-animated"></div>
      <div className="aurora-accent-1"></div>
      <div className="aurora-accent-2"></div>
      <div className="ribbons">
        <div className="ribbon ribbon-1"></div>
        <div className="ribbon ribbon-2"></div>
        <div className="ribbon ribbon-3"></div>
        <div className="ribbon ribbon-4"></div>
        <div className="ribbon ribbon-5"></div>
        <div className="ribbon ribbon-6"></div>
      </div>

      {/* Antigravity Floating Balls */}
      <div className="floating-balls">
        <div className="floating-ball ball-1"></div>
        <div className="floating-ball ball-2"></div>
        <div className="floating-ball ball-3"></div>
        <div className="floating-ball ball-4"></div>
        <div className="floating-ball ball-5"></div>
        <div className="floating-ball ball-6"></div>
        <div className="floating-ball ball-7"></div>
        <div className="floating-ball ball-8"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl aurora-glow">
        <div style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 31, 58, 0.8) 50%, rgba(42, 31, 74, 0.8) 100%)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent font-poppins">EchoScriptAI</h1>
                <p className="text-teal-300 mt-2 text-lg font-light">Audio Transcription Service</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-cyan-300 font-semibold">👤 {user.name}</p>
                  <p className="text-cyan-200/70 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-lg hover:from-red-400 hover:to-pink-400 transition-all shadow-lg shadow-red-500/50"
                >
                  🚪 Logout
                </button>
                <button
                  onClick={() => setShowRealTime(!showRealTime)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${showRealTime
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/50 aurora-glow'
                      : 'bg-gradient-to-r from-blue-500/40 to-purple-500/40 text-cyan-200 border border-cyan-400/50 hover:from-blue-500/60 hover:to-purple-500/60'
                    }`}
                >
                  {showRealTime ? '📁 File Upload' : '🎤 Real-Time'}
                </button>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${backendConnected
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse shadow-lg shadow-teal-500/50'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50'
                    }`}></div>
                  <span className={`text-sm font-medium ${backendConnected ? 'text-emerald-300' : 'text-red-400'
                    }`}>
                    {backendConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="relative z-10 backdrop-blur-lg border-b border-red-500/50" style={{
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(153, 27, 27, 0.2) 100%)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-300">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-300 transition-colors"
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
      <main className="relative z-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Methods */}
          <div className="space-y-8">
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
          <div className="space-y-8">
            <TranscriptionStats transcriptions={transcriptions} />
            {loading ? (
              <div className="glass-aurora border-teal-500/40 backdrop-blur-2xl rounded-2xl">
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-cyan-500/30 border-t-cyan-400"></div>
                  <p className="text-cyan-300 font-medium">Loading transcriptions...</p>
                </div>
              </div>
            ) : (
              <TranscriptionList
                transcriptions={transcriptions}
                onDelete={handleDeleteTranscription}
                onUpdate={handleTranscriptionUpdate}
                onRetryBrowserFallback={handleRetryBrowserFallback}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-xl border-t border-teal-500/30 mt-16" style={{
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.6) 0%, rgba(26, 31, 58, 0.6) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-teal-300/80 text-sm font-light">
            ✨ Powered by OpenAI Whisper, Deepgram & Browser Web Speech API | Your data is isolated and secure
          </p>
        </div>
      </footer>
    </div>
  );
}
