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
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
          
          // Pass the audio file and the captured browser real-time transcript
          await onRecordingComplete(audioFile, finalTranscriptRef.current.trim());
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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Record Audio</h2>
      
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Recording uploaded successfully!
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording</span>
              <span className="text-gray-600 font-mono">{formatTime(recordingTime)}</span>
            </div>
          )}

          {processing && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-purple-600 font-medium">Processing recording...</span>
            </div>
          )}

          {/* Record/Stop button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={processing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all
              ${isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-lg scale-110'
                : processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-md'
              }`}
          >
            {isRecording ? (
              <div className="w-8 h-8 bg-white rounded"></div>
            ) : processing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
            )}
          </button>

          <p className="text-sm text-gray-500 text-center">
            {processing ? 'Processing...' : isRecording ? 'Click to stop recording' : 'Click to start recording'}
          </p>
        </div>

        {/* Real-time Transcription Preview */}
        {(realTimeTranscript || interimTranscript) && (
          <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-xs text-purple-700 font-semibold mb-1 uppercase tracking-wider">Live Speech Preview:</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {realTimeTranscript}
              {interimTranscript && (
                <span className="text-purple-600 italic font-medium animate-pulse">{interimTranscript}</span>
              )}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <span className="font-medium">Tip:</span> Speak clearly and close to your microphone for best results.
            {!isSpeechSupported && ' (Note: Live Speech Preview is only supported on Chrome, Edge, and Safari)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
