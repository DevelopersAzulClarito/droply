import React from 'react';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <Navbar />
      <main>{children}</main>
      <footer className="bg-stone-900 text-stone-100 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tighter mb-4 italic serif">Droply</h3>
            <p className="text-stone-400 text-sm">Luggage logistics for the modern traveler in Malta.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-stone-500">Service</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/book" className="hover:text-white transition-colors">Book Now</a></li>
              <li><a href="/track" className="hover:text-white transition-colors">Track Luggage</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-stone-500">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-semibold mb-4 text-stone-500">Support</h4>
            <p className="text-sm text-stone-400">support@droply.com.mt</p>
            <p className="text-sm text-stone-400">+356 1234 5678</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
          © 2026 Droply. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
