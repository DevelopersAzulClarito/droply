import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase'; // Asegúrate de que esta ruta apunte a tu firebase.ts unificado
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/user-not-found':       'No account found with this email.',
  'auth/wrong-password':       'Incorrect password.',
  'auth/invalid-credential':   'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email':        'Please enter a valid email address.',
  'auth/weak-password':        'Password must be at least 6 characters.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/too-many-requests':    'Too many attempts. Please wait and try again.',
};

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code ?? '';
    if (FIREBASE_ERRORS[code]) return FIREBASE_ERRORS[code];
    const msg = err.message;
    return msg.startsWith('{') ? 'Authentication failed. Please try again.' : msg;
  }
  return 'Something went wrong. Please try again.';
}

const Login: React.FC = () => {
  const [isLogin, setIsLogin]         = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  const redirectByRole = (role: string) => {
    if (role === 'admin')        navigate('/admin');
    else if (role === 'keeper')  navigate('/keeper');
    else                         navigate('/dashboard');
  };

  const switchMode = () => {
    setIsLogin(v => !v);
    setError(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result   = await signInWithPopup(auth, provider);
      const fbUser   = result.user;

      const userPath = `users/${fbUser.uid}`;
      let userRole   = 'customer';

      try {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', fbUser.uid), {
            id:        fbUser.uid,
            name:      fbUser.displayName,
            email:     fbUser.email,
            role:      'customer',
            createdAt: serverTimestamp(),
          });
        } else {
          userRole = userDoc.data().role ?? 'customer';
        }
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.GET, userPath);
      }

      redirectByRole(userRole);
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const result   = await signInWithEmailAndPassword(auth, email, password);
        const fbUser   = result.user;
        const userPath = `users/${fbUser.uid}`;
        let userRole   = 'customer';
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) userRole = userDoc.data().role ?? 'customer';
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.GET, userPath);
        }
        redirectByRole(userRole);
      } else {
        const result   = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser   = result.user;
        await updateProfile(fbUser, { displayName });
        const userPath = `users/${fbUser.uid}`;
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            id:        fbUser.uid,
            name:      displayName,
            email:     fbUser.email,
            role:      'customer',
            createdAt: serverTimestamp(),
          });
        } catch (firestoreErr) {
          handleFirestoreError(firestoreErr, OperationType.CREATE, userPath);
        }
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf9] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-[32rem] h-[32rem] bg-[#006a62]/[0.06] blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-[#ff9800]/[0.06] blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,106,98,0.15)] px-6 py-10 sm:px-10 relative z-10 border border-[#006a62]/5"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-[#ff9800] rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(255,152,0,0.35)]">
              <span className="text-white font-extrabold text-lg leading-none select-none">D</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#1a2e2c]">Droply</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-header' : 'signup-header'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-[1.75rem] font-extrabold text-[#1a2e2c] leading-tight mb-1">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="text-sm text-[#1a2e2c]/40 font-medium">
                {isLogin ? 'Sign in to continue to Droply' : 'Start your Droply journey today'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[#f7faf9] rounded-2xl p-1 mb-7 gap-1 border border-[#e0e3e2]/50">
          <button
            type="button"
            onClick={() => { if (!isLogin) switchMode(); }}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              isLogin
                ? 'bg-white text-[#006a62] shadow-[0_2px_8px_rgba(0,106,98,0.12)]'
                : 'text-[#1a2e2c]/40 hover:text-[#1a2e2c]/70'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { if (isLogin) switchMode(); }}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              !isLogin
                ? 'bg-white text-[#006a62] shadow-[0_2px_8px_rgba(0,106,98,0.12)]'
                : 'text-[#1a2e2c]/40 hover:text-[#1a2e2c]/70'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-2xl text-sm text-[#93000a] font-bold text-center overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-[#e0e3e2] rounded-xl font-bold text-[#1a2e2c] text-sm hover:bg-[#f7faf9] active:scale-95 transition-all duration-150 mb-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-[#e0e3e2] border-t-[#006a62] rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e0e3e2]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[11px] uppercase font-bold tracking-widest text-[#1a2e2c]/25">
              or with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="displayName-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  autoComplete="name"
                  className="w-full h-14 px-5 bg-white border border-[#e0e3e2] rounded-xl text-[#1a2e2c] font-medium placeholder:text-[#1a2e2c]/30 focus:outline-none focus:border-[#006a62] focus:ring-2 focus:ring-[#006a62]/20 transition-all"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full h-14 px-5 bg-white border border-[#e0e3e2] rounded-xl text-[#1a2e2c] font-medium placeholder:text-[#1a2e2c]/30 focus:outline-none focus:border-[#006a62] focus:ring-2 focus:ring-[#006a62]/20 transition-all"
          />

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full h-14 px-5 bg-white border border-[#e0e3e2] rounded-xl text-[#1a2e2c] font-medium placeholder:text-[#1a2e2c]/30 focus:outline-none focus:border-[#006a62] focus:ring-2 focus:ring-[#006a62]/20 transition-all"
            />
            <AnimatePresence>
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-end mt-2"
                >
                  <button
                    type="button"
                    className="text-xs font-bold text-[#006a62] hover:underline"
                  >
                    Forgot password?
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#ff9800] text-white rounded-xl font-extrabold text-sm tracking-widest uppercase shadow-[0_10px_20px_-5px_rgba(255,152,0,0.4)] hover:bg-[#e68a00] active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isLogin ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] font-bold text-[#1a2e2c]/20 uppercase tracking-widest">
          End-to-end encrypted · Secure by default
        </p>
      </motion.div>
    </div>
  );
};

const GoogleIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.2C9.5 35.7 16.3 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2c-.4.4 6.8-5 6.8-14.7 0-1.3-.1-2.6-.4-3.9z"/>
  </svg>
);

export default Login;