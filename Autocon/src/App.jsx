import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NetworkProvider } from './context/NetworkContext';
import { WalletProvider } from './hooks/useWallet';
import Sidebar from './components/dashboard/Sidebar';
import Navbar from './components/dashboard/Navbar';
import OnboardingTour from './components/dashboard/OnboardingTour';
import { usePlatformSync } from './hooks/usePlatformSync';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AdminRoute from './components/routes/AdminRoute';

// Phase 6: Code Splitting — Lazy load all page routes
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// Legacy generators removed, routes redirected
const AuditPage = lazy(() => import('./pages/AuditPage'));
const TemplateLibrary = lazy(() => import('./pages/TemplateLibrary'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ASTPage = lazy(() => import('./pages/ASTPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const ContractWizard = lazy(() => import('./pages/ContractWizard'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
import CommandPalette from './components/ui/CommandPalette';

/**
 * ProtectedRoute — Fix 3: Auth guard.
 * (architect-review: all routes were publicly accessible without auth check)
 * Redirects unauthenticated users to "/" which resolves to LandingPage.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null; // AppContent's loading spinner handles the wait
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/**
 * GuardedPage — Fix 3 + 4: auth guard + route-level error isolation.
 * (react-patterns skill §7: error boundaries at route/feature level)
 * A crash in one page now only collapses that route, not the whole app shell.
 */
function GuardedPage({ children }) {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <div className="spinner spinner-md" />
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Loading page...</p>
          </div>
        }>
          {children}
        </Suspense>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* All protected routes — auth guarded + error isolated per GuardedPage */}
      <Route path="/dashboard" element={<GuardedPage><Dashboard /></GuardedPage>} />
      <Route path="/tokens"    element={<Navigate to="/create?type=ERC20" replace />} />
      <Route path="/nfts"      element={<Navigate to="/create?type=ERC721" replace />} />
      <Route path="/auctions"  element={<Navigate to="/create?type=Auction" replace />} />
      <Route path="/audit"     element={<GuardedPage><AuditPage /></GuardedPage>} />
      <Route path="/profile"   element={<GuardedPage><ProfilePage /></GuardedPage>} />
      <Route path="/templates" element={<GuardedPage><TemplateLibrary /></GuardedPage>} />
      <Route path="/ast"       element={<GuardedPage><ASTPage /></GuardedPage>} />
      <Route path="/analytics" element={<GuardedPage><AnalyticsPage /></GuardedPage>} />
      <Route path="/jobs"      element={<GuardedPage><JobsPage /></GuardedPage>} />
      <Route path="/ai-chat"   element={<GuardedPage><AIChatPage /></GuardedPage>} />
      <Route path="/create"    element={<GuardedPage><ContractWizard /></GuardedPage>} />
      <Route path="/admin"     element={<GuardedPage><AdminRoute><AdminPage /></AdminRoute></GuardedPage>} />
    </Routes>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  usePlatformSync();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="spinner spinner-lg" />
        <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Loading AutoCon...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-[color:var(--bg)]" />}>
          <LoginPage />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-[color:var(--bg)]" />}>
        <LandingPage onLoginClick={() => setShowLogin(true)} />
      </Suspense>
    );
  }

  // Main App Layout
  return (
    <div className={`dashboard-theme dashboard-app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CommandPalette />
      <OnboardingTour />
      {/* Fixed sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
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
