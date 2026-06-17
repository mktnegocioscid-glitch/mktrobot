import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Redirect to login if not authenticated
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Redirect to /app/dashboard if not superadmin
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== 'superadmin') {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}

// Redirect to dashboard if already logged in
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);

  if (user) {
    return <Navigate to={user.role === 'superadmin' ? '/admin' : '/app/dashboard'} replace />;
  }
  return <>{children}</>;
}
