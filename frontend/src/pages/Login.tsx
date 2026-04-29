import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

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

      if (userRole === 'admin')       navigate('/admin');
      else if (userRole === 'keeper') navigate('/keeper');
      else                            navigate('/dashboard');

    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(raw.startsWith('{') ? 'Authentication failed. Please try again.' : raw);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-navy/5 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg">D</div>
            <span className="text-2xl font-bold tracking-tight text-navy">Droply</span>
          </div>
          <h1 className="text-3xl font-bold display text-navy mb-2">Sign in to Droply</h1>
          <p className="text-sm text-navy/40 font-medium tracking-tight">
            Don't have an account?{' '}
            <Link to="/book" className="text-secondary hover:underline font-bold">Sign Up</Link>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-navy/10 rounded-xl font-bold text-navy hover:bg-navy/5 transition-all mb-8 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </>
          )}
        </button>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-navy/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white px-4 text-navy/20">or sign in with email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy/60 uppercase tracking-widest pl-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center pl-1">
              <label className="text-xs font-bold text-navy/60 uppercase tracking-widest">Password</label>
              <button type="button" className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>

          <div className="flex items-center gap-3 pl-1">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 rounded border-navy/10 text-secondary focus:ring-secondary"
            />
            <label htmlFor="remember" className="text-xs font-bold text-navy/40 uppercase tracking-widest cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-primary text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary-deep transition-all shadow-lg shadow-primary/20 mt-4"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-bold text-navy/20 uppercase tracking-widest">
          Secure encryption enabled
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
