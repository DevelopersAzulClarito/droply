import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Clock, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, role }        = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

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
        setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Dashboard listen error:', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, role]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40">Loading Dashboard...</p>
    </div>
  );

  const stats = [
    {
      label: 'Total Spent',
      value: `€${bookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0).toFixed(2)}`,
      icon: <CreditCard className="text-secondary" size={20} />,
    },
    { label: 'Saved Hours',    value: '12.5h',                   icon: <Clock   className="text-primary"   size={20} /> },
    { label: 'Total Bookings', value: bookings.length.toString(), icon: <Package className="text-secondary" size={20} /> },
  ];

  const activeBookings   = bookings.filter(b => b.bookingStatus !== 'delivered');
  const finishedBookings = bookings;

  return (
    <div className="min-h-screen bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-navy/40">Customer Dashboard</span>
          </div>
          <h1 className="text-5xl font-bold display text-navy">
            Welcome back, {user?.displayName?.split(' ')[0]}!
          </h1>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-soft border border-navy/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-3xl font-bold display text-navy">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold display text-navy">Active Transfers</h2>
                <Link to="/book" className="text-xs font-bold text-secondary hover:underline">New Booking</Link>
              </div>

              <div className="space-y-6">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => (
                    <ActiveBookingCard key={booking.id} booking={booking} />
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-navy/10 text-center">
                    <p className="text-navy/30 font-medium mb-6">No active transfers found.</p>
                    <Link
                      to="/book"
                      className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 inline-block"
                    >
                      Book Now
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold display text-navy mb-8">Booking History</h2>
              <div className="bg-white rounded-[2.5rem] shadow-soft border border-navy/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-navy/5 bg-surface/50">
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-navy/40">Reference</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-navy/40">Date</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-navy/40">Bags</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-navy/40">Status</th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-navy/40 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/5">
                      {finishedBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-surface/30 transition-colors">
                          <td className="px-8 py-6 font-bold text-navy text-sm uppercase tracking-tight">
                            {booking.bookingCode ?? '—'}
                          </td>
                          <td className="px-8 py-6 text-sm text-navy/60">
                            {format(booking.createdAt?.toDate?.() ?? new Date(), 'MMM d, yyyy')}
                          </td>
                          <td className="px-8 py-6 text-sm text-navy/60 font-bold">
                            {booking.numberOfBags} Items
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              booking.bookingStatus === 'delivered'  ? 'bg-green-100 text-green-700'   :
                              booking.bookingStatus === 'in_transit' ? 'bg-blue-100 text-blue-700'     :
                                                                       'bg-secondary/10 text-secondary'
                            }`}>
                              {(booking.bookingStatus ?? 'pending').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Link to={`/track/${booking.id}`} className="text-navy/20 hover:text-secondary transition-colors">
                              <ArrowRight size={18} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-[#0a121d] p-10 rounded-[2.5rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full" />
              <h3 className="text-xl font-bold display mb-6 italic">Your Impact</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Saved CO2 emission</p>
                  <p className="text-3xl font-bold display">14.2 kg</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">Sustainable Points</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold display text-primary">1,240</p>
                    <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-1 rounded">Silver Level</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10">
                <button className="w-full py-4 bg-secondary-soft/10 border border-secondary-soft/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary-soft/20 transition-all">
                  Redeem Rewards
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-navy/5 shadow-soft">
              <h3 className="text-lg font-bold text-navy mb-6">Service Status</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center text-navy/40">
                  <span>Malta Airport Hub</span>
                  <span className="text-green-500">Online</span>
                </div>
                <div className="flex justify-between items-center text-navy/40">
                  <span>Valletta Port Point</span>
                  <span className="text-green-500">Online</span>
                </div>
                <div className="flex justify-between items-center text-navy/40">
                  <span>Courier Availability</span>
                  <span className="text-primary font-bold">High</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const ActiveBookingCard: React.FC<{ booking: any }> = ({ booking }) => {
  const progress =
    booking.bookingStatus === 'delivered'  ? 100 :
    booking.bookingStatus === 'in_transit' ? 60  : 30;

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-navy/5 flex flex-col md:flex-row items-center gap-8">
      <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center text-secondary relative">
        <Package size={32} />
        {(booking.numberOfBags ?? 0) > 1 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {booking.numberOfBags}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-navy">
            {(booking.serviceType ?? '').replace(/_/g, ' ')}
          </h3>
          <span className="text-xs font-bold text-navy/40">Ref: {booking.bookingCode}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-navy/40">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-secondary"
            />
          </div>
        </div>

        {booking.dropoffLocation?.address && (
          <div className="flex items-center gap-2 text-xs font-medium text-navy/60">
            <MapPin size={14} className="text-secondary" />
            <span>To: {booking.dropoffLocation.address}</span>
          </div>
        )}
      </div>

      <Link
        to={`/track/${booking.id}`}
        className="w-full md:w-auto px-10 h-14 bg-surface text-navy rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-navy hover:text-white transition-all flex items-center justify-center"
      >
        View Details
      </Link>
    </div>
  );
};

export default Dashboard;
