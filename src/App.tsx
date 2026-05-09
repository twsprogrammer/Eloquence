import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AppLayout from '@/components/AppLayout';

// Pages - We'll create these next
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';
import DashboardPage from '@/pages/DashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import HistoryPage from '@/pages/HistoryPage';
import SmartTranslatePage from '@/pages/features/SmartTranslatePage';
import FixImprovePage from '@/pages/features/FixImprovePage';
import WordInsightPage from '@/pages/features/WordInsightPage';
import SynonymFinderPage from '@/pages/features/SynonymFinderPage';
import QuickReplyPage from '@/pages/features/QuickReplyPage';
import SlangDecoderPage from '@/pages/features/SlangDecoderPage';
import LevelSimplifierPage from '@/pages/features/LevelSimplifierPage';
import AdminPanelPage from '@/pages/AdminPanelPage';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-cream p-10 text-center">
      <div className="flex flex-col items-center gap-6 max-w-sm">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <div>
          <p className="font-serif italic text-maroon mb-2">Preparing your eloquence...</p>
          <p className="text-[10px] text-clay/40 leading-relaxed">Checking your credentials and securing your connection.</p>
        </div>
        
        <div className="pt-6 border-t border-maroon/5 w-full">
          <p className="text-[9px] text-clay/30 uppercase tracking-widest font-bold mb-4">Taking too long?</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="text-[10px] font-black text-maroon underline underline-offset-2 hover:text-maroon-light"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* App Routes */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="smart-translate" element={<SmartTranslatePage />} />
            <Route path="fix-improve" element={<FixImprovePage />} />
            <Route path="word-insight" element={<WordInsightPage />} />
            <Route path="synonym-finder" element={<SynonymFinderPage />} />
            <Route path="quick-reply" element={<QuickReplyPage />} />
            <Route path="slang-decoder" element={<SlangDecoderPage />} />
            <Route path="level-simplifier" element={<LevelSimplifierPage />} />
            
            {/* Admin Routes */}
            <Route 
              path="admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanelPage />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
