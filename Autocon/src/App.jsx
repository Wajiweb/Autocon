import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';
import { WalletProvider } from './hooks/useWallet';
import Sidebar from './components/dashboard/Sidebar';
import Navbar from './components/dashboard/Navbar';
import LoginPage from './pages/LoginPage';
import TokenGenerator from './pages/TokenGenerator';
import Dashboard from './pages/Dashboard';
import AuditPage from './pages/AuditPage';
import NFTGenerator from './pages/NFTGenerator';
import AuctionGenerator from './pages/AuctionGenerator';
import TemplateLibrary from './pages/TemplateLibrary';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';

import ASTPage from './pages/ASTPage';
import AnalyticsPage from './pages/AnalyticsPage';
import JobsPage from './pages/JobsPage';
import AIChatPage from './pages/AIChatPage';
import OnboardingTour from './components/dashboard/OnboardingTour';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tokens" element={<TokenGenerator />} />
        <Route path="/nfts" element={<NFTGenerator />} />
        <Route path="/auctions" element={<AuctionGenerator />} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/templates" element={<TemplateLibrary />} />
        <Route path="/ast" element={<ASTPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/jobs"      element={<JobsPage />} />
        <Route path="/ai-chat"   element={<AIChatPage />} />
      </Routes>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--primary-subtle)', borderTopColor: 'var(--primary)', animation: 'spin-slow 1s linear infinite' }} />
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Loading AutoCon...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // Main App Layout
  return (
    <div className="dashboard-theme dashboard-app">
      <OnboardingTour />
      {/* Fixed sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main column, offset by sidebar width */}
      <div className="dashboard-main-shell">
        {/* Fixed topbar */}
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Page content scroll region */}
        <main className="dashboard-scroll-region">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NetworkProvider>
          <WalletProvider>
            <AuthProvider>
              <div className="min-h-screen bg-[color:var(--bg)] text-white">
                <Toaster
                  position="bottom-right"
                  reverseOrder={false}
                  toastOptions={{
                    style: {
                      background: 'var(--surface)',
                      color: 'var(--on-surface)',
                      border: '1px solid var(--border, var(--surface))',
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.875rem',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                    },
                    success: {
                      iconTheme: { primary: 'var(--accent)', secondary: 'var(--surface-elevated)' },
                    },
                    error: {
                      iconTheme: { primary: 'var(--error)', secondary: 'var(--surface-elevated)' },
                    },
                    loading: {
                      iconTheme: { primary: 'var(--ai-accent)', secondary: 'var(--surface-elevated)' },
                    },
                  }}
                />
                <AppContent />
              </div>
            </AuthProvider>
          </WalletProvider>
        </NetworkProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
