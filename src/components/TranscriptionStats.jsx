const TranscriptionStats = ({ transcriptions }) => {
  const total = transcriptions.length;
  const completed = transcriptions.filter(t => t.status === 'completed').length;
  const processing = transcriptions.filter(t => t.status === 'processing').length;
  const failed = transcriptions.filter(t => t.status === 'failed').length;
  
  const providerStats = {
    whisper: transcriptions.filter(t => t.provider === 'whisper').length,
    deepgram: transcriptions.filter(t => t.provider === 'deepgram').length,
    browser: transcriptions.filter(t => t.provider === 'browser').length,
  };

  const totalWords = transcriptions.reduce((acc, t) => {
    if (t.transcription) {
      return acc + t.transcription.split(/\s+/).length;
    }
    return acc;
  }, 0);

  const totalSize = transcriptions.reduce((acc, t) => acc + (t.audioFile?.size || 0), 0);
  const avgSize = total > 0 ? totalSize / total : 0;

  const avgProcessingTime = transcriptions
    .filter(t => t.processingTime > 0)
    .reduce((acc, t, _, arr) => acc + t.processingTime / arr.length, 0);

  if (total === 0) {
    return null;
  }

  return (
    <div className="glass-aurora border-cyan-500/50 backdrop-blur-2xl rounded-2xl aurora-glow hover:border-teal-400/60 transition-colors">
      <h2 className="text-2xl font-bold bg-linear-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent mb-6 font-poppins">📊 Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Status Stats */}
        <div className="glass-aurora border-blue-400/40 rounded-xl p-4 hover:border-cyan-400/60">
          <h3 className="text-xs font-bold text-teal-300 mb-3 uppercase tracking-wider">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-200">Total</span>
              <span className="text-sm font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-300">✓ Completed</span>
              <span className="text-sm font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded">{completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-300">⟳ Processing</span>
              <span className="text-sm font-semibold text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded">{processing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-400">✕ Failed</span>
              <span className="text-sm font-semibold text-red-400 bg-red-500/20 px-2 py-1 rounded">{failed}</span>
            </div>
          </div>
        </div>

        {/* Provider Stats */}
        <div className="glass-aurora border-purple-400/40 rounded-xl p-4 hover:border-violet-400/60">
          <h3 className="text-xs font-bold text-teal-300 mb-3 uppercase tracking-wider">Providers</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-300">Whisper</span>
              <span className="text-sm font-semibold text-purple-300 bg-purple-500/20 px-2 py-1 rounded">{providerStats.whisper}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-300">Deepgram</span>
              <span className="text-sm font-semibold text-blue-300 bg-blue-500/20 px-2 py-1 rounded">{providerStats.deepgram}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-teal-300">Browser</span>
              <span className="text-sm font-semibold text-teal-300 bg-teal-500/20 px-2 py-1 rounded">{providerStats.browser}</span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="glass-aurora border-cyan-400/40 rounded-xl p-4 hover:border-emerald-400/60">
          <h3 className="text-xs font-bold text-teal-300 mb-3 uppercase tracking-wider">Content</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-200">Total Words</span>
              <span className="text-sm font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">{totalWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-200">Avg File Size</span>
              <span className="text-sm font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">{(avgSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-cyan-200">Avg Processing</span>
              <span className="text-sm font-semibold text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">{Math.round(avgProcessingTime / 1000)}s</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="glass-aurora border-emerald-400/40 rounded-xl p-4 hover:border-teal-400/60">
          <h3 className="text-xs font-bold text-teal-300 mb-3 uppercase tracking-wider">Success Rate</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-emerald-200">Completion</span>
              <span className="text-sm font-semibold text-emerald-300">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-emerald-900/30 rounded-full h-2 border border-emerald-500/30">
              <div
                className="bg-linear-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all shadow-lg shadow-emerald-500/50"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionStats;
