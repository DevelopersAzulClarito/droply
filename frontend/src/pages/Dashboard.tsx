import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Clock, CreditCard, MapPin, ArrowRight, ShieldCheck, Leaf } from 'lucide-react';
import { format } from 'date-fns';

// 1. Tipado estricto para las reservas
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

  useEffect(() => {
    if (!user || !role) return;

    let q;
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
      (error) => {
        console.error('Dashboard listen error:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, role]);

  // Pantalla de carga elegante
  if (loading) return (
    <div className="min-h-screen bg-[#f7faf9] flex flex-col items-center justify-center gap-6">
      <div className="w-14 h-14 border-4 border-[#006a62]/20 border-t-[#006a62] rounded-full animate-spin" />
      <p className="text-xs uppercase tracking-widest font-bold text-slate-400 animate-pulse">Loading Workspace...</p>
    </div>
  );

  const stats = [
    {
      label: 'Total Spent',
      value: `€${bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0).toFixed(2)}`,
      icon: <CreditCard className="text-[#006a62]" size={24} />,
      color: 'bg-[#78f7e8]/30'
    },
    { 
      label: 'Saved Hours',    
      value: '12.5h',                  
      icon: <Clock className="text-[#ff9800]" size={24} />,
      color: 'bg-[#ff9800]/20'
    },
    { 
      label: 'Total Bookings', 
      value: bookings.length.toString(), 
      icon: <Package className="text-[#006a62]" size={24} />,
      color: 'bg-[#006a62]/10'
    },
  ];

  const activeBookings   = bookings.filter(b => b.bookingStatus !== 'delivered');
  const finishedBookings = bookings;

  return (
    <div className="min-h-screen bg-[#f7faf9] py-24 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Animado */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ff9800] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
            Welcome back, <span className="text-[#006a62]">{user?.displayName?.split(' ')[0] || 'Traveler'}!</span>
          </h1>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-extrabold text-slate-800">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Active Transfers */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Active Transfers</h2>
                <Link to="/book" className="text-sm font-bold text-[#006a62] hover:text-[#ff9800] transition-colors flex items-center gap-1">
                  New Booking <ArrowRight size={16} />
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
                  <div className="bg-white p-12 rounded-[2rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ShieldCheck className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-500 font-medium mb-6">No active transfers right now.</p>
                    <Link
                      to="/book"
                      className="px-8 py-3 bg-[#ff9800] text-white rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-[#ff9800]/20 hover:scale-105 transition-transform"
                    >
                      Book a Collection
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Booking History */}
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-8">Booking History</h2>
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Reference</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bags</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {finishedBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-8 py-5 font-bold text-slate-800 text-sm uppercase tracking-tight">
                            {booking.bookingCode ?? '—'}
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500">
                            {booking.createdAt ? format(booking.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                            {booking.numberOfBags} Items
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              booking.bookingStatus === 'delivered'  ? 'bg-emerald-100 text-emerald-700'   :
                              booking.bookingStatus === 'in_transit' ? 'bg-blue-100 text-blue-700'     :
                                                                       'bg-slate-100 text-slate-600'
                            }`}>
                              {(booking.bookingStatus ?? 'pending').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <Link to={`/track/${booking.id}`} className="inline-flex text-slate-300 group-hover:text-[#006a62] transition-colors">
                              <ArrowRight size={20} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {finishedBookings.length === 0 && (
                         <tr>
                           <td colSpan={5} className="px-8 py-10 text-center text-sm text-slate-400">No past bookings found.</td>
                         </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Premium Impact Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#006a62] to-[#004d47] p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#78f7e8]/10 blur-[50px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#ff9800]/20 blur-[40px] rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold italic">Your Impact</h3>
                  <Leaf className="text-[#78f7e8] opacity-80" />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Saved CO2 emission</p>
                    <p className="text-4xl font-extrabold tracking-tight">14.2 <span className="text-xl text-[#78f7e8]">kg</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Sustainable Points</p>
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-extrabold text-[#ffb870]">1,240</p>
                      <span className="text-[10px] font-bold uppercase bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                        Silver Level
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-8 border-t border-white/10">
                  <button className="w-full py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all">
                    Redeem Rewards
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Service Status Widget */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Network Status
              </h3>
              <div className="space-y-5 text-sm font-medium">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Malta Airport Hub</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Valletta Port Point</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Courier Availability</span>
                  <span className="text-[#006a62] bg-[#006a62]/10 px-2 py-1 rounded text-xs font-bold">High</span>
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
  const progress =
    booking.bookingStatus === 'delivered'  ? 100 :
    booking.bookingStatus === 'in_transit' ? 60  : 30;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:border-[#78f7e8] transition-colors">
      <div className="w-20 h-20 bg-[#f4f7f6] rounded-2xl flex items-center justify-center text-[#006a62] relative shrink-0">
        <Package size={32} />
        {(booking.numberOfBags ?? 0) > 1 && (
          <span className="absolute -top-2 -right-2 bg-[#ff9800] text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {booking.numberOfBags}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h3 className="text-xl font-extrabold text-slate-800 capitalize">
            {(booking.serviceType ?? 'Standard Drop').replace(/_/g, ' ')}
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full w-fit">Ref: {booking.bookingCode}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>Transfer Progress</span>
            <span className="text-[#006a62]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#006a62] to-[#78f7e8]"
            />
          </div>
        </div>

        {booking.dropoffLocation?.address && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pt-2">
            <MapPin size={16} className="text-[#ff9800]" />
            <span>Dest: <strong className="text-slate-700">{booking.dropoffLocation.address}</strong></span>
          </div>
        )}
      </div>

      <Link
        to={`/track/${booking.id}`}
        className="w-full md:w-auto px-8 py-4 bg-[#006a62]/5 text-[#006a62] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#006a62] hover:text-white transition-all flex items-center justify-center shrink-0"
      >
        View Details
      </Link>
    </div>
  );
};

export default Dashboard; 