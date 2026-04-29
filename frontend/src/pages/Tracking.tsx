import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy, where, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Package, CheckCircle2, Clock, Truck, ShieldCheck, Search } from 'lucide-react';
import { format } from 'date-fns';

const Tracking: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking]   = useState<any>(null);
  const [events, setEvents]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchId, setSearchId] = useState('');
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      setBooking(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubBooking = onSnapshot(
      doc(db, 'bookings', bookingId),
      (snapshot) => {
        if (snapshot.exists()) {
          setBooking({ id: snapshot.id, ...snapshot.data() });
          setLoading(false);
        } else {
          const q = query(
            collection(db, 'bookings'),
            where('bookingCode', '==', bookingId.toUpperCase()),
            limit(1),
          );

          onSnapshot(
            q,
            (querySnapshot) => {
              if (!querySnapshot.empty) {
                const foundDoc = querySnapshot.docs[0];
                setBooking({ id: foundDoc.id, ...foundDoc.data() });
                setLoading(false);
              } else {
                setBooking(null);
                setError('Booking not found. Ensure the code is exact.');
                setLoading(false);
              }
            },
            (err) => handleFirestoreError(err, OperationType.LIST, 'bookings'),
          );
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `bookings/${bookingId}`),
    );

    return () => unsubBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!booking?.id) return;

    const unsubEvents = onSnapshot(
      query(
        collection(db, `bookings/${booking.id}/trackingEvents`),
        orderBy('timestamp', 'desc'),
      ),
      (snapshot) => {
        setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `bookings/${booking.id}/trackingEvents`),
    );

    return () => unsubEvents();
  }, [booking?.id]);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40">Locating Package...</p>
    </div>
  );

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-soft border border-navy/5 text-center"
        >
          <div className="w-20 h-20 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary mx-auto mb-8">
            <Search size={32} />
          </div>
          <h1 className="text-3xl font-bold display text-navy mb-4">Track Your Bags</h1>
          <p className="text-navy/40 text-sm mb-10 leading-relaxed font-medium">
            Enter your unique booking reference to see real-time updates of your items.
          </p>

          <form onSubmit={handleSearch} className="space-y-6">
            <input
              type="text"
              placeholder="e.g. DL-1234"
              className="w-full h-14 px-6 bg-surface rounded-xl border border-navy/5 focus:border-secondary outline-none text-center font-bold tracking-widest uppercase text-navy"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            {error && (
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{error}</p>
            )}
            <button
              type="submit"
              className="w-full h-14 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-primary-deep transition-all shadow-lg shadow-primary/20"
            >
              Track Now
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { id: 'created',    label: 'Registered', icon: <Clock size={18} /> },
    { id: 'picked_up',  label: 'Collected',  icon: <Package size={18} /> },
    { id: 'in_transit', label: 'In Transit', icon: <Truck size={18} /> },
    { id: 'delivered',  label: 'Delivered',  icon: <CheckCircle2 size={18} /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === booking.bookingStatus);
  const activeIndex      = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="min-h-screen bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40">Live Tracking</span>
          </div>
          <h1 className="text-5xl font-bold display text-navy">Package Tracking</h1>
        </header>

        {/* Horizontal Progress */}
        <div className="bg-white p-12 rounded-[2.5rem] shadow-soft border border-navy/5 mb-12">
          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-navy/5 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-secondary -translate-y-1/2 -z-10 transition-all duration-1000"
              style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  i < activeIndex  ? 'bg-secondary text-white' :
                  i === activeIndex ? 'bg-white border-2 border-secondary text-secondary shadow-lg' :
                                      'bg-surface text-navy/20'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${i <= activeIndex ? 'text-navy' : 'text-navy/20'}`}>
                    {step.label}
                  </p>
                  {i === activeIndex && (
                    <p className="text-[9px] text-secondary font-bold uppercase mt-1 animate-pulse">In Progress</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Map/Status View */}
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-video bg-[#0a121d] rounded-[2.5rem] overflow-hidden relative border border-navy/5">
              <div className="absolute inset-0 opacity-40 mix-blend-luminosity grayscale">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                  alt="Malta Map"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />

              <div className="absolute bottom-10 left-10 p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20 flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white">
                  <Truck size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Last Update</p>
                  <p className="text-sm font-bold text-white">Valletta Logistics Hub • 2m ago</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-navy/5">
              <h3 className="text-xl font-bold display text-navy mb-8">Detailed History</h3>
              <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-navy/5">
                {events.length > 0 ? events.map((event, i) => (
                  <div key={event.id} className="relative pl-10">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm ${i === 0 ? 'bg-secondary' : 'bg-navy/10'}`} />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-sm font-bold uppercase tracking-tight ${i === 0 ? 'text-navy' : 'text-navy/40'}`}>
                          {(event.status ?? '').replace(/_/g, ' ')}
                        </h4>
                        <p className="text-xs text-navy/40 mt-1">{event.location?.address || 'Status updated'}</p>
                      </div>
                      <span className="text-[10px] font-bold text-navy/20 uppercase tracking-widest">
                        {format(event.timestamp?.toDate?.() ?? new Date(), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-secondary border-4 border-white shadow-sm" />
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-tight text-navy">Reservation Confirmed</h4>
                        <p className="text-xs text-navy/40 mt-1">Waiting for courier assignment</p>
                      </div>
                      <span className="text-[10px] font-bold text-navy/20 uppercase tracking-widest">JUST NOW</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Details */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-navy/5">
              <h3 className="text-lg font-bold text-navy mb-8">Booking Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">Booking Reference</p>
                  <p className="text-2xl font-bold display text-navy uppercase">{booking.bookingCode}</p>
                </div>
                <div className="h-px bg-navy/5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">Service Statistics</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl">
                      <p className="text-lg font-bold display text-navy">{booking.numberOfBags}</p>
                      <p className="text-[10px] font-bold text-navy/40 uppercase">Items</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl">
                      <p className="text-lg font-bold display text-navy">€{booking.totalPrice}</p>
                      <p className="text-[10px] font-bold text-navy/40 uppercase">Insured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary p-10 rounded-[2.5rem] text-white">
              <ShieldCheck className="mb-6 opacity-60" size={32} />
              <h3 className="text-xl font-bold display mb-4 italic">Platinum Care</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8 font-medium">
                Your items are covered by our premium insurance up to €1,500 and tracked via GPS 24/7.
              </p>
              <button className="w-full py-4 bg-white text-navy rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-navy hover:text-white transition-all">
                Support Center
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
