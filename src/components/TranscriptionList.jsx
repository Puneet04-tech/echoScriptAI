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
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
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
      <div className="glass-aurora border-cyan-500/50 backdrop-blur-2xl rounded-2xl aurora-glow">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent mb-4 font-poppins">📋 Transcriptions</h2>
        <div className="text-center py-12 text-cyan-300/70">
          <svg className="mx-auto h-12 w-12 text-teal-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 font-semibold text-cyan-200">No transcriptions yet</p>
          <p className="text-xs text-cyan-300/60 mt-1">Upload or record audio to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-aurora border-cyan-500/50 backdrop-blur-2xl rounded-2xl aurora-glow hover:border-teal-400/60 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent font-poppins">📋 Transcriptions</h2>
        <span className="text-sm text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/50">
          {filteredTranscriptions.length} of {transcriptions.length}
        </span>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search transcriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-cyan-500/10 border border-cyan-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-200 placeholder-cyan-400/50"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-purple-200"
          >
            <option value="all">All Status</option>
            <option value="completed">✓ Completed</option>
            <option value="processing">⟳ Processing</option>
            <option value="failed">✕ Failed</option>
          </select>
          
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-blue-200"
          >
            <option value="all">All Providers</option>
            <option value="whisper">🎵 Whisper</option>
            <option value="deepgram">🌊 Deepgram</option>
            <option value="browser">🌐 Browser</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTranscriptions.length === 0 ? (
          <div className="text-center py-8 text-cyan-300/70">
            <p className="text-sm">No transcriptions match your filters</p>
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
              className="glass-aurora border-teal-400/50 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-cyan-400/70 transition-all duration-300 aurora-glow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3 flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(transcription.status)}`}>
                      {transcription.status === 'completed' && '✓'}
                      {transcription.status === 'processing' && '⟳'}
                      {transcription.status === 'failed' && '✕'}
                      {' ' + transcription.status.charAt(0).toUpperCase() + transcription.status.slice(1)}
                    </span>
                    {transcription.provider && (
                      <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-500/30 text-blue-200 border border-blue-500/50">
                        {transcription.provider === 'whisper' && '🎵'}
                        {transcription.provider === 'deepgram' && '🌊'}
                        {transcription.provider === 'browser' && '🌐'}
                        {' ' + transcription.provider.charAt(0).toUpperCase() + transcription.provider.slice(1)}
                      </span>
                    )}
                    <span className="text-xs text-teal-300/70">
                      📅 {formatDate(transcription.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-cyan-200 mb-2 font-medium">
                    <span className="text-teal-300">📁 File:</span> {transcription.audioFile.originalName}
                  </p>
                  <p className="text-xs text-cyan-300/70">
                    🗣️ Language: {transcription.language.toUpperCase()} • 💾 Size: {(transcription.audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                
                <button
                  onClick={() => onDelete(transcription._id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/20 rounded-lg"
                  title="Delete transcription"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {transcription.status === 'processing' && (
                <div className="bg-yellow-950/40 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400/30 border-t-yellow-400"></div>
                    <span className="text-sm text-yellow-300 font-medium">⟳ Processing audio...</span>
                  </div>
                </div>
              )}

              {transcription.status === 'failed' && (
                <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-300">
                    <span className="font-semibold">✕ Error:</span> {transcription.error || 'Transcription failed'}
                  </p>
                </div>
              )}

              {transcription.status === 'completed' && transcription.transcription && (
                <div className="glass-aurora border-cyan-400/50 rounded-lg p-4">
                  {editingId === transcription._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 bg-gray-900/30 border border-cyan-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-100 text-sm"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(transcription._id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded font-semibold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/50"
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded font-semibold text-sm hover:bg-cyan-500/30 transition-all"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-cyan-100 whitespace-pre-wrap flex-1 leading-relaxed">{displayText}</p>
                      <div className="flex items-center space-x-2 ml-2">
                        {text.length > 200 && (
                          <button
                            onClick={() => toggleExpand(transcription._id)}
                            className="text-teal-300 hover:text-teal-200 text-xs font-semibold transition-colors"
                          >
                            {isExpanded ? '▼ Less' : '▶ More'}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(text, transcription._id)}
                          className="text-cyan-400 hover:text-cyan-300 p-1 transition-colors"
                          title="Copy transcription"
                        >
                          {copiedId === transcription._id ? (
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          className="text-teal-400 hover:text-teal-300 p-1 transition-colors"
                          title="Edit transcription"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2h2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <div className="relative group">
                          <button className="text-purple-400 hover:text-purple-300 p-1 transition-colors" title="Export">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-2 w-40 bg-gradient-to-b from-purple-900/80 to-blue-900/80 border border-purple-500/50 rounded-lg shadow-lg aurora-glow opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10 backdrop-blur-sm">
                            <button
                              onClick={() => exportTranscription(transcription, 'txt')}
                              className="block w-full text-left px-4 py-2 text-sm text-cyan-200 hover:bg-purple-500/30 border-b border-purple-500/20 first:rounded-t-lg"
                            >
                              📄 Export TXT
                            </button>
                            <button
                              onClick={() => exportTranscription(transcription, 'srt')}
                              className="block w-full text-left px-4 py-2 text-sm text-cyan-200 hover:bg-purple-500/30 border-b border-purple-500/20"
                            >
                              🎬 Export SRT
                            </button>
                            <button
                              onClick={() => exportTranscription(transcription, 'vtt')}
                              className="block w-full text-left px-4 py-2 text-sm text-cyan-200 hover:bg-purple-500/30 last:rounded-b-lg"
                            >
                              🎥 Export VTT
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {transcription.processingTime > 0 && (
                    <p className="text-xs text-teal-300/70 mt-2 font-medium">
                      ⏱️ Processing time: {transcription.processingTime}ms
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
