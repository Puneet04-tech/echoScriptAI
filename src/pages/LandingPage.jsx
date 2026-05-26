import { useState } from 'react';

export default function LandingPage({ onNavigateToLogin, onNavigateToSignup }) {
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleGetStarted = () => {
    setShowEmailInput(true);
  };

  const handleContinueEmail = () => {
    if (email) {
      onNavigateToSignup(email);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
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

      {/* Navigation Header */}
      <header className="relative z-20 backdrop-blur-xl border-b border-cyan-500/30">
        <div style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 31, 58, 0.9) 50%, rgba(42, 31, 74, 0.9) 100%)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🎙️</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent font-poppins">EchoScriptAI</h1>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/50"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight font-poppins">
                  Transform Audio into Text
                </h2>
                <p className="text-xl text-cyan-200 leading-relaxed">
                  Experience the power of AI-driven audio transcription. EchoScriptAI converts your speech into accurate, editable text in seconds.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!showEmailInput ? (
                  <>
                    <button
                      onClick={handleGetStarted}
                      className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-lg rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/50 aurora-glow flex items-center justify-center space-x-2"
                    >
                      <span>🚀 Get Started Free</span>
                    </button>
                    <button
                      onClick={onNavigateToLogin}
                      className="px-8 py-4 bg-purple-500/20 text-cyan-200 font-bold text-lg border border-purple-500/50 rounded-lg hover:bg-purple-500/30 transition-all"
                    >
                      <span>📊 View Demo</span>
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 w-full sm:w-96">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-6 py-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-cyan-100 placeholder-cyan-400/50 font-medium"
                    />
                    <button
                      onClick={handleContinueEmail}
                      disabled={!email}
                      className="w-full px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/50"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-4 pt-8">
                <h3 className="text-teal-300 font-bold text-sm uppercase tracking-widest">✨ Key Features</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-cyan-400 text-2xl">🎯</div>
                    <div>
                      <p className="font-semibold text-cyan-200">High Accuracy</p>
                      <p className="text-sm text-cyan-300/70">Advanced AI models for precise transcription</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-cyan-400 text-2xl">⚡</div>
                    <div>
                      <p className="font-semibold text-cyan-200">Lightning Fast</p>
                      <p className="text-sm text-cyan-300/70">Real-time processing and results</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-cyan-400 text-2xl">🔐</div>
                    <div>
                      <p className="font-semibold text-cyan-200">Secure & Private</p>
                      <p className="text-sm text-cyan-300/70">Your data is encrypted and isolated</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-cyan-400 text-2xl">📱</div>
                    <div>
                      <p className="font-semibold text-cyan-200">All Devices</p>
                      <p className="text-sm text-cyan-300/70">Works seamlessly on mobile and desktop</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="glass-aurora border-cyan-500/50 rounded-2xl p-8 backdrop-blur-xl relative">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-block p-6 bg-gradient-to-br from-cyan-500/30 to-teal-500/30 rounded-full mb-4">
                    <svg className="w-16 h-16 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-300 mb-2">Smart Transcription</h3>
                  <p className="text-cyan-200/70">Upload audio files, record live, or use real-time transcription</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-cyan-500/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                    <span className="text-cyan-200">Multiple input methods</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                    <span className="text-cyan-200">Edit & export in multiple formats</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                    <span className="text-cyan-200">Full transcript history</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400"></div>
                    <span className="text-cyan-200">100% user data isolation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: '⚡', label: 'Lightning Fast', value: '<2 mins' },
              { icon: '🎯', label: 'Accuracy', value: '99%+' },
              { icon: '👥', label: 'Users', value: '10K+' },
              { icon: '📊', label: 'Transcriptions', value: '100K+' },
            ].map((stat, i) => (
              <div key={i} className="glass-aurora border-teal-400/50 rounded-xl p-6 text-center backdrop-blur-xl">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <p className="text-3xl font-bold text-cyan-300 mb-2">{stat.value}</p>
                <p className="text-sm text-cyan-200/70">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="glass-aurora border-cyan-500/50 rounded-2xl p-12 text-center backdrop-blur-xl">
            <h3 className="text-3xl font-bold text-cyan-300 mb-4">Ready to transform your audio?</h3>
            <p className="text-cyan-200/70 mb-8 text-lg">Join thousands of users transcribing their audio with EchoScriptAI</p>
            <button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-lg rounded-lg hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/50 aurora-glow inline-flex items-center space-x-2"
            >
              <span>🚀 Start Free Today</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/30 backdrop-blur-xl mt-20">
        <div style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 31, 58, 0.8) 100%)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h4 className="text-cyan-300 font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-cyan-200/70">
                  <li><a href="#" className="hover:text-cyan-300 transition">Features</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">Pricing</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-300 font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-cyan-200/70">
                  <li><a href="#" className="hover:text-cyan-300 transition">About</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">Blog</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-cyan-300 font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-cyan-200/70">
                  <li><a href="#" className="hover:text-cyan-300 transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">Terms</a></li>
                  <li><a href="#" className="hover:text-cyan-300 transition">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-cyan-500/20 pt-8 text-center text-cyan-300/60 text-sm">
              <p>&copy; 2026 EchoScriptAI. All rights reserved. Powered by Aurora Cluster Design.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
