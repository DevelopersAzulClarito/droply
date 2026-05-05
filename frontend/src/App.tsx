import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorBoundary from './components/ErrorBoundary';

const Booking         = lazy(() => import('./pages/Booking'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const KeeperDashboard = lazy(() => import('./pages/keeper/KeeperDashboard'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));

const Spinner: React.FC = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
  </div>
);

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* ── Public ────────────────────────────────────────────────── */}
              <Route path="/"                    element={<Layout><Home /></Layout>} />
              <Route path="/book"                element={<Layout><Booking /></Layout>} />
              <Route path="/track/:bookingId?"   element={<Layout><Tracking /></Layout>} />
              <Route path="/login"               element={<Layout><Login /></Layout>} />
              <Route path="/register"            element={<Layout><Register /></Layout>} />

              {/* ── Customer ──────────────────────────────────────────────── */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Layout><Dashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* ── Keeper ────────────────────────────────────────────────── */}
              <Route path="/keeper" element={
                <ProtectedRoute allowedRoles={['keeper']}>
                  <KeeperDashboard />
                </ProtectedRoute>
              } />

              {/* ── Admin ─────────────────────────────────────────────────── */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* ── Fallback ──────────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
