import { useState, useRef, useEffect } from 'react';

const AudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Real-time transcription states
  const [realTimeTranscript, setRealTimeTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Check speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSpeechSupported(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    setSuccess(false);
    setRealTimeTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
    setProcessing(true);
    try {
      // Small delay to allow final onresult events to fire
      await new Promise(resolve => setTimeout(resolve, 300));
      // Combine any remaining interim transcript with final transcript before sending
      const combinedTranscript = (finalTranscriptRef.current + ' ' + (interimTranscript || '')).trim();
      // Create audio blob and file
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      // Pass the audio file and the combined transcript
      await onRecordingComplete(audioFile, combinedTranscript);
      setSuccess(true);
      // Reset success after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to process recording. Please try again.');
      console.error('Recording processing error:', err);
    } finally {
      setProcessing(false);
    }
    // Stop speech recognition after processing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
    // Stop all tracks
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

      // Start Web Speech API Recognition simultaneously
      if (isSpeechSupported) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscriptRef.current += result[0].transcript + ' ';
                setRealTimeTranscript(finalTranscriptRef.current);
              } else {
                interim += result[0].transcript;
              }
            }
            setInterimTranscript(interim);
          };

          recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error in recorder:', event.error);
            // Disable further speech recognition on network errors
            if (event.error === 'network') {
              setIsSpeechSupported(false);
            }
          };

          recognitionRef.current.start();
        } catch (recognitionError) {
          console.error('Failed to initialize speech recognition:', recognitionError);
        }
      }

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      setError('Microphone access denied or not available');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping speech recognition:', err);
        }
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-aurora border-cyan-500/50 backdrop-blur-2xl rounded-2xl aurora-glow hover:border-teal-400/60 transition-colors">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent mb-6 font-poppins">🎙️ Record Audio</h2>
      
      <div className="space-y-6">
        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg backdrop-blur-sm">
            ✕ {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-lg backdrop-blur-sm">
            ✓ Recording uploaded successfully!
          </div>
        )}

        <div className="flex flex-col items-center space-y-6">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center space-x-3 px-4 py-2 bg-red-950/40 border border-red-500/50 rounded-lg">
              <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <span className="text-red-300 font-semibold">Recording</span>
              <span className="text-cyan-300 font-mono text-sm">{formatTime(recordingTime)}</span>
            </div>
          )}

          {processing && (
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-950/40 border border-blue-500/50 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300/30 border-t-blue-400"></div>
              <span className="text-blue-300 font-medium">Processing recording...</span>
            </div>
          )}

          {/* Record/Stop button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={processing}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${
              isRecording
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/50 scale-110 aurora-glow'
                : processing
                ? 'bg-cyan-500/20 text-cyan-300/50 cursor-not-allowed border border-cyan-500/20'
                : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-400 hover:to-violet-400 shadow-lg shadow-purple-500/50 aurora-glow'
            }`}
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded"></div>
            ) : processing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-300/30 border-t-cyan-400"></div>
            ) : (
              <span className="text-xl">🎤</span>
            )}
          </button>

          <p className="text-sm text-cyan-300/70 text-center font-medium">
            {processing ? '⏳ Processing...' : isRecording ? '⏹️ Click to stop recording' : '▶️ Click to start recording'}
          </p>
        </div>

        {/* Real-time Transcription Preview */}
        {(realTimeTranscript || interimTranscript) && (
          <div className="glass-aurora border-purple-400/50 rounded-xl p-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-teal-300 font-bold mb-2 uppercase tracking-widest">✨ Live Speech Preview:</p>
            <p className="text-sm text-cyan-100 whitespace-pre-wrap leading-relaxed">
              {realTimeTranscript}
              {interimTranscript && (
                <span className="text-teal-300 italic font-medium animate-pulse">{interimTranscript}</span>
              )}
            </p>
          </div>
        )}

        <div className="glass-aurora border-blue-400/50 rounded-xl p-4">
          <p className="text-xs text-blue-200 leading-relaxed">
            <span className="font-semibold text-cyan-300">💡 Tip:</span> Speak clearly and close to your microphone for best results.
            {!isSpeechSupported && ' (Note: Live Speech Preview is only supported on Chrome, Edge, and Safari)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
