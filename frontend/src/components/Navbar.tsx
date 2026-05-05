import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    setMenuOpen(false);
    navigate('/login');
  };

  const dashboardHref =
    role === 'admin'  ? '/admin'     :
    role === 'keeper' ? '/keeper'    :
                        '/dashboard';

  const dashboardLabel =
    role === 'admin'  ? 'Admin Panel'   :
    role === 'keeper' ? 'Keeper Panel'  :
                        'Dashboard';

  const navLinks = [
    { to: '/book',  label: 'Book Now'      },
    { to: '/track', label: 'Track My Bags' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About Us' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f4f7f6]/90 backdrop-blur-md border-b border-teal-500/10 shadow-sm">
      <nav className="flex justify-between items-center px-6 md:px-8 h-20 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <img 
            alt="Droply Logo" 
            className="h-10 w-auto" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3zLpVpisos20aP2ALB45ges-hmUO88--dwaUdi7hIUZjR3yzFFWmEb8QJh502h2qZZz7v-TPuCRlQlAT3qLFZkjNt3VhZtY2m_-f0gdHhxb4VunvYodUMoz6pU9lRsqJpouuZXA1lq3mZ-opecZZQChW3IS6xFJerUWpcdIcpHvN1sZcXTkqluyAnxUn3_9dO2Pluv_MpbfckW5jB1R3TVyoBk2uTin0lF8Omm4feqyC6TKWLzd7NcIiMHmcnVBAiWPJIXyxqqik"
          />
          <span className="text-2xl font-black text-[#008080]">Droply</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 font-bold text-sm tracking-tight">
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={
                  isActive 
                    ? "text-[#ff9800] border-b-2 border-[#ff9800] pb-1 hover:scale-105 transition-transform" 
                    : "text-slate-600 hover:text-[#ff9800] transition-colors duration-200"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={dashboardHref}
                className="bg-[#008080] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                {dashboardLabel}
              </Link>
              <button
                onClick={handleSignOut}
                aria-label="Sign out"
                className="p-2.5 text-slate-400 hover:text-[#ba1a1a] transition-colors rounded-full hover:bg-slate-100"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-[#ff9800] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full md:hidden border-b border-teal-500/10 bg-white/95 backdrop-blur-xl px-6 py-6 shadow-xl">
          <div className="flex flex-col space-y-4">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`py-2 text-sm font-bold ${isActive ? 'text-[#ff9800]' : 'text-slate-600 hover:text-[#ff9800]'}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
              {user ? (
                <>
                  <Link
                    to={dashboardHref}
                    onClick={() => setMenuOpen(false)}
                    className="block text-center py-3 px-6 bg-[#008080] text-white rounded-xl font-bold text-sm shadow-md hover:brightness-110"
                  >
                    {dashboardLabel}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-slate-500 hover:text-[#ba1a1a] transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center py-3 px-6 bg-[#ff9800] text-white rounded-xl font-bold text-sm shadow-md hover:brightness-110"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;