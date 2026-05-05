import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck, Package, LogOut, MapPin, User, Phone, Clock,
  CheckCircle, AlertCircle, Camera, ChevronRight,
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/* ── types ────────────────────────────────────────────────────────────────── */
type BookingStatus = 'confirmed' | 'picked_up' | 'in_transit' | 'delivered';

interface Booking {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  status: BookingStatus;
  notes?: string;
  createdAt?: { seconds: number } | null;
  weight?: string;
  packageType?: string;
}

/* ── status progression ───────────────────────────────────────────────────── */
const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus>> = {
  confirmed:  'picked_up',
  picked_up:  'in_transit',
  in_transit: 'delivered',
};

const NEXT_LABEL: Partial<Record<BookingStatus, string>> = {
  confirmed:  'Mark Picked Up',
  picked_up:  'Mark In Transit',
  in_transit: 'Mark Delivered',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed:  'bg-blue-50 text-blue-600 border-blue-100',
  picked_up:  'bg-purple-50 text-purple-600 border-purple-100',
  in_transit: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  delivered:  'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const STATUS_ICON: Record<BookingStatus, React.ReactNode> = {
  confirmed:  <AlertCircle size={14} />,
  picked_up:  <Package size={14} />,
  in_transit: <Truck size={14} />,
  delivered:  <CheckCircle size={14} />,
};

/* ── component ────────────────────────────────────────────────────────────── */
const KeeperDashboard: React.FC = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [selected, setSelected]   = useState<Booking | null>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState<string | null>(null);

  /* ── real-time: bookings assigned to this keeper ──────────────────────── */
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'bookings'),
      where('keeperId', '==', user.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      setBookings(docs);
      setLoading(false);
      // keep selected in sync
      if (selected) {
        const updated = docs.find(d => d.id === selected.id);
        if (updated) setSelected(updated);
      }
    }, () => setLoading(false));
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ── actions ────────────────────────────────────────────────────────────── */
  const advanceStatus = async (booking: Booking) => {
    const next = NEXT_STATUS[booking.status];
    if (!next) return;
    setUpdating(booking.id);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status:    next,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  /* ── split bookings ─────────────────────────────────────────────────────── */
  const active    = bookings.filter(b => b.status !== 'delivered');
  const completed = bookings.filter(b => b.status === 'delivered');

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed top-0 left-0 h-full w-72 bg-navy text-white flex flex-col z-40">
        {/* logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="text-lg font-bold tracking-tight">Droply</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Keeper Panel</span>
        </div>

        {/* stats */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Active',    value: active.length,    color: 'text-primary' },
            { label: 'Delivered', value: completed.length, color: 'text-secondary' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* task list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 px-2 py-3">
            Your Tasks
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-secondary/40 border-t-secondary rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-xs text-white/30 px-2 py-4">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-1">
              {bookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all ${
                    selected?.id === b.id
                      ? 'bg-secondary/20 border border-secondary/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-white truncate pr-2">
                      {b.customerName ?? 'Customer'}
                    </p>
                    <ChevronRight size={12} className="text-white/30 shrink-0" />
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{b.pickupAddress ?? '—'}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${STATUS_COLORS[b.status ?? 'confirmed']}`}>
                    {STATUS_ICON[b.status ?? 'confirmed']}
                    {b.status?.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* user + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.displayName?.[0] ?? user?.email?.[0] ?? 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.displayName ?? 'Keeper'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── main ─────────────────────────────────────────────────────────── */}
      <main className="ml-72 flex-1 p-8">
        <AnimatePresence mode="wait">
          {!selected ? (
            /* ── empty / welcome state ─────────────────────────────────── */
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-white border border-navy/5 flex items-center justify-center mb-6 shadow-soft">
                <Truck size={36} className="text-navy/20" />
              </div>
              <h2 className="text-2xl font-bold display text-navy mb-2">
                {bookings.length === 0 ? 'No tasks yet' : 'Select a task'}
              </h2>
              <p className="text-sm text-navy/40 max-w-xs">
                {bookings.length === 0
                  ? 'You have no bookings assigned. Check back soon.'
                  : 'Pick a booking from the sidebar to see the details and update its status.'}
              </p>
            </motion.div>
          ) : (
            /* ── booking detail ────────────────────────────────────────── */
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="max-w-2xl"
            >
              {/* header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] font-bold text-navy/30 mb-1">Task Detail</p>
                  <h1 className="text-4xl font-bold display text-navy">
                    {selected.customerName ?? 'Booking'}
                  </h1>
                </div>
                <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border ${STATUS_COLORS[selected.status ?? 'confirmed']}`}>
                  {STATUS_ICON[selected.status ?? 'confirmed']}
                  {selected.status?.replace('_', ' ')}
                </span>
              </div>

              {/* info cards */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* customer */}
                <InfoCard title="Customer Info" icon={<User size={16} />}>
                  <Row label="Name"  value={selected.customerName  ?? '—'} />
                  <Row label="Email" value={selected.customerEmail ?? '—'} />
                  {selected.customerPhone && <Row label="Phone" value={selected.customerPhone} />}
                </InfoCard>

                {/* route */}
                <InfoCard title="Trip Details" icon={<MapPin size={16} />}>
                  <Row label="Pickup"   value={selected.pickupAddress   ?? '—'} />
                  <Row label="Delivery" value={selected.deliveryAddress ?? '—'} />
                  {selected.packageType && <Row label="Package" value={selected.packageType} />}
                  {selected.weight      && <Row label="Weight"  value={selected.weight} />}
                  {selected.notes       && <Row label="Notes"   value={selected.notes} />}
                </InfoCard>

                {/* timing */}
                <InfoCard title="Timing" icon={<Clock size={16} />}>
                  <Row
                    label="Requested"
                    value={selected.createdAt?.seconds
                      ? new Date(selected.createdAt.seconds * 1000).toLocaleString()
                      : '—'}
                  />
                </InfoCard>
              </div>

              {/* action buttons */}
              <div className="flex gap-3 flex-wrap">
                {NEXT_STATUS[selected.status] && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => advanceStatus(selected)}
                    disabled={updating === selected.id}
                    className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-bold text-sm hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updating === selected.id ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Updating…
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        {NEXT_LABEL[selected.status]}
                      </>
                    )}
                  </motion.button>
                )}

                {/* Upload photo placeholder */}
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-navy/10 text-navy rounded-xl font-bold text-sm hover:bg-navy/5 transition-all"
                  onClick={() => alert('Photo upload coming soon!')}
                >
                  <Camera size={16} />
                  Upload Photo
                </button>
              </div>

              {selected.status === 'delivered' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl"
                >
                  <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-emerald-700">
                    Delivery completed! Great job.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ── sub-components ────────────────────────────────────────────────────────── */
const InfoCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-navy/5 p-5">
    <div className="flex items-center gap-2 mb-4 text-navy/40">
      {icon}
      <p className="text-xs font-bold uppercase tracking-widest">{title}</p>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-xs text-navy/30 font-bold w-20 shrink-0">{label}</span>
    <span className="text-sm font-medium text-navy/80">{value}</span>
  </div>
);

export default KeeperDashboard;
