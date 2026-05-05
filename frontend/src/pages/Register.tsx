import React, { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Register: React.FC = () => {
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const navigate = useNavigate();

  /* ── helpers ─────────────────────────────────────────────── */
  const createUserDoc = async (uid: string, displayName: string | null, emailAddr: string | null) => {
    const userPath = `users/${uid}`;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', uid), {
          id:        uid,
          name:      displayName,
          email:     emailAddr,
          role:      'customer',
          createdAt: serverTimestamp(),
        });
      }
    } catch (firestoreErr) {
      handleFirestoreError(firestoreErr, OperationType.CREATE, userPath);
    }
  };

  const friendlyError = (msg: string) => {
    if (msg.includes('email-already-in-use')) return 'That email is already registered. Try signing in instead.';
    if (msg.includes('weak-password'))        return 'Password must be at least 6 characters.';
    if (msg.includes('invalid-email'))        return 'Please enter a valid email address.';
    return 'Something went wrong. Please try again.';
  };

  /* ── email/password register ──────────────────────────────── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim())               return setError('Please enter your full name.');
    if (password !== confirm)       return setError('Passwords do not match.');
    if (password.length < 6)        return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name.trim() });
      await createUserDoc(result.user.uid, name.trim(), email);
      navigate('/dashboard');
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      setError(friendlyError(raw));
    } finally {
      setLoading(false);
    }
  };

  /* ── Google register ──────────────────────────────────────── */
  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
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
      const raw = err instanceof Error ? err.message : 'Sign-up failed. Please try again.';
      setError(raw.startsWith('{') ? 'Authentication failed. Please try again.' : raw);
    } finally {
      setGoogleLoading(false);
    }
  };

  /* ── UI ───────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-soft border border-navy/5 relative z-10"
      >
        {/* header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold text-lg">D</div>
            <span className="text-2xl font-bold tracking-tight text-navy">Droply</span>
          </div>
          <h1 className="text-3xl font-bold display text-navy mb-2">Create an account</h1>
          <p className="text-sm text-navy/40 font-medium tracking-tight">
            Already have one?{' '}
            <Link to="/login" className="text-secondary hover:underline font-bold">Sign in</Link>
          </p>
        </div>

        {/* error banner */}
        {error && (
          <div className="mb-6 px-5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading || loading}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-navy/10 rounded-xl font-bold text-navy hover:bg-navy/5 transition-all mb-8 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
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

        {/* divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-navy/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
            <span className="bg-white px-4 text-navy/20">or register with email</span>
          </div>
        </div>

        {/* form */}
        <form className="space-y-5" onSubmit={handleRegister}>
          {/* name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy/60 uppercase tracking-widest pl-1">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>

          {/* email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy/60 uppercase tracking-widest pl-1">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>

          {/* password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy/60 uppercase tracking-widest pl-1">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>

          {/* confirm password */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy/60 uppercase tracking-widest pl-1">
              Confirm password
            </label>
            <input
              id="register-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none font-medium text-navy/80"
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-14 bg-primary text-white rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-primary-deep transition-all shadow-lg shadow-primary/20 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-[10px] font-bold text-navy/20 uppercase tracking-widest">
          Secure encryption enabled
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
