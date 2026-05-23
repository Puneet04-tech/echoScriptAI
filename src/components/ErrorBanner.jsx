import React from 'react';

const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-900/80 border border-red-500 text-red-100 px-6 py-3 rounded-lg shadow-lg backdrop-blur-md neon-glow z-50 flex items-center space-x-2">
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-red-300 hover:text-white focus:outline-none">
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner;
