import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

// ─── Role → route map ────────────────────────────────────────────────────────

const ROLE_REDIRECT: Record<UserRole, string> = {
  admin:    '/admin',
  keeper:   '/keeper',
  customer: '/my-bookings',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const LoadingSpinner: React.FC = () => (
  <div className="min-h-[80vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Official Google G — inline SVG avoids external network dependency and CSP issues
const GoogleIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const { loginWithGoogle, loading, currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Handles post-login redirect: fires when onAuthStateChanged hydrates currentUser
  useEffect(() => {
    if (!loading && currentUser) {
      navigate(ROLE_REDIRECT[currentUser.role], { replace: true });
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      // Navigation is handled by the useEffect above once currentUser is set
    } catch (err) {
      // Silently ignore cancelled popups — not a user-facing error
      if ((err as { code?: string }).code !== 'auth/popup-closed-by-user') {
        setError('Could not sign in. Please try again.');
      }
    }
  };

  // While the auth state resolves, show a spinner to avoid a premature login form flash
  if (loading) return <LoadingSpinner />;

  // Session already active — useEffect will navigate; render nothing in the interim
  if (currentUser) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl border border-stone-100 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tighter mb-4 italic serif">Welcome to Droply</h1>
        <p className="text-stone-500 mb-10">Sign in to manage your luggage and track your bookings.</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border border-stone-200 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-500" role="alert">{error}</p>
        )}

        <p className="mt-8 text-xs text-stone-400">
          By continuing, you agree to our{' '}
          <a href="/terms" className="underline hover:text-stone-600 transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-stone-600 transition-colors">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
