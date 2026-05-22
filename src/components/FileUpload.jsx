import { useState } from 'react';

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select an audio file (MP3, WAV, OGG, WebM, M4A, AAC)');
        setFile(null);
        setStatus('error');
        return;
      }
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        setStatus('error');
        return;
      }
      setFile(selectedFile);
      setError('');
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setStatus('uploading');
    setError('');

    try {
      await onUpload(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setStatus('success');
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setStatus('error');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${uploadProgress}%`;
      case 'processing':
        return 'Processing audio...';
      case 'success':
        return 'Upload successful!';
      case 'error':
        return error;
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-950/40 border-blue-500/50 text-blue-300';
      case 'success':
        return 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300';
      case 'error':
        return 'bg-red-950/40 border-red-500/50 text-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="glass-aurora border-cyan-500/50 backdrop-blur-2xl rounded-2xl aurora-glow hover:border-teal-400/60 transition-colors">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent mb-6 font-poppins">📁 Upload Audio File</h2>
      
      <div className="space-y-4">
        <div>
          <input
            id="file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-cyan-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-cyan-500 file:to-teal-500 file:text-white
              hover:file:from-cyan-400 hover:file:to-teal-400
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              file:shadow-lg file:shadow-cyan-500/50"
          />
        </div>

        {file && (
          <div className="glass-aurora border-teal-400/40 rounded-xl p-4">
            <p className="text-sm text-cyan-200">
              <span className="font-semibold text-teal-300">✓ Selected:</span> {file.name}
            </p>
            <p className="text-xs text-cyan-300/70 mt-2">
              Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {status !== 'idle' && (
          <div className={`${getStatusColor()} border px-4 py-3 rounded-lg backdrop-blur-sm`}>
            <div className="flex items-center space-x-2">
              {(status === 'uploading' || status === 'processing') && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300/30 border-t-blue-400"></div>
              )}
              {status === 'success' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === 'error' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm font-medium">{getStatusMessage()}</span>
            </div>
          </div>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-blue-900/30 rounded-full h-3 border border-blue-500/30">
            <div
              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
            !file || uploading
              ? 'bg-cyan-500/20 text-cyan-300/50 cursor-not-allowed border border-cyan-500/20'
              : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-500/50 aurora-glow'
          }`}
        >
          {uploading ? '⏳ Processing...' : '🚀 Upload & Transcribe'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
