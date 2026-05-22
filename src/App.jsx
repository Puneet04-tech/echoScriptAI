import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import TranscriptionList from './components/TranscriptionList';
import { api } from './services/api';

function App() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getTranscriptions();
      setTranscriptions(data);
    } catch (error) {
      console.error('Failed to load transcriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      await api.transcribeAudio(file);
      await loadTranscriptions();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleRecordingComplete = async (file) => {
    try {
      await api.transcribeAudio(file);
      await loadTranscriptions();
    } catch (error) {
      console.error('Recording upload failed:', error);
      throw error;
    }
  };

  const handleDeleteTranscription = async (id) => {
    try {
      await api.deleteTranscription(id);
      await loadTranscriptions();
    } catch (error) {
      console.error('Delete failed:', error);
    }
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
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Backend Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input Methods */}
          <div className="space-y-6">
            <FileUpload onUpload={handleFileUpload} />
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          </div>

          {/* Right Column - Transcriptions */}
          <div>
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              </div>
            ) : (
              <TranscriptionList
                transcriptions={transcriptions}
                onDelete={handleDeleteTranscription}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            Powered by Google Speech-to-Text & Mozilla DeepSpeech
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
