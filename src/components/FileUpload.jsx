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
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Audio File</h2>
      
      <div className="space-y-4">
        <div>
          <input
            id="file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {file && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected:</span> {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        {status !== 'idle' && (
          <div className={`${getStatusColor()} border px-4 py-3 rounded`}>
            <div className="flex items-center space-x-2">
              {(status === 'uploading' || status === 'processing') && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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
              <span className="text-sm">{getStatusMessage()}</span>
            </div>
          </div>
        )}

        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${!file || uploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
        >
          {uploading ? 'Processing...' : 'Upload & Transcribe'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
