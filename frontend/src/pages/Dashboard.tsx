import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Package, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

// ─── BookingCard ─────────────────────────────────────────────────────────────

interface BookingCardProps {
  booking: Record<string, any>;
  role: UserRole;
  currentUserId: string;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, role, currentUserId }) => {
  const updateStatus = async (newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { bookingStatus: newStatus });
      await addDoc(collection(db, `bookings/${booking.id}/trackingEvents`), {
        status:    newStatus,
        timestamp: serverTimestamp(),
        createdBy: currentUserId,
        location:  { address: 'Updated via Dashboard' },
      });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-stone-100 text-stone-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {booking.bookingCode}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {booking.createdAt?.toDate
                ? format(booking.createdAt.toDate(), 'MMM d, yyyy')
                : 'Recently'}
            </span>
          </div>
          <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">
            {booking.serviceType.replace(/_/g, ' ')}
          </h4>
          <div className="space-y-2 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-stone-300" />
              <span>{booking.pickupLocation.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-stone-300" />
              <span>{booking.dropoffLocation.address}</span>
            </div>
          </div>
        </div>

        <div className="md:w-48 flex flex-col justify-between items-end">
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tighter">€{booking.totalPrice}</p>
            <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
              {booking.bookingStatus.replace(/_/g, ' ')}
            </p>
          </div>

          {role === 'keeper' && booking.bookingStatus === 'assigned' && (
            <button
              onClick={() => updateStatus('picked_up')}
              className="w-full mt-4 bg-stone-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
            >
              Confirm Pickup
            </button>
          )}

          {role === 'keeper' && booking.bookingStatus === 'picked_up' && (
            <button
              onClick={() => updateStatus('delivered')}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all"
            >
              Mark Delivered
            </button>
          )}

          {role === 'customer' && (
            <Link
              to={`/track/${booking.id}`}
              className="w-full mt-4 bg-stone-100 text-stone-900 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center hover:bg-stone-200 transition-all"
            >
              Track Live
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const { id, role } = currentUser;
    let q;

    if (role === 'customer') {
      q = query(collection(db, 'bookings'), where('customerId', '==', id), orderBy('createdAt', 'desc'));
    } else if (role === 'keeper') {
      q = query(collection(db, 'bookings'), where('assignedKeeperId', '==', id), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  if (loading) return <div className="p-24 text-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-xs uppercase tracking-[0.3em] font-bold text-stone-400 mb-2">
            {currentUser?.role} Panel
          </h1>
          <h2 className="text-5xl font-bold tracking-tighter italic serif">
            Welcome, {currentUser?.name.split(' ')[0]}.
          </h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold">{bookings.length} Active Services</p>
          <p className="text-xs text-stone-400 uppercase tracking-widest">Current Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold mb-6">Recent Bookings</h3>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                role={currentUser!.role}
                currentUserId={currentUser!.id}
              />
            ))
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-200 text-center">
              <Package className="mx-auto text-stone-200 mb-4" size={48} />
              <p className="text-stone-400">No bookings found.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 text-white p-8 rounded-3xl">
            <h4 className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-6">Profile Stats</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Member Since</span>
                <span className="font-bold text-sm">March 2026</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Completed Services</span>
                <span className="font-bold text-sm">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Rating</span>
                <span className="font-bold text-sm">4.9 ★</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-100">
            <h4 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-6">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-stone-50 rounded-2xl text-center hover:bg-stone-100 transition-all">
                <MapPin className="mx-auto mb-2 text-stone-400" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Zones</span>
              </button>
              <button className="p-4 bg-stone-50 rounded-2xl text-center hover:bg-stone-100 transition-all">
                <AlertCircle className="mx-auto mb-2 text-stone-400" size={20} />
                <span className="text-xs font-bold uppercase tracking-widest">Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
