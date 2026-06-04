import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLoader from './AppLoader';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface bg-mesh flex flex-col items-center justify-center gap-8">
        <AppLoader />
        <p className="text-on-surface-variant text-sm font-medium">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
