import { useState } from 'react';
import { api } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigateToSignup, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend authentication
      const response = await api.login(email, password);
      
      if (response.user) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background animations */}
      <div className="bg-animated"></div>
      <div className="aurora-accent-1"></div>
      <div className="aurora-accent-2"></div>
      <div className="ribbons">
        <div className="ribbon ribbon-1"></div>
        <div className="ribbon ribbon-2"></div>
        <div className="ribbon ribbon-3"></div>
        <div className="ribbon ribbon-4"></div>
        <div className="ribbon ribbon-5"></div>
        <div className="ribbon ribbon-6"></div>
      </div>

      {/* Floating Balls */}
      <div className="floating-balls">
        <div className="floating-ball ball-1"></div>
        <div className="floating-ball ball-2"></div>
        <div className="floating-ball ball-3"></div>
        <div className="floating-ball ball-4"></div>
        <div className="floating-ball ball-5"></div>
        <div className="floating-ball ball-6"></div>
        <div className="floating-ball ball-7"></div>
        <div className="floating-ball ball-8"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 z-20 px-4 py-2 text-cyan-300 hover:text-cyan-200 transition-colors flex items-center space-x-2 hover:bg-cyan-500/10 rounded-lg"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="glass-aurora border-cyan-500/50 rounded-2xl backdrop-blur-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg mb-4">
              <span className="text-white font-bold text-2xl">🎙️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent font-poppins">
              EchoScriptAI
            </h1>
            <p className="text-cyan-200/70 text-sm mt-2">Welcome back</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-teal-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-100 placeholder-cyan-400/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-teal-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-100 placeholder-cyan-400/50 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/50 aurora-glow"
            >
              {loading ? '🔄 Logging in...' : '✓ Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-cyan-950 text-cyan-300/70">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-cyan-200/70 mb-3">Don't have an account?</p>
            <button
              onClick={() => onNavigateToSignup(email)}
              className="w-full px-6 py-3 bg-purple-500/20 text-cyan-200 font-bold rounded-lg border border-purple-500/50 hover:bg-purple-500/30 transition-all"
            >
              📝 Create Account
            </button>
          </div>

          {/* Demo Mode */}
          <div className="mt-6 pt-6 border-t border-cyan-500/20">
            <p className="text-xs text-cyan-300/50 text-center mb-3">Test Credentials:</p>
            <button
              onClick={() => {
                setEmail('demo@echoscriptai.com');
                setPassword('password123');
              }}
              className="w-full text-xs text-cyan-400 hover:text-cyan-300 py-2 px-3 bg-cyan-500/10 rounded hover:bg-cyan-500/20 transition-all"
            >
              Use Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
