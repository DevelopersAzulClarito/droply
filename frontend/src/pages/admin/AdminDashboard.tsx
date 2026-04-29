import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-24 px-6">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-navy/40 mb-2">
          {role} Panel
        </p>
        <h1 className="text-5xl font-bold display text-navy">Admin Dashboard</h1>
      </div>

      <div className="bg-white border border-dashed border-navy/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center gap-6">
        <ShieldCheck size={48} className="text-navy/20" />
        <div>
          <p className="text-lg font-bold text-navy">
            Signed in as <span className="italic text-secondary">{user?.displayName}</span>
          </p>
          <p className="text-sm text-navy/40 mt-1">
            Role: <span className="font-mono font-bold text-primary">{role}</span>
          </p>
        </div>
        <p className="text-sm text-navy/40 max-w-sm leading-relaxed">
          This is a placeholder. The full admin panel (user management, trip assignment, analytics) will be built here.
        </p>
        <Link
          to="/"
          className="text-sm font-bold bg-navy text-white px-6 py-3 rounded-xl hover:bg-primary transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
