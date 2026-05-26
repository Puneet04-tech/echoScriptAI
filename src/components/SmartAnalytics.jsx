import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const SmartAnalytics = ({ transcription }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate analytics locally when component mounts or transcription changes
  useEffect(() => {
    if (transcription && transcription.transcription && transcription.transcription.trim()) {
      calculateAnalytics();
    }
  }, [transcription]);

  const calculateAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      // Try to get analytics from backend
      try {
        const response = await api.aiAnalytics(
          transcription.transcription,
          transcription.duration
        );
        setAnalytics(response.analytics);
      } catch (err) {
        console.warn('Backend analytics failed, calculating locally:', err);
        // Fallback to local calculation
        const localAnalytics = generateLocalAnalytics(
          transcription.transcription,
          transcription.duration
        );
        setAnalytics(localAnalytics);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateLocalAnalytics = (text, duration) => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Calculate words per minute
    let wpm = 0;
    if (duration && duration > 0) {
      wpm = Math.round((wordCount / duration) * 60);
    }

    // Extract key terms (most frequent words, excluding common stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'];
    const wordFrequency = {};
    words.forEach(word => {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '');
      if (lower.length > 2 && !stopWords.includes(lower)) {
        wordFrequency[lower] = (wordFrequency[lower] || 0) + 1;
      }
    });

    const keyTerms = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'positive', 'success', 'happy', 'love', 'like', 'best', 'better', 'improve', 'agree', 'yes', 'right', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'negative', 'failure', 'unhappy', 'hate', 'dislike', 'worst', 'worse', 'decline', 'disagree', 'no', 'wrong', 'problem', 'issue', 'concern'];

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      const lower = word.toLowerCase();
      if (positiveWords.some(pw => lower.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => lower.includes(nw))) negativeCount++;
    });

    const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
    const sentimentScore = Math.round(((positiveCount - negativeCount) / Math.max(wordCount, 1)) * 100);

    return {
      wordCount,
      sentenceCount,
      wordsPerMinute: wpm,
      keyTerms,
      sentiment: {
        overall: sentiment,
        score: sentimentScore,
        positiveWords: positiveCount,
        negativeWords: negativeCount
      },
      duration: duration || 0
    };
  };

  if (!transcription || !transcription.transcription || !transcription.transcription.trim()) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30 mt-6">
        <p className="text-cyan-400 text-center text-sm">No transcription text to analyze</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30 mt-6">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-red-500/30 mt-6">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30 mt-6">
      <h3 className="text-xl font-bold text-cyan-300 mb-6">Smart Analytics Dashboard</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Word Count */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Word Count</p>
              <p className="text-2xl font-bold text-white">{analytics.wordCount}</p>
            </div>
          </div>
        </div>

        {/* Words Per Minute */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Words/Min</p>
              <p className="text-2xl font-bold text-white">{analytics.wordsPerMinute}</p>
            </div>
          </div>
        </div>

        {/* Sentence Count */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sentences</p>
              <p className="text-2xl font-bold text-white">{analytics.sentenceCount}</p>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${
              analytics.sentiment.overall === 'positive' ? 'bg-green-500/20' :
              analytics.sentiment.overall === 'negative' ? 'bg-red-500/20' :
              'bg-gray-500/20'
            } rounded-lg`}>
              {getSentimentIcon(analytics.sentiment.overall)}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Sentiment</p>
              <p className={`text-lg font-bold ${getSentimentColor(analytics.sentiment.overall)}`}>
                {analytics.sentiment.overall.charAt(0).toUpperCase() + analytics.sentiment.overall.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Terms */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20 mb-6">
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">Key Terms</h4>
        <div className="flex flex-wrap gap-2">
          {analytics.keyTerms.map((term, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-linear-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30"
            >
              {term.word} <span className="text-cyan-500">({term.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Sentiment Details */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-cyan-500/20">
        <h4 className="text-lg font-semibold text-cyan-300 mb-3">Sentiment Analysis</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{analytics.sentiment.positiveWords}</p>
            <p className="text-gray-400 text-sm">Positive Words</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{analytics.sentiment.negativeWords}</p>
            <p className="text-gray-400 text-sm">Negative Words</p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${analytics.sentiment.score > 0 ? 'text-green-400' : analytics.sentiment.score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {analytics.sentiment.score > 0 ? '+' : ''}{analytics.sentiment.score}%
            </p>
            <p className="text-gray-400 text-sm">Sentiment Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};
