import { useState } from 'react';

const TranscriptionList = ({ transcriptions, onDelete }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!transcriptions || transcriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Transcriptions</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2">No transcriptions yet</p>
          <p className="text-sm">Upload or record audio to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Transcriptions</h2>
      
      <div className="space-y-4">
        {transcriptions.map((transcription) => {
          const isExpanded = expandedId === transcription._id;
          const text = transcription.transcription || '';
          const shouldTruncate = text.length > 200 && !isExpanded;
          const displayText = shouldTruncate ? text.substring(0, 200) + '...' : text;

          return (
            <div
              key={transcription._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(transcription.status)}`}>
                      {transcription.status.charAt(0).toUpperCase() + transcription.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(transcription.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">File:</span> {transcription.audioFile.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Language: {transcription.language.toUpperCase()} • 
                    Size: {(transcription.audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                <button
                  onClick={() => onDelete(transcription._id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete transcription"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {transcription.status === 'processing' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    <span className="text-sm text-yellow-700">Processing audio...</span>
                  </div>
                </div>
              )}

              {transcription.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Error:</span> {transcription.error || 'Transcription failed'}
                  </p>
                </div>
              )}

              {transcription.status === 'completed' && transcription.transcription && (
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-700 whitespace-pre-wrap flex-1">{displayText}</p>
                    <div className="flex items-center space-x-2 ml-2">
                      {text.length > 200 && (
                        <button
                          onClick={() => toggleExpand(transcription._id)}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(text, transcription._id)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Copy transcription"
                      >
                        {copiedId === transcription._id ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {transcription.processingTime > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processing time: {transcription.processingTime}ms
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptionList;
