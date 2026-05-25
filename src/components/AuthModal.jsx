import React, { useState } from 'react';
import * as authApi from '../services/authApi';

export const AuthModal = ({ onSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = mode === 'login' ? await authApi.login(email, password) : await authApi.register(email, password);
      const token = resp.token;
      localStorage.setItem('token', token);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
      <div className="bg-gray-900 bg-opacity-90 rounded-lg shadow-xl p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-cyan-300">{mode === 'login' ? 'Login' : 'Register'}</h2>
        {error && <p className="text-red-400 mb-2 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          {mode === 'login' ? "Don\'t have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-cyan-400 hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
