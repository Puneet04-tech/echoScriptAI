import { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [signupEmail, setSignupEmail] = useState('');

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('echoscriptai_user');
    const storedToken = localStorage.getItem('echoscriptai_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setCurrentPage('dashboard');
      } catch (err) {
        localStorage.removeItem('echoscriptai_user');
        localStorage.removeItem('echoscriptai_token');
      }
    }
  }, []);

  // Navigation handlers
  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  const handleNavigateToSignup = (email = '') => {
    setSignupEmail(email);
    setCurrentPage('signup');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('echoscriptai_user');
    localStorage.removeItem('echoscriptai_token');
    setUser(null);
    setCurrentPage('landing');
  };

  // Render appropriate page based on currentPage state
  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToSignup={handleNavigateToSignup}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={handleNavigateToSignup}
          onBackToLanding={handleBackToLanding}
        />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage
          initialEmail={signupEmail}
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={handleNavigateToLogin}
          onBackToLanding={handleBackToLanding}
        />
      )}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
