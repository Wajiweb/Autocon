import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import TokenGenerator from './pages/TokenGenerator';
import Dashboard from './pages/Dashboard';
import AuditPage from './pages/AuditPage';
import NFTGenerator from './pages/NFTGenerator';
import AuctionGenerator from './pages/AuctionGenerator';
import TemplateLibrary from './pages/TemplateLibrary';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
import ContractInteraction from './pages/ContractInteraction';
import OnboardingTour from './components/OnboardingTour';
import LandingPage from './pages/LandingPage';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  // Loading state while checking session
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(6,182,212,0.2)',
          borderTop: '3px solid #06b6d4',
          borderRadius: '50%',
          animation: 'spin-slow 0.8s linear infinite'
        }} />
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading AutoCon...</p>
      </div>
    );
  }

  // Show Landing Page or Login page if not authenticated
  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Main App Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{
        flex: 1,
        padding: '20px 32px 32px',
        overflowY: 'auto',
        maxHeight: '100vh'
      }}>
        <Navbar activeTab={activeTab} />
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'templates' && <TemplateLibrary setActiveTab={setActiveTab} />}
        {activeTab === 'token' && <TokenGenerator />}
        {activeTab === 'nft' && <NFTGenerator />}
        {activeTab === 'auction' && <AuctionGenerator />}
        {activeTab === 'interact' && <ContractInteraction />}
        {activeTab === 'audit' && <AuditPage />}
        {activeTab === 'chatbot' && <ChatbotPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}

export default App;