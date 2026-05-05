import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Shield, Package, Search, MapPin } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden bg-surface">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="inline-block px-3 py-1 bg-secondary-soft/30 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-sm mb-6">
              Malta's #1 Luggage service
            </div>
            <h1 className="text-5xl md:text-7xl font-bold display text-navy leading-[1.1] mb-6">
              TRAVEL <span className="text-secondary">HANDS-FREE</span> <br />
              IN MALTA
            </h1>
            <p className="text-navy/60 text-lg mb-10 max-w-lg leading-relaxed">
              Say goodbye to heavy bags. We collect, store, and deliver your luggage across Malta while
              you explore the beauty of the Mediterranean. Seamless, secure, and stress-free.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/book"
                className="px-8 py-4 bg-primary text-white rounded-lg font-bold flex items-center gap-3 hover:bg-primary-deep transition-all shadow-lg shadow-primary/20"
              >
                Book Now <ArrowRight size={18} />
              </Link>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const code = (e.currentTarget.elements.namedItem('trackCode') as HTMLInputElement).value.trim();
                  if (code) navigate(`/track/${code.toUpperCase()}`);
                }}
              >
                <div className="relative">
                  <input
                    name="trackCode"
                    type="text"
                    placeholder="TRACKING CODE"
                    aria-label="Enter tracking code"
                    className="w-full pl-12 pr-6 py-4 border border-secondary text-secondary rounded-lg font-bold focus:bg-secondary/5 outline-none transition-all uppercase placeholder:text-secondary/40 min-w-[200px] sm:min-w-[240px]"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                    <Search size={18} />
                  </div>
                </div>
              </form>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[11, 12, 13].map((n) => (
                  <img
                    key={n}
                    src={`https://i.pravatar.cc/100?img=${n}`}
                    className="w-10 h-10 rounded-full border-2 border-surface"
                    alt={`Droply customer ${n - 10}`}
                  />
                ))}
                <div className="w-10 h-10 rounded-full bg-secondary-soft flex items-center justify-center text-[10px] font-bold text-secondary border-2 border-surface">
                  +1k
                </div>
              </div>
              <p className="text-xs text-navy/40 font-medium">
                Trusted by over 1,000+ travelers in Valletta &amp; St. Julian's
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069"
                alt="Traveler with luggage in Malta"
                className="w-full h-full object-cover"
              />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-4 rounded-2xl flex items-center gap-4 shadow-xl border border-white/40"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Securely Stored</p>
                  <p className="text-xs text-navy/60">Valletta Central Station • 2m ago</p>
                </div>
              </motion.div>
            </div>
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-secondary/10 blur-[100px] rounded-full -z-10" />
          </motion.div>
        </div>
      </section>

      {/* The Process Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold display text-navy mb-4">The Process</h2>
          <p className="text-navy/50">Three simple steps to unlock your freedom and enjoy your trip bag-free.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Package className="text-secondary" />,
              title: '1. Book Online',
              desc: 'Select your pickup and delivery points on our app. Instant confirmation via SMS.',
              bg: 'bg-secondary/10',
            },
            {
              icon: <Shield className="text-primary" />,
              title: '2. We Collect',
              desc: 'Our certified courier meets you at your location to collect and tag your luggage safely.',
              bg: 'bg-primary/10',
            },
            {
              icon: <MapPin className="text-secondary" />,
              title: '3. Delivered To You',
              desc: 'Enjoy your day! We deliver your bags to your final destination at the agreed time.',
              bg: 'bg-secondary/10',
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-10 bg-surface rounded-[2rem] border border-navy/5 shadow-soft transition-all"
            >
              <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-8`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold display text-navy mb-4">{step.title}</h3>
              <p className="text-sm text-navy/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Services */}
      <section className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold display text-navy mb-4">Our Services</h2>
            <p className="text-navy/50">Tailored logistics for every part of your journey across the island.</p>
          </div>
          <Link to="/book" className="text-sm font-bold text-navy hover:text-secondary flex items-center gap-2 group shrink-0">
            Explore all locations <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { img: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3', tag: 'Available 24/7',  title: 'Airport to Hotel' },
            { img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945', tag: 'Popular Choice',  title: 'Hotel to Airport' },
            { img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19', tag: 'Island Wide',       title: 'Inter-Hotel'     },
            { img: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e84', tag: 'Gozo & Comino',   title: 'Ferry Storage'   },
          ].map((service, i) => (
            <div key={i} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl cursor-pointer">
              <img
                src={`${service.img}?q=80&w=800`}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{service.tag}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6">{service.title}</h3>
                <Link
                  to="/book"
                  className="w-full py-3 bg-secondary text-white rounded-xl text-center text-xs font-bold block hover:bg-secondary/80 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-7xl mx-auto rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(243,146,0,1) 0%, rgba(139,80,0,1) 100%)' }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold display mb-8">
              Ready for your luggage-free journey?
            </h2>
            <p className="text-white/80 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of travelers who have rediscovered the joy of exploration without being weighed down.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/book"
                className="px-10 py-5 bg-primary text-white rounded-xl font-bold hover:bg-primary-deep transition-all shadow-2xl shadow-black/20"
              >
                Start My Booking
              </Link>
              <button
                type="button"
                className="px-10 py-5 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
              >
                Download App
              </button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
