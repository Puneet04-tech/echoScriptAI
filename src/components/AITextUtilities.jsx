import React, { useState } from 'react';
import { api } from '../services/api';

export const AITextUtilities = ({ text, onTextUpdate }) => {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Local fallback implementations
  const generateLocalSummary = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const keyPoints = sentences.slice(0, 5);
    return keyPoints.map((point, i) => `${i + 1}. ${point.trim()}`).join('\n');
  };

  const extractLocalActionItems = (text) => {
    const actionPatterns = [
      { pattern: /(?:need to|should|must|will|have to)\s+([^.!?]+)/gi, priority: 'high' },
      { pattern: /(?:consider|maybe|could|might)\s+([^.!?]+)/gi, priority: 'medium' },
      { pattern: /(?:try|test|check)\s+([^.!?]+)/gi, priority: 'low' }
    ];

    const items = [];
    actionPatterns.forEach(({ pattern, priority }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        items.push({
          task: match[1].trim(),
          priority: priority,
          assignee: 'Unassigned'
        });
      }
    });

    // If no actions found, extract key sentences
    if (items.length === 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      return sentences.slice(0, 5).map((sentence, i) => ({
        task: sentence.trim(),
        priority: i === 0 ? 'high' : i < 3 ? 'medium' : 'low',
        assignee: 'Unassigned'
      }));
    }

    return items.slice(0, 10);
  };

  const removeLocalFillerWords = (text) => {
    const fillerWords = [
      'um', 'uh', 'ah', 'er', 'basically', 'like', 'you know', 'sort of', 'kind of',
      'actually', 'literally', 'I mean', 'so', 'anyway', 'by the way', 'now', 'right',
      'okay', 'alright', 'well', 'you see'
    ];

    let cleaned = text;
    fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b\\s*`, 'gi');
      cleaned = cleaned.replace(regex, ' ');
    });

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  };

  const handleSummary = async () => {
    setLoading('summary');
    setError('');
    try {
      try {
        const response = await api.aiSummary(text);
        setResult({ type: 'summary', data: response.summary });
      } catch (err) {
        console.warn('Backend summary failed, using local fallback:', err);
        const localSummary = generateLocalSummary(text);
        setResult({ type: 'summary', data: localSummary, isLocal: true });
      }
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
      try {
        const response = await api.aiActionItems(text);
        setResult({ type: 'actionItems', data: response.actionItems });
      } catch (err) {
        console.warn('Backend action items failed, using local fallback:', err);
        const localItems = extractLocalActionItems(text);
        setResult({ type: 'actionItems', data: localItems, isLocal: true });
      }
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
      try {
        const response = await api.aiRemoveFillers(text);
        const cleanedText = response.cleanedText;
        setResult({ type: 'cleanedText', data: cleanedText });
        if (onTextUpdate) {
          onTextUpdate(cleanedText);
        }
      } catch (err) {
        console.warn('Backend filler removal failed, using local fallback:', err);
        const cleanedText = removeLocalFillerWords(text);
        setResult({ type: 'cleanedText', data: cleanedText, isLocal: true });
        if (onTextUpdate) {
          onTextUpdate(cleanedText);
        }
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
      <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center space-x-2">
        <span>🤖 AI Text Utilities</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSummary}
          disabled={loading !== null}
          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/30"
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
          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30"
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
          className="px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/30"
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
          <p className="text-red-400 flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        </div>
      )}

      {result && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20 space-y-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-lg font-semibold text-cyan-300">
                {result.type === 'summary' && '📋 Executive Summary'}
                {result.type === 'actionItems' && '✅ Action Items'}
                {result.type === 'cleanedText' && '✨ Cleaned Text'}
              </h4>
              {result.isLocal && (
                <p className="text-xs text-gray-400 mt-1">💡 Generated locally (backend offline)</p>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2))}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 p-2 rounded transition-all"
              title="Copy to clipboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {result.type === 'summary' && (
            <div className="bg-cyan-950/50 rounded p-4 border border-cyan-500/20 text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
              {result.data}
            </div>
          )}

          {result.type === 'actionItems' && (
            <ul className="space-y-2">
              {result.data.map((item, index) => (
                <li key={index} className="bg-gray-800/50 rounded p-3 border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 text-xs rounded font-semibold whitespace-nowrap flex-shrink-0 ${
                      item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-300 break-words">{item.task}</p>
                      {item.assignee && item.assignee !== 'Unassigned' && (
                        <p className="text-sm text-gray-500 mt-1">👤 {item.assignee}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {result.type === 'cleanedText' && (
            <div className="bg-cyan-950/50 rounded p-4 border border-cyan-500/20 text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
              {result.data}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
