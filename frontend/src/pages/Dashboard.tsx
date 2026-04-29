import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, type Query, type DocumentData } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Clock, CreditCard, MapPin, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { formatDate, formatStatus, statusBadgeClass, getProgressFromStatus } from '../utils/formatters';

interface Booking {
  id: string;
  customerId: string;
  assignedKeeperId?: string;
  bookingStatus: 'pending' | 'in_transit' | 'stored' | 'delivered' | string;
  totalPrice?: number;
  numberOfBags?: number;
  serviceType?: string;
  bookingCode?: string;
  dropoffLocation?: { address: string };
  createdAt?: Timestamp;
}

const Dashboard: React.FC = () => {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !role) return;

    let q: Query<DocumentData>;
    if (role === 'customer') {
      q = query(collection(db, 'bookings'), where('customerId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else if (role === 'keeper') {
      q = query(collection(db, 'bookings'), where('assignedKeeperId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
        setLoading(false);
      },
      () => {
        setError('Failed to load bookings. Please refresh.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, role]);

  if (loading) return (
    <div className="min-h-screen bg-[#f7faf9] flex flex-col items-center justify-center gap-6 font-['Plus_Jakarta_Sans']">
      <div className="w-14 h-14 border-4 border-[#006a62]/20 border-t-[#006a62] rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest font-bold text-[#4f6073] animate-pulse">Loading Workspace...</p>
    </div>
  );

  const stats = [
    {
      label: 'Total Spent',
      value: `€${bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0).toFixed(2)}`,
      icon: <CreditCard size={32} />,
    },
    {
      label: 'Saved Hours',
      value: '12.5h',
      icon: <Clock size={32} />,
    },
    {
      label: 'Total Bookings',
      value: bookings.length.toString(),
      icon: <Package size={32} />,
    },
  ];

  const activeBookings = bookings.filter(b => b.bookingStatus !== 'delivered');

  return (
    <div className="min-h-screen bg-[#f7faf9] py-24 px-6 md:px-8 font-['Plus_Jakarta_Sans'] text-[#181c1c]">
      <div className="max-w-7xl mx-auto">

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="inline-block py-1 px-4 rounded-full bg-[#78f7e8] text-[#007168] text-xs font-bold uppercase tracking-widest mb-6">
            Customer Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#8b5000] tracking-tight leading-tight">
            Welcome back, <br className="md:hidden" /><span className="text-[#006a62]">{user?.displayName?.split(' ')[0] || 'Traveler'}!</span>
          </h1>
        </motion.header>

        {error && (
          <div className="mb-8 px-6 py-4 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-xl text-sm text-[#93000a] font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-white p-8 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] border border-[#006a62]/5 group hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-[#78f7e8]/30 rounded-2xl flex items-center justify-center mb-6 text-[#006a62] group-hover:bg-[#ff9800] group-hover:text-[#653900] transition-colors duration-300">
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-[#4f6073] uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="text-3xl font-bold text-[#181c1c]">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">

            <section>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#181c1c]">Active Transfers</h2>
                <Link
                  to="/book"
                  aria-label="Create new booking"
                  className="text-[#006a62] font-bold hover:translate-x-1 transition-transform flex items-center gap-1"
                >
                  New Booking <ArrowRight size={20} />
                </Link>
              </div>

              <div className="space-y-6">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={booking.id}
                    >
                      <ActiveBookingCard booking={booking} />
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] border border-[#006a62]/5 text-center flex flex-col items-center group hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 bg-[#78f7e8]/30 rounded-2xl flex items-center justify-center mb-6 text-[#006a62]">
                      <ShieldCheck size={32} />
                    </div>
                    <p className="text-[#4f6073] text-lg mb-8 leading-relaxed">You don't have any active transfers right now.</p>
                    <Link
                      to="/book"
                      className="bg-[#ff9800] text-[#653900] py-4 px-8 rounded-xl font-bold shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                      Book a Collection <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-[#181c1c] mb-8">Booking History</h2>
              <div className="bg-white rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] border border-[#006a62]/5 overflow-hidden hover:-translate-y-1 transition-transform duration-300">

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#e0e3e2] bg-[#f1f4f3]">
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Reference</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Date</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Bags</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-[#4f6073] text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e0e3e2]">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-[#f1f4f3]/50 transition-colors group">
                          <td className="px-8 py-6 font-bold text-[#181c1c] text-sm uppercase tracking-tight">
                            {booking.bookingCode ?? '—'}
                          </td>
                          <td className="px-8 py-6 text-sm text-[#4f6073]">
                            {formatDate(booking.createdAt)}
                          </td>
                          <td className="px-8 py-6 text-sm text-[#554434] font-bold">
                            {booking.numberOfBags} Items
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(booking.bookingStatus)}`}>
                              {formatStatus(booking.bookingStatus)}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Link
                              to={`/track/${booking.id}`}
                              aria-label={`Track booking ${booking.bookingCode ?? booking.id}`}
                              className="inline-flex text-[#a1b2c8] group-hover:text-[#ff9800] transition-colors"
                            >
                              <ArrowRight size={20} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-10 text-center text-sm text-[#4f6073]">No past bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-[#e0e3e2]">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-6 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-[#181c1c] text-sm uppercase tracking-tight truncate">
                          {booking.bookingCode ?? '—'}
                        </p>
                        <p className="text-xs text-[#4f6073]">{formatDate(booking.createdAt)} · {booking.numberOfBags} bags</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(booking.bookingStatus)}`}>
                          {formatStatus(booking.bookingStatus)}
                        </span>
                      </div>
                      <Link
                        to={`/track/${booking.id}`}
                        aria-label={`Track booking ${booking.bookingCode ?? booking.id}`}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-[#e0e3e2] text-[#a1b2c8] hover:text-[#ff9800] hover:border-[#ff9800] transition-colors"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="px-6 py-10 text-center text-sm text-[#4f6073]">No past bookings found.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#8b5000] p-10 md:p-12 rounded-[2.5rem] text-center relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)]"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff9800]/20 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#006a62]/20 rounded-full blur-3xl -ml-32 -mb-32" />

              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Leaf className="text-[#ff9800]" size={24} />
                  <h3 className="text-xl font-bold text-white">Your Impact</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">Saved CO2 emission</p>
                    <p className="text-5xl font-extrabold text-white tracking-tight">14.2 <span className="text-2xl text-[#ffdcbe]">kg</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-3">Sustainable Points</p>
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-4xl font-extrabold text-[#ff9800]">1,240</p>
                      <span className="text-[10px] font-bold uppercase bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 text-white">
                        Silver Level
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <button
                    type="button"
                    className="w-full py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Redeem Rewards
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] border border-[#006a62]/5 hover:-translate-y-2 transition-transform duration-300">
              <h3 className="text-lg font-bold text-[#181c1c] mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-[#006a62] rounded-full animate-pulse" />
                Network Status
              </h3>
              <div className="space-y-5 text-sm font-medium">
                <div className="flex justify-between items-center text-[#4f6073]">
                  <span>Malta Airport Hub</span>
                  <span className="text-[#006a62] bg-[#78f7e8]/30 px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">Online</span>
                </div>
                <div className="flex justify-between items-center text-[#4f6073]">
                  <span>Valletta Port Point</span>
                  <span className="text-[#006a62] bg-[#78f7e8]/30 px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">Online</span>
                </div>
                <div className="flex justify-between items-center text-[#4f6073]">
                  <span>Courier Availability</span>
                  <span className="text-[#8b5000] bg-[#ffdcbe] px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider">High</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const ActiveBookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const progress = getProgressFromStatus(booking.bookingStatus);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,128,128,0.15)] border border-[#006a62]/5 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:-translate-y-2 transition-all duration-300">

      <div className="w-16 h-16 bg-[#78f7e8]/30 rounded-2xl flex items-center justify-center text-[#006a62] group-hover:bg-[#ff9800] group-hover:text-[#653900] transition-colors relative shrink-0">
        <Package size={32} />
        {(booking.numberOfBags ?? 0) > 1 && (
          <span className="absolute -top-2 -right-2 bg-[#8b5000] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {booking.numberOfBags}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h3 className="text-2xl font-bold text-[#181c1c] capitalize">
            {(booking.serviceType ?? 'Standard Drop').replace(/_/g, ' ')}
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5000] bg-[#ffdcbe] px-4 py-1.5 rounded-full w-fit">
            Ref: {booking.bookingCode}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#4f6073]">
            <span>Transfer Progress</span>
            <span className="text-[#006a62]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#ebeeed] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-[#006a62]"
            />
          </div>
        </div>

        {booking.dropoffLocation?.address && (
          <div className="flex items-center gap-2 text-sm font-medium text-[#4f6073] pt-2">
            <MapPin size={18} className="text-[#ff9800]" />
            <span>To: <strong className="text-[#181c1c]">{booking.dropoffLocation.address}</strong></span>
          </div>
        )}
      </div>

      <Link
        to={`/track/${booking.id}`}
        aria-label={`View details for booking ${booking.bookingCode ?? booking.id}`}
        className="w-full md:w-auto px-8 py-4 border-2 border-[#006a62] text-[#006a62] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#006a62]/5 active:scale-95 transition-all flex items-center justify-center shrink-0"
      >
        View Details
      </Link>
    </div>
  );
};

export default Dashboard;
