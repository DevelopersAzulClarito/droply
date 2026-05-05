import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Users, LogOut, ChevronDown,
  MoreHorizontal, Search, X, Check, Truck,
} from 'lucide-react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { updateBookingStatus, assignKeeper as assignKeeperSvc } from '../../services/bookingService';
import type { Booking, User as AppUser, BookingStatus, UserRole } from '../../types';

// Types are imported from ../../types

/* ── helpers ──────────────────────────────────────────────────────────────── */
const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  picked_up:  'Picked Up',
  in_transit: 'In Transit',
  stored:     'Stored',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  picked_up:  'bg-purple-100 text-purple-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  stored:     'bg-orange-100 text-orange-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
};

const ROLE_COLORS: Record<UserRole, string> = {
  customer: 'bg-navy/10 text-navy/60',
  keeper:   'bg-primary/10 text-primary',
  admin:    'bg-secondary/10 text-secondary',
};

type Tab = 'bookings' | 'users';

/* ── component ────────────────────────────────────────────────────────────── */
const AdminDashboard: React.FC = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [tab, setTab]               = useState<Tab>('bookings');
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [users, setUsers]           = useState<AppUser[]>([]);
  const [keepers, setKeepers]       = useState<AppUser[]>([]);
  const [search, setSearch]         = useState('');
  const [loadingB, setLoadingB]     = useState(true);
  const [loadingU, setLoadingU]     = useState(true);

  /* dropdown state */
  const [statusOpen, setStatusOpen]   = useState<string | null>(null);
  const [keeperOpen, setKeeperOpen]   = useState<string | null>(null);
  const [roleOpen,   setRoleOpen]     = useState<string | null>(null);

  /* ── real-time bookings ─────────────────────────────────────────────────── */
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      setLoadingB(false);
    }, () => setLoadingB(false));
    return unsub;
  }, []);

  /* ── real-time users ────────────────────────────────────────────────────── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser));
      setUsers(all);
      setKeepers(all.filter(u => u.role === 'keeper' || u.role === 'admin'));
      setLoadingU(false);
    }, () => setLoadingU(false));
    return unsub;
  }, []);

  /* ── actions ────────────────────────────────────────────────────────────── */
  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    await updateBookingStatus(bookingId, status);
    setStatusOpen(null);
  };

  const assignKeeper = async (bookingId: string, keeper: AppUser) => {
    await assignKeeperSvc(bookingId, keeper.id);
    setKeeperOpen(null);
  };

  const updateRole = async (userId: string, role: UserRole) => {
    const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
    await updateDoc(firestoreDoc(db, 'users', userId), { role });
    setRoleOpen(null);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  /* ── filtered lists ─────────────────────────────────────────────────────── */
  const filteredBookings = bookings.filter(b =>
    !search ||
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase()) ||
    b.pickup?.toLowerCase().includes(search.toLowerCase()) ||
    b.bookingCode?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-surface">
      {/* ── sidebar ──────────────────────────────────────────────────────── */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-navy text-white flex flex-col z-40">
        {/* logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="text-lg font-bold tracking-tight">Droply</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Admin Panel</span>
        </div>

        {/* nav */}
        <nav className="flex-1 p-4 space-y-1">
          {([
            { id: 'bookings', label: 'Bookings',  icon: Package },
            { id: 'users',    label: 'Users',      icon: Users   },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSearch(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === id
                  ? 'bg-secondary text-white'
                  : 'text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* user info + logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
              {user?.displayName?.[0] ?? user?.email?.[0] ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.displayName ?? 'Admin'}</p>
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

      {/* ── main content ─────────────────────────────────────────────────── */}
      <main className="ml-64 p-8">
        {/* page header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] font-bold text-navy/30 mb-1">Admin</p>
          <h1 className="text-4xl font-bold display text-navy">
            {tab === 'bookings' ? 'Bookings' : 'User Management'}
          </h1>
        </motion.div>

        {/* search bar */}
        <div className="relative mb-6 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'bookings' ? 'Search bookings…' : 'Search users…'}
            className="w-full h-11 pl-10 pr-4 bg-white border border-navy/10 rounded-xl text-sm font-medium text-navy/80 outline-none focus:border-secondary"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy">
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── BOOKINGS TAB ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {tab === 'bookings' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {loadingB ? (
                <div className="flex justify-center py-24">
                  <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <EmptyState icon={Package} message="No bookings found." />
              ) : (
                <div className="bg-white rounded-2xl border border-navy/5 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-navy/5">
                        {['Customer', 'Route', 'Status', 'Keeper', 'Date', 'Actions'].map(h => (
                          <th key={h} className="text-left text-[10px] uppercase tracking-widest font-bold text-navy/30 px-5 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, i) => (
                        <tr
                          key={b.id}
                          className={`border-b border-navy/5 last:border-0 hover:bg-surface/60 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/30'}`}
                        >
                          {/* customer */}
                          <td className="px-5 py-4">
                            <p className="text-sm font-bold text-navy">{b.name ?? '—'}</p>
                            <p className="text-xs text-navy/40">{b.email ?? ''}</p>
                          </td>

                          {/* route */}
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="text-xs text-navy/60 truncate">{b.pickup ?? '—'}</p>
                            <p className="text-xs text-navy/30 truncate">→ {b.dropoff ?? '—'}</p>
                          </td>

                          {/* status dropdown */}
                          <td className="px-5 py-4">
                            <div className="relative">
                              <button
                                onClick={() => setStatusOpen(statusOpen === b.id ? null : b.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[b.status ?? 'pending']} hover:opacity-80 transition-opacity`}
                              >
                                {STATUS_LABELS[b.status ?? 'pending']}
                                <ChevronDown size={11} />
                              </button>
                              <AnimatePresence>
                                {statusOpen === b.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    className="absolute z-50 top-full mt-1 left-0 bg-white border border-navy/10 rounded-xl shadow-lg overflow-hidden min-w-[150px]"
                                  >
                                    {(Object.keys(STATUS_LABELS) as BookingStatus[]).map(s => (
                                      <button
                                        key={s}
                                        onClick={() => updateStatus(b.id, s)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold hover:bg-surface transition-colors ${b.status === s ? 'text-secondary' : 'text-navy/60'}`}
                                      >
                                        {STATUS_LABELS[s]}
                                        {b.status === s && <Check size={12} />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>

                          {/* keeper dropdown */}
                          <td className="px-5 py-4">
                            <div className="relative">
                              <button
                                onClick={() => setKeeperOpen(keeperOpen === b.id ? null : b.id)}
                                className="flex items-center gap-1.5 text-xs font-bold text-navy/50 hover:text-navy transition-colors"
                              >
                                <Truck size={12} />
                                {b.assignedKeeper
                                  ? (keepers.find(k => k.id === b.assignedKeeper)?.name ?? b.assignedKeeper)
                                  : 'Assign'}
                                <ChevronDown size={11} />
                              </button>
                              <AnimatePresence>
                                {keeperOpen === b.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    className="absolute z-50 top-full mt-1 left-0 bg-white border border-navy/10 rounded-xl shadow-lg overflow-hidden min-w-[180px]"
                                  >
                                    {keepers.length === 0 ? (
                                      <p className="px-4 py-3 text-xs text-navy/40">No keepers found</p>
                                    ) : (
                                      keepers.map(k => (
                                        <button
                                          key={k.id}
                                          onClick={() => assignKeeper(b.id, k)}
                                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold hover:bg-surface transition-colors ${b.assignedKeeper === k.id ? 'text-secondary' : 'text-navy/60'}`}
                                        >
                                          <span>{k.name ?? k.email ?? k.id}</span>
                                          {b.assignedKeeper === k.id && <Check size={12} />}
                                        </button>
                                      ))
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>

                          {/* date */}
                          <td className="px-5 py-4">
                            <p className="text-xs text-navy/40">
                              {b.createdAt?.seconds
                                ? new Date(b.createdAt.seconds * 1000).toLocaleDateString()
                                : '—'}
                            </p>
                          </td>

                          {/* placeholder for future detail action */}
                          <td className="px-5 py-4">
                            <button className="p-1.5 rounded-lg text-navy/30 hover:text-navy hover:bg-navy/5 transition-all">
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ── USERS TAB ──────────────────────────────────────────────── */}
          {tab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {loadingU ? (
                <div className="flex justify-center py-24">
                  <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <EmptyState icon={Users} message="No users found." />
              ) : (
                <div className="bg-white rounded-2xl border border-navy/5 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-navy/5">
                        {['User', 'Email', 'Role', 'Joined'].map(h => (
                          <th key={h} className="text-left text-[10px] uppercase tracking-widest font-bold text-navy/30 px-5 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <tr
                          key={u.id}
                          className={`border-b border-navy/5 last:border-0 hover:bg-surface/60 transition-colors ${i % 2 === 0 ? '' : 'bg-surface/30'}`}
                        >
                          {/* avatar + name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm shrink-0">
                                {(u.name ?? u.email ?? '?')[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-navy">{u.name ?? '—'}</span>
                            </div>
                          </td>

                          {/* email */}
                          <td className="px-5 py-4">
                            <p className="text-sm text-navy/50">{u.email ?? '—'}</p>
                          </td>

                          {/* role dropdown */}
                          <td className="px-5 py-4">
                            <div className="relative">
                              <button
                                onClick={() => setRoleOpen(roleOpen === u.id ? null : u.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${ROLE_COLORS[u.role]} hover:opacity-80 transition-opacity`}
                              >
                                {u.role}
                                <ChevronDown size={11} />
                              </button>
                              <AnimatePresence>
                                {roleOpen === u.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 4 }}
                                    className="absolute z-50 top-full mt-1 left-0 bg-white border border-navy/10 rounded-xl shadow-lg overflow-hidden min-w-[140px]"
                                  >
                                    {(['customer', 'keeper', 'admin'] as UserRole[]).map(r => (
                                      <button
                                        key={r}
                                        onClick={() => updateRole(u.id, r)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold hover:bg-surface transition-colors capitalize ${u.role === r ? 'text-secondary' : 'text-navy/60'}`}
                                      >
                                        {r}
                                        {u.role === r && <Check size={12} />}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>

                          {/* joined */}
                          <td className="px-5 py-4">
                            <p className="text-xs text-navy/40">
                              {u.createdAt?.seconds
                                ? new Date(u.createdAt.seconds * 1000).toLocaleDateString()
                                : '—'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* click-away to close dropdowns */}
      {(statusOpen || keeperOpen || roleOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setStatusOpen(null); setKeeperOpen(null); setRoleOpen(null); }}
        />
      )}
    </div>
  );
};

/* ── sub-component ─────────────────────────────────────────────────────────── */
const EmptyState: React.FC<{ icon: React.ElementType; message: string }> = ({ icon: Icon, message }) => (
  <div className="bg-white rounded-2xl border border-dashed border-navy/10 p-20 flex flex-col items-center justify-center gap-4 text-center">
    <Icon size={40} className="text-navy/15" />
    <p className="text-sm font-bold text-navy/30">{message}</p>
  </div>
);

export default AdminDashboard;
