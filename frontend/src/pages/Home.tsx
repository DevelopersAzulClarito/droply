import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Clock, Map, Package } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center px-6 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              TRAVEL <br />
              <span className="italic serif font-light text-stone-400">HANDS-FREE</span> <br />
              IN MALTA.
            </h1>
            <p className="text-xl text-stone-400 max-w-md mb-10 leading-relaxed">
              Drop your bags at the airport, hotel, or port. We'll handle the rest while you explore the islands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/book" className="group bg-white text-stone-900 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-stone-200 transition-all">
                Book Now
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/track" className="px-8 py-4 rounded-full font-bold text-lg border border-stone-700 flex items-center justify-center hover:bg-stone-800 transition-all">
                Track My Bags
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2070&auto=format&fit=crop" 
              alt="Valletta, Malta" 
              className="rounded-3xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-10 -left-10 bg-white text-stone-900 p-8 rounded-2xl shadow-xl max-w-xs">
              <p className="text-sm font-medium uppercase tracking-widest text-stone-400 mb-2">Live Status</p>
              <p className="text-2xl font-bold tracking-tight">1,240+ Bags delivered today safely.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-stone-400 mb-4">The Process</h2>
              <h3 className="text-5xl font-bold tracking-tighter italic serif">Simple as 1, 2, 3.</h3>
            </div>
            <p className="text-stone-500 max-w-sm">We've optimized every step to ensure your luggage is safe and your hands are free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Clock size={32} />, title: "Book Online", desc: "Schedule your pickup and delivery points in seconds." },
              { icon: <Shield size={32} />, title: "Secure Seal", desc: "Your bags are sealed with unique security codes and photographed." },
              { icon: <Map size={32} />, title: "Real-time Tracking", desc: "Follow your luggage's journey across Malta in real-time." }
            ].map((step, i) => (
              <div key={i} className="group p-8 border border-stone-100 rounded-3xl hover:border-stone-900 transition-all duration-500">
                <div className="mb-6 text-stone-400 group-hover:text-stone-900 transition-colors">
                  {step.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4">{step.title}</h4>
                <p className="text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tighter mb-4">Our Services</h2>
            <p className="text-stone-500">Tailored logistics for every traveler.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Airport to Hotel",
              "Hotel to Airport",
              "Cruise Port to Hotel",
              "Point-to-Point Transfer"
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all">
                <Package className="mb-4 text-stone-400" />
                <h5 className="text-lg font-bold mb-2">{service}</h5>
                <p className="text-sm text-stone-500 mb-6">Reliable transport across all major locations in Malta.</p>
                <Link to="/book" className="text-sm font-bold underline underline-offset-4">Book this</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
