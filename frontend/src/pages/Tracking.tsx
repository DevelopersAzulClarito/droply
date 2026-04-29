import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc, onSnapshot, collection, query,
  orderBy, where, limit, getDocs,
} from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Package, CheckCircle2, Clock, Truck, ShieldCheck, Crosshair, HeadphonesIcon } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import type { FirestoreBooking, TrackingEvent } from '../types';

const Tracking: React.FC = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking]   = useState<FirestoreBooking | null>(null);
  const [events, setEvents]     = useState<TrackingEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchId, setSearchId] = useState('');
  const [error, setError]       = useState<string | null>(null);

  // ── Main booking subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Helper: search by human-readable booking code and redirect to real doc ID.
    // Using getDocs (one-time) avoids nested onSnapshot that leaks listeners.
    const searchByCode = (code: string) => {
      getDocs(
        query(
          collection(db, 'bookings'),
          where('bookingCode', '==', code.toUpperCase()),
          limit(1),
        ),
      )
        .then((snap) => {
          if (!snap.empty) {
            // Navigate to the actual Firestore doc ID so the next mount
            // subscribes to real-time updates on the correct document.
            navigate(`/track/${snap.docs[0].id}`, { replace: true });
          } else {
            setBooking(null);
            setError('Booking not found. Please verify your tracking code.');
            setLoading(false);
          }
        })
        .catch(() => {
          setError('Invalid tracking code or insufficient permissions.');
          setLoading(false);
        });
    };

    const unsubBooking = onSnapshot(
      doc(db, 'bookings', bookingId),
      (snapshot) => {
        if (snapshot.exists()) {
          setBooking({ id: snapshot.id, ...snapshot.data() } as FirestoreBooking);
          setLoading(false);
        } else {
          // Direct doc lookup returned nothing — try by booking code.
          searchByCode(bookingId);
        }
      },
      (err: FirestoreError) => {
        // permission-denied fires when: user is not logged in, the doc belongs
        // to someone else, or the ID looks valid but rules reject it.
        // Fall back to a code search before giving up.
        if (err.code === 'permission-denied' || err.code === 'unauthenticated') {
          searchByCode(bookingId);
        } else {
          setError('Could not load tracking information. Please try again.');
          setLoading(false);
        }
      },
    );

    return () => unsubBooking();
  }, [bookingId, navigate]);

  // ── Tracking events subscription ───────────────────────────────────────
  useEffect(() => {
    if (!booking?.id) return;

    const unsubEvents = onSnapshot(
      query(
        collection(db, `bookings/${booking.id}/trackingEvents`),
        orderBy('timestamp', 'desc'),
      ),
      (snapshot) => {
        setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrackingEvent)));
      },
      () => {
        // Non-critical: silently ignore tracking event errors
        setEvents([]);
      },
    );

    return () => unsubEvents();
  }, [booking?.id]);

  // ── Search form ────────────────────────────────────────────────────────
  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const code = searchId.trim();
    if (!code) {
      setError('Please enter a tracking code.');
      return;
    }
    setError(null);
    navigate(`/track/${code.toUpperCase()}`);
  };

  // ── Loading screen ─────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#f7faf9] flex flex-col items-center justify-center gap-6 font-['Plus_Jakarta_Sans']">
      <div className="w-14 h-14 border-4 border-[#006a62]/20 border-t-[#006a62] rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest font-bold text-[#4f6073] animate-pulse">
        Locating Package...
      </p>
    </div>
  );

  // ── Search / not-found view ────────────────────────────────────────────
  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen bg-[#f7faf9] flex items-center justify-center px-4 sm:px-6 font-['Plus_Jakarta_Sans'] pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white p-8 sm:p-10 md:p-14 rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,106,98,0.15)] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#006a62] to-[#ff9800]" />

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#181c1c] mb-4 tracking-tight">
            Track Luggage
          </h1>
          <p className="text-[#4f6073] text-sm mb-8 leading-relaxed">
            Real-time updates on your belongings. Freedom of movement starts with peace of mind.
          </p>

          <form onSubmit={handleSearch} className="space-y-5 text-left">
            <div className="space-y-2">
              <label htmlFor="trackSearch" className="text-xs font-bold text-[#181c1c] ml-1">
                Enter Booking ID or Code
              </label>
              <div className="relative">
                <input
                  id="trackSearch"
                  type="text"
                  placeholder="e.g. DL-8829"
                  className="w-full h-14 pl-12 pr-5 bg-white rounded-xl border border-[#e0e3e2] focus:border-[#006a62] focus:ring-2 focus:ring-[#006a62]/20 outline-none font-bold tracking-widest uppercase text-[#181c1c] placeholder:text-[#a1b2c8] transition-all"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006a62]" size={20} />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-widest text-center bg-[#ffdad6] py-2.5 px-4 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#ff9800] text-white rounded-xl font-bold text-lg hover:bg-[#e68a00] active:scale-95 transition-all shadow-[0_10px_20px_-5px_rgba(255,152,0,0.4)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Track Now <Crosshair size={20} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#f1f4f3] flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold text-[#4f6073] uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#006a62]" /> Securely Stored
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={15} className="text-[#ff9800]" /> Courier En Route
            </span>
            <span className="flex items-center gap-1.5">
              <HeadphonesIcon size={15} className="text-[#006a62]" /> 24/7 Live Support
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Tracking results view ──────────────────────────────────────────────
  const steps = [
    { id: 'created',    label: 'Registered', icon: <Clock size={20} /> },
    { id: 'picked_up',  label: 'Collected',  icon: <Package size={20} /> },
    { id: 'in_transit', label: 'In Transit', icon: <Truck size={20} /> },
    { id: 'delivered',  label: 'Delivered',  icon: <CheckCircle2 size={20} /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === booking.bookingStatus);
  const activeIndex      = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="min-h-screen bg-[#f7faf9] font-['Plus_Jakarta_Sans'] py-24 px-4 sm:px-6 md:px-8 text-[#181c1c]">
      <div className="max-w-7xl mx-auto">

        <header className="mb-12 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ff9800] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Live Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#181c1c] tracking-tight">
            Package Tracking
          </h1>
        </header>

        {/* Progress stepper */}
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,106,98,0.15)] border border-[#006a62]/5 mb-10">
          <div className="relative flex justify-between max-w-4xl mx-auto px-2 md:px-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-[#78f7e8]/40 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#006a62] -translate-y-1/2 z-0 transition-all duration-1000"
              style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col items-center gap-3 z-10 w-16 md:w-24">
                <div className={`w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                  i < activeIndex  ? 'bg-[#006a62] text-white shadow-md'                              :
                  i === activeIndex ? 'bg-white border-4 border-[#006a62] text-[#006a62] shadow-lg scale-110' :
                                      'bg-white border-2 border-[#78f7e8] text-[#a1b2c8]'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                    i <= activeIndex ? 'text-[#181c1c]' : 'text-[#a1b2c8]'
                  }`}>
                    {step.label}
                  </p>
                  {i === activeIndex && (
                    <p className="text-[8px] md:text-[9px] text-[#ff9800] font-bold uppercase mt-1 animate-pulse">
                      In Progress
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Main column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Map placeholder */}
            <div className="aspect-video bg-[#0a121d] rounded-[2rem] overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 opacity-50 mix-blend-luminosity grayscale">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                  alt="Malta map"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a121d] via-[#0a121d]/40 to-transparent" />
              <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-4">
                <div className="w-11 h-11 bg-[#ff9800] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <Truck size={22} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Last Update</p>
                  <p className="text-sm font-bold text-white">Valletta Logistics Hub · 2m ago</p>
                </div>
              </div>
            </div>

            {/* Event timeline */}
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,106,98,0.15)] border border-[#006a62]/5">
              <h3 className="text-xl sm:text-2xl font-bold text-[#181c1c] mb-8">Detailed History</h3>
              <div className="space-y-8 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#78f7e8]/50">

                {events.length > 0 ? events.map((event, i) => (
                  <div key={event.id} className="relative pl-12">
                    <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-4 border-white shadow-sm ${
                      i === 0 ? 'bg-[#ff9800]' : 'bg-[#e0e3e2]'
                    }`} />
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                      <div>
                        <h4 className={`text-sm font-bold uppercase tracking-tight ${
                          i === 0 ? 'text-[#181c1c]' : 'text-[#4f6073]'
                        }`}>
                          {(event.status ?? '').replace(/_/g, ' ')}
                        </h4>
                        <p className="text-xs text-[#4f6073] mt-1">
                          {event.location?.address || 'Status updated'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-[#a1b2c8] uppercase tracking-widest md:text-right shrink-0">
                        {formatDate(event.timestamp, 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="relative pl-12">
                    <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-[#006a62] border-4 border-white shadow-sm" />
                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-tight text-[#181c1c]">
                          Reservation Confirmed
                        </h4>
                        <p className="text-xs text-[#4f6073] mt-1">Waiting for courier assignment</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#006a62] uppercase tracking-widest">
                        JUST NOW
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Booking details card */}
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,106,98,0.15)] border border-[#006a62]/5">
              <h3 className="text-lg sm:text-xl font-bold text-[#181c1c] mb-7">Booking Details</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6073] mb-2">
                    Booking Reference
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#006a62] uppercase break-all">
                    {booking.bookingCode}
                  </p>
                </div>
                <div className="h-px bg-[#f1f4f3]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4f6073] mb-3">
                    Service Statistics
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f7faf9] p-4 rounded-xl border border-[#e0e3e2]">
                      <p className="text-xl font-extrabold text-[#181c1c]">{booking.numberOfBags}</p>
                      <p className="text-[10px] font-bold text-[#8b5000] uppercase mt-1">Items</p>
                    </div>
                    <div className="bg-[#f7faf9] p-4 rounded-xl border border-[#e0e3e2]">
                      <p className="text-xl font-extrabold text-[#181c1c]">€{booking.totalPrice}</p>
                      <p className="text-[10px] font-bold text-[#006a62] uppercase mt-1">Insured</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platinum care card */}
            <div className="bg-[#8b5000] p-8 sm:p-10 rounded-[2rem] text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff9800]/20 rounded-full blur-3xl -mr-24 -mt-24" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#006a62]/20 rounded-full blur-3xl -ml-24 -mb-24" />
              <div className="relative z-10 flex flex-col items-center">
                <ShieldCheck className="mb-5 text-[#ff9800]" size={34} />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Platinum Care</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-7">
                  Your items are covered by our premium insurance up to €1,500 and tracked via GPS 24/7.
                </p>
                <button
                  type="button"
                  className="w-full py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Support Center
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
