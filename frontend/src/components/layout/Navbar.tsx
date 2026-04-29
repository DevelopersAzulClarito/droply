import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
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
  ];

  return (
    <nav className="nav-blur">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-white font-bold text-lg">
            D
          </div>
          <span className="text-2xl font-bold tracking-tighter display text-navy">Droply</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-navy hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={dashboardHref}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-deep transition-all shadow-lg shadow-primary/10"
              >
                {dashboardLabel}
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2.5 text-navy/40 hover:text-primary transition-colors rounded-lg hover:bg-navy/5"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-deep transition-all shadow-lg shadow-primary/10"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden p-2 rounded-lg text-navy hover:bg-navy/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-navy/5 bg-white/95 backdrop-blur-xl px-6 py-6 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-navy hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-navy/5 space-y-3">
            {user ? (
              <>
                <Link
                  to={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="block text-center py-3 px-6 bg-primary text-white rounded-xl font-bold text-sm"
                >
                  {dashboardLabel}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-navy/50 hover:text-primary transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center py-3 px-6 bg-primary text-white rounded-xl font-bold text-sm"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
