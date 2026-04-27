import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase';

const Navbar: React.FC = () => {
  const { user, role } = useAuth();

  const dashboardPath =
    role === 'admin' ? '/admin' : role === 'keeper' ? '/keeper' : '/my-bookings';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter italic serif">Droply</Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/booking" className="text-sm font-medium hover:text-stone-600 transition-colors">Book</Link>
          <Link to="/track" className="text-sm font-medium hover:text-stone-600 transition-colors">Track</Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to={dashboardPath}
                className="flex items-center space-x-2 text-sm font-medium bg-stone-900 text-white px-4 py-2 rounded-full hover:bg-stone-800 transition-all"
              >
                <User size={16} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium bg-stone-900 text-white px-6 py-2 rounded-full hover:bg-stone-800 transition-all"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
