import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import AuthGuard from '../components/guards/AuthGuard';
import RoleGuard from '../components/guards/RoleGuard';

// Public pages — eager (small, always needed on first load)
import Home from '../pages/Home';
import Login from '../pages/Login';
import Tracking from '../pages/Tracking';

// Role-specific pages — lazy (only loaded when the user has the right role)
const CustomerBooking  = lazy(() => import('../pages/Booking'));
const KeeperDashboard  = lazy(() => import('../pages/Dashboard'));
const AdminDashboard   = lazy(() => import('../pages/Dashboard')); // replace with real admin page

const Spinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>

            {/* ── Public ─────────────────────────────────────────────────── */}
            <Route element={<Layout />}>
              <Route path="/"                    element={<Home />} />
              <Route path="/login"               element={<Login />} />
              <Route path="/track/:bookingCode?" element={<Tracking />} />
            </Route>

            {/* ── Protected (auth required) ──────────────────────────────── */}
            <Route element={<AuthGuard />}>

              {/* Customer */}
              <Route element={<RoleGuard allowed={['customer']} />}>
                <Route element={<Layout />}>
                  <Route path="/booking"     element={<CustomerBooking />} />
                  <Route path="/my-bookings" element={<CustomerBooking />} /> {/* swap for MyBookings */}
                </Route>
              </Route>

              {/* Keeper */}
              <Route element={<RoleGuard allowed={['keeper']} />}>
                <Route element={<Layout />}>
                  <Route path="/keeper" element={<KeeperDashboard />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route element={<RoleGuard allowed={['admin']} />}>
                <Route element={<Layout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
              </Route>

            </Route>

            {/* ── Fallback ───────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
