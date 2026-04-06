import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Package, MapPin, CheckCircle2, Clock, Truck, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const Tracking: React.FC = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    const unsubBooking = onSnapshot(doc(db, 'bookings', bookingId), (doc) => {
      if (doc.exists()) {
        setBooking({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    const unsubEvents = onSnapshot(
      query(collection(db, `bookings/${bookingId}/trackingEvents`), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      unsubBooking();
      unsubEvents();
    };
  }, [bookingId]);

  if (loading) return <div className="p-24 text-center">Loading tracking data...</div>;

  if (!bookingId || !booking) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter mb-8 italic serif">Track Luggage</h1>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Enter Booking ID (e.g. DRP-ABC123)"
            className="w-full p-4 bg-white border border-stone-200 rounded-xl"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
          <Link 
            to={`/track/${searchId}`}
            className="block w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition-all"
          >
            Track Now
          </Link>
        </div>
      </div>
    );
  }

  const statusMap: any = {
    created: { label: 'Booking Created', icon: <Clock />, color: 'text-stone-400' },
    assigned: { label: 'Keeper Assigned', icon: <Package />, color: 'text-blue-500' },
    picked_up: { label: 'Picked Up', icon: <ShieldCheck />, color: 'text-orange-500' },
    in_transit: { label: 'In Transit', icon: <Truck />, color: 'text-purple-500' },
    delivered: { label: 'Delivered', icon: <CheckCircle2 />, color: 'text-green-500' },
  };

  const currentStatus = statusMap[booking.bookingStatus] || { label: booking.bookingStatus, icon: <Package />, color: 'text-stone-900' };

  return (
    <div className="max-w-4xl mx-auto py-24 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 mb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Booking ID</p>
                <h2 className="text-3xl font-bold tracking-tighter">{booking.bookingCode}</h2>
              </div>
              <div className={`flex items-center gap-2 font-bold ${currentStatus.color}`}>
                {currentStatus.icon}
                <span className="uppercase text-xs tracking-widest">{currentStatus.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-y border-stone-50">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Pickup</p>
                <p className="font-bold text-sm">{booking.pickupLocation.address}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Drop-off</p>
                <p className="font-bold text-sm">{booking.dropoffLocation.address}</p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                  <Package className="text-stone-400" />
                </div>
                <div>
                  <p className="font-bold">{booking.numberOfBags} Bags</p>
                  <p className="text-xs text-stone-400 uppercase tracking-widest">Standard Luggage</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="text-xl font-bold">€{booking.totalPrice}.00</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
            <h3 className="text-xl font-bold mb-8 italic serif">Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100">
              {events.length > 0 ? events.map((event, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-stone-900 rounded-full z-10" />
                  <p className="font-bold uppercase text-xs tracking-widest mb-1">{event.status.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-stone-500 mb-1">{event.location?.address || 'Location updated'}</p>
                  <p className="text-xs text-stone-400">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</p>
                </div>
              )) : (
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-white border-4 border-stone-200 rounded-full z-10" />
                  <p className="font-bold uppercase text-xs tracking-widest mb-1">Booking Created</p>
                  <p className="text-sm text-stone-500">System confirmed your request.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl">
            <h4 className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-4">Live Map</h4>
            <div className="aspect-square bg-stone-800 rounded-2xl flex items-center justify-center text-stone-600 border border-stone-700">
              <MapPin size={48} />
            </div>
            <p className="mt-4 text-sm text-stone-400 text-center italic">Map tracking active during transit.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-stone-100">
            <h4 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">Need Help?</h4>
            <button className="w-full bg-stone-100 text-stone-900 py-3 rounded-xl font-bold text-sm hover:bg-stone-200 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
