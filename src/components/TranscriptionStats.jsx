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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Status Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total</span>
              <span className="text-sm font-semibold text-gray-900">{total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Completed</span>
              <span className="text-sm font-semibold text-green-700">{completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-700">Processing</span>
              <span className="text-sm font-semibold text-yellow-700">{processing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-700">Failed</span>
              <span className="text-sm font-semibold text-red-700">{failed}</span>
            </div>
          </div>
        </div>

        {/* Provider Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Providers</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-700">Whisper</span>
              <span className="text-sm font-semibold text-purple-700">{providerStats.whisper}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Deepgram</span>
              <span className="text-sm font-semibold text-blue-700">{providerStats.deepgram}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Browser</span>
              <span className="text-sm font-semibold text-gray-700">{providerStats.browser}</span>
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Content</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Words</span>
              <span className="text-sm font-semibold text-gray-900">{totalWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Avg File Size</span>
              <span className="text-sm font-semibold text-gray-900">{(avgSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Avg Processing</span>
              <span className="text-sm font-semibold text-gray-900">{Math.round(avgProcessingTime / 1000)}s</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Success Rate</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Completion</span>
              <span className="text-sm font-semibold text-green-700">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
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
