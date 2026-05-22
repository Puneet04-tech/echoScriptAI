import { useState } from 'react';

const TranscriptionList = ({ transcriptions, onDelete, onUpdate }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id) => {
    if (onUpdate) {
      onUpdate(id, editText);
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // Filter transcriptions based on search and filters
  const filteredTranscriptions = transcriptions.filter((transcription) => {
    const matchesSearch = 
      searchTerm === '' ||
      transcription.transcription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcription.audioFile.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transcription.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || transcription.provider === providerFilter;
    
    return matchesSearch && matchesStatus && matchesProvider;
  });

  const exportTranscription = (transcription, format) => {
    const text = transcription.transcription || '';
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'txt':
        content = text;
        filename = `${transcription.audioFile.originalName}.txt`;
        mimeType = 'text/plain';
        break;
      case 'srt':
        content = generateSRT(text, transcription.createdAt);
        filename = `${transcription.audioFile.originalName}.srt`;
        mimeType = 'text/plain';
        break;
      case 'vtt':
        content = generateVTT(text, transcription.createdAt);
        filename = `${transcription.audioFile.originalName}.vtt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateSRT = (text, timestamp) => {
    const lines = text.split('\n').filter(line => line.trim());
    let srt = 'WEBVTT\n\n';
    lines.forEach((line, index) => {
      const startTime = index * 3;
      const endTime = (index + 1) * 3;
      srt += `${index + 1}\n`;
      srt += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
      srt += `${line}\n\n`;
    });
    return srt;
  };

  const generateVTT = (text, timestamp) => {
    const lines = text.split('\n').filter(line => line.trim());
    let vtt = 'WEBVTT\n\n';
    lines.forEach((line, index) => {
      const startTime = index * 3;
      const endTime = (index + 1) * 3;
      vtt += `${index + 1}\n`;
      vtt += `${formatVTTTime(startTime)} --> ${formatVTTTime(endTime)}\n`;
      vtt += `${line}\n\n`;
    });
    return vtt;
  };

  const formatSRTTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},000`;
  };

  const formatVTTTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.000`;
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Transcriptions</h2>
        <span className="text-sm text-gray-500">
          {filteredTranscriptions.length} of {transcriptions.length}
        </span>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Providers</option>
            <option value="whisper">Whisper</option>
            <option value="deepgram">Deepgram</option>
            <option value="browser">Browser</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTranscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transcriptions match your filters</p>
          </div>
        ) : (
          filteredTranscriptions.map((transcription) => {
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
                    {transcription.provider && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 border-purple-200">
                        {transcription.provider.charAt(0).toUpperCase() + transcription.provider.slice(1)}
                      </span>
                    )}
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
                  {editingId === transcription._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(transcription._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
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
                        <button
                          onClick={() => startEdit(transcription._id, text)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Edit transcription"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2h2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <div className="relative group">
                          <button className="text-gray-500 hover:text-gray-700 p-1" title="Export">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10">
                            <button
                              onClick={() => exportTranscription(transcription, 'txt')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Export TXT
                            </button>
                            <button
                              onClick={() => exportTranscription(transcription, 'srt')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Export SRT
                            </button>
                            <button
                              onClick={() => exportTranscription(transcription, 'vtt')}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              Export VTT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {transcription.processingTime > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processing time: {transcription.processingTime}ms
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default TranscriptionList;
