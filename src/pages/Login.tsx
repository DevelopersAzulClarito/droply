import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/my-bookings');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

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
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white border border-stone-200 py-4 rounded-xl font-bold hover:bg-stone-50 transition-all disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        <p className="mt-8 text-xs text-stone-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
