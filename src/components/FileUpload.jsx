import { useState } from 'react';

const FileUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/aac'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select an audio file (MP3, WAV, OGG, WebM, M4A, AAC)');
        setFile(null);
        return;
      }
      // Validate file size (50MB limit)
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await onUpload(file);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
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
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              cursor-pointer"
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
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
          {uploading ? 'Uploading...' : 'Upload & Transcribe'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
