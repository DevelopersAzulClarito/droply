import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar'; 

const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface text-navy font-sans">
      <Navbar />
      <main>{children ?? <Outlet />}</main>
      <footer className="bg-white border-t border-navy/5 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-white font-bold text-lg">D</div>
              <span className="text-2xl font-bold tracking-tighter display text-navy">Droply</span>
            </div>
            <p className="text-navy/50 text-sm leading-relaxed mb-6">
              Empowering travelers to move freely. Malta's premier luggage logistics network.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholder dots as in mockup */}
              <div className="w-8 h-8 rounded-full border border-navy/10 flex items-center justify-center text-navy/40 hover:text-secondary hover:border-secondary transition-all cursor-pointer">
                <span className="text-xs">●</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-navy/10 flex items-center justify-center text-navy/40 hover:text-secondary hover:border-secondary transition-all cursor-pointer">
                <span className="text-xs">●</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-navy/10 flex items-center justify-center text-navy/40 hover:text-secondary hover:border-secondary transition-all cursor-pointer">
                <span className="text-xs">●</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-6 text-navy">Company</h4>
            <ul className="space-y-3 text-sm text-navy/60">
              <li><a href="/about" className="hover:text-secondary transition-colors">About Us</a></li>
              <li><a href="/careers" className="hover:text-secondary transition-colors">Careers</a></li>
              <li><a href="/network" className="hover:text-secondary transition-colors">Our Network</a></li>
              <li><a href="/partners" className="hover:text-secondary transition-colors">Partnerships</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-6 text-navy">Support</h4>
            <ul className="space-y-3 text-sm text-navy/60">
              <li><a href="/contact" className="hover:text-secondary transition-colors">Contact Support</a></li>
              <li><a href="/help" className="hover:text-secondary transition-colors">Help Center</a></li>
              <li><a href="/safety" className="hover:text-secondary transition-colors">Safety & Security</a></li>
              <li><a href="/locations" className="hover:text-secondary transition-colors">Global Locations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-6 text-navy">Legal</h4>
            <ul className="space-y-3 text-sm text-navy/60">
              <li><a href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-secondary transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="hover:text-secondary transition-colors">Cookie Policy</a></li>
              <li><a href="/insurance" className="hover:text-secondary transition-colors">Insurance Info</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-navy/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-navy/40 uppercase tracking-widest font-bold">
          <div>© 2024 Droply Logistics. Freedom of movement.</div>
          <div className="flex gap-6">
            <span>VISA</span>
            <span>MC</span>
            <span>APAY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
