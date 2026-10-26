import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { AlertCircle } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Checking Dance Card..." />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl border-2 border-disco-border bg-disco-surface text-center shadow-retro">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-disco-mustard border-2 border-disco-border text-disco-border flex items-center justify-center shadow-retro-xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display tracking-wide text-disco-cream mb-2">
          Database Connection Needed
        </h2>
        <p className="text-sm text-disco-cream-muted mb-6 leading-relaxed">
          Supabase credentials are not set in your local environment. 
          Please copy <code className="bg-disco-border px-2 py-0.5 rounded text-disco-mustard">.env.example</code> to <code className="bg-disco-border px-2 py-0.5 rounded text-disco-mustard">.env</code> and fill in your <strong className="text-disco-cream">VITE_SUPABASE_URL</strong> and <strong className="text-disco-cream">VITE_SUPABASE_ANON_KEY</strong>.
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
