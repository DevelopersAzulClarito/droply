import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../firebase';
import { LogOut, User, Package, MapPin } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className="nav-blur bg-white/70">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-white font-bold text-lg">D</div>
          <span className="text-2xl font-bold tracking-tighter display text-navy">Droply</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/book" className="text-sm font-medium text-navy hover:text-primary transition-colors relative group">
            Book Now
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link to="/track" className="text-sm font-medium text-navy hover:text-primary transition-colors">Track My Bags</Link>
          <Link to="/pricing" className="text-sm font-medium text-navy hover:text-primary transition-colors">Pricing</Link>
          <Link to="/about" className="text-sm font-medium text-navy hover:text-primary transition-colors">About Us</Link>
          
          {user ? (
            <Link to="/dashboard" className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-deep transition-all shadow-lg shadow-primary/10">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-deep transition-all shadow-lg shadow-primary/10">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
