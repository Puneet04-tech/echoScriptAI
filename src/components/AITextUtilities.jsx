import React, { useState } from 'react';
import { api } from '../services/api';

export const AITextUtilities = ({ text, onTextUpdate }) => {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSummary = async () => {
    setLoading('summary');
    setError('');
    try {
      const response = await api.aiSummary(text);
      setResult({ type: 'summary', data: response.summary });
    } catch (err) {
      setError('Failed to generate summary');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleActionItems = async () => {
    setLoading('actionItems');
    setError('');
    try {
      const response = await api.aiActionItems(text);
      setResult({ type: 'actionItems', data: response.actionItems });
    } catch (err) {
      setError('Failed to extract action items');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveFillers = async () => {
    setLoading('removeFillers');
    setError('');
    try {
      const response = await api.aiRemoveFillers(text);
      setResult({ type: 'cleanedText', data: response.cleanedText });
      if (onTextUpdate) {
        onTextUpdate(response.cleanedText);
      }
    } catch (err) {
      setError('Failed to remove filler words');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30 mt-6">
      <h3 className="text-xl font-bold text-cyan-300 mb-4">AI Text Utilities</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSummary}
          disabled={loading !== null}
          className="px-4 py-3 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading === 'summary' ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Executive Summary</span>
            </>
          )}
        </button>

        <button
          onClick={handleActionItems}
          disabled={loading !== null}
          className="px-4 py-3 bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading === 'actionItems' ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Action Items</span>
            </>
          )}
        </button>

        <button
          onClick={handleRemoveFillers}
          disabled={loading !== null}
          className="px-4 py-3 bg-linear-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading === 'removeFillers' ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Cleaning...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove Fillers</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-cyan-300">
              {result.type === 'summary' && 'Executive Summary'}
              {result.type === 'actionItems' && 'Action Items'}
              {result.type === 'cleanedText' && 'Cleaned Text'}
            </h4>
            <button
              onClick={() => copyToClipboard(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {result.type === 'summary' && (
            <div className="text-gray-300 whitespace-pre-wrap">{result.data}</div>
          )}

          {result.type === 'actionItems' && (
            <ul className="space-y-2">
              {result.data.map((item, index) => (
                <li key={index} className="bg-gray-800/50 rounded p-3 border border-cyan-500/20">
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-300">{item.task}</p>
                      <p className="text-sm text-gray-500">Assignee: {item.assignee}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {result.type === 'cleanedText' && (
            <div className="text-gray-300 whitespace-pre-wrap">{result.data}</div>
          )}
        </div>
      )}
    </div>
  );
};
