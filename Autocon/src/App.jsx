import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';
import Sidebar from './components/dashboard/Sidebar';
import Navbar from './components/dashboard/Navbar';
import LoginPage from './pages/LoginPage';
import TokenGenerator from './pages/TokenGenerator';
import Dashboard from './pages/Dashboard';
import AuditPage from './pages/AuditPage';
import NFTGenerator from './pages/NFTGenerator';
import AuctionGenerator from './pages/AuctionGenerator';
import TemplateLibrary from './pages/TemplateLibrary';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import AnimatedPage from './components/dashboard/AnimatedPage';
import ASTPage from './pages/ASTPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
        <Route path="/tokens" element={<AnimatedPage><TokenGenerator /></AnimatedPage>} />
        <Route path="/nfts" element={<AnimatedPage><NFTGenerator /></AnimatedPage>} />
        <Route path="/auctions" element={<AnimatedPage><AuctionGenerator /></AnimatedPage>} />
        <Route path="/audit" element={<AnimatedPage><AuditPage /></AnimatedPage>} />
        <Route path="/chatbot" element={<AnimatedPage><ChatbotPage /></AnimatedPage>} />
        <Route path="/profile" element={<AnimatedPage><ProfilePage /></AnimatedPage>} />
        <Route path="/templates" element={<AnimatedPage><TemplateLibrary /></AnimatedPage>} />
        <Route path="/ast" element={<AnimatedPage><ASTPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading AutoCon...</p>
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
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070e0a', color: '#e2ede6' }}>
        {/* Fixed sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
        />

        {/* Scrollable main column — offset by sidebar width */}
        <div style={{
          flex: 1,
          marginLeft: '218px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}>
          {/* Fixed topbar */}
          <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

          {/* Page content — padded below the fixed topbar */}
          <div style={{ flex: 1, paddingTop: '54px', overflowY: 'auto' }}>
            <AnimatedRoutes />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <AuthProvider>
          {/* Single global Toaster — dark mode, Kinetic Ether themed */}
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: '#161d2b',
                color: '#f1f5f9',
                border: '1px solid rgba(255,255,255,0.08)',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.875rem',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#161d2b' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#161d2b' },
              },
              loading: {
                iconTheme: { primary: '#a78bfa', secondary: '#161d2b' },
              },
            }}
          />
          <AppContent />
        </AuthProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}

export default App;