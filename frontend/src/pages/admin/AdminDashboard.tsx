import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-24 px-6">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-stone-400 mb-2">
          {currentUser?.role} Panel
        </p>
        <h1 className="text-5xl font-bold tracking-tighter italic serif">
          Admin Dashboard
        </h1>
      </div>

      <div className="bg-white border border-dashed border-stone-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6">
        <ShieldCheck size={48} className="text-stone-300" />
        <div>
          <p className="text-lg font-bold text-stone-700">Signed in as <span className="italic">{currentUser?.name}</span></p>
          <p className="text-sm text-stone-400 mt-1">Role: <span className="font-mono font-bold">{currentUser?.role}</span></p>
        </div>
        <p className="text-sm text-stone-400 max-w-sm">
          This is a placeholder. The full admin panel (user management, trip assignment, analytics) will be built here.
        </p>
        <Link
          to="/"
          className="text-sm font-bold bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
