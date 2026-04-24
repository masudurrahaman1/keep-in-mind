/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Heartbeat from './components/Heartbeat';


// Standard import for Auth (since it's the initial entry for logged-out users)
import Auth from './pages/Auth';

// Lazy-loaded routes for performance (Req #13)
const Notes = lazy(() => import('./pages/Notes'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Account = lazy(() => import('./pages/Account'));
const Labels = lazy(() => import('./pages/Labels'));
const Archive = lazy(() => import('./pages/Archive'));
const Explore = lazy(() => import('./pages/Explore'));
const Recent = lazy(() => import('./pages/Recent'));
const Settings = lazy(() => import('./pages/Settings'));
const Drawing = lazy(() => import('./pages/Drawing'));
const Editor  = lazy(() => import('./pages/Editor'));

// ── Guard: redirect to /notes if already signed in ─────────
function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Let the context or parent handle initial load
  return user ? <Navigate to="/notes" replace /> : <>{children}</>;
}

// Fallback loader for lazy components
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Heartbeat />
      <Routes>

        {/* Public: login page — redirects to /notes if already signed in */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* Private: App pages WITH global layout (sidebar, topbar, bottomnav) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/notes" replace />} />
          <Route path="notes"    element={<Suspense fallback={<PageLoader />}><Notes /></Suspense>}   />
          <Route path="gallery"  element={<Suspense fallback={<PageLoader />}><Gallery /></Suspense>} />
          <Route path="labels"   element={<Suspense fallback={<PageLoader />}><Labels /></Suspense>}  />
          <Route path="archive"  element={<Suspense fallback={<PageLoader />}><Archive /></Suspense>} />
          <Route path="account"  element={<Suspense fallback={<PageLoader />}><Account /></Suspense>} />
          <Route path="explore"  element={<Suspense fallback={<PageLoader />}><Explore /></Suspense>} />
          <Route path="recent"   element={<Suspense fallback={<PageLoader />}><Recent /></Suspense>}  />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>}/>
        </Route>

        {/* Private: Full-screen / Immersive views WITHOUT global layout */}
        <Route path="/drawing" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Drawing /></Suspense></ProtectedRoute>} />
        <Route path="/drawing/:id" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Drawing /></Suspense></ProtectedRoute>} />
        <Route path="/editor"      element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Editor /></Suspense></ProtectedRoute>}  />
        <Route path="/editor/:id"  element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Editor /></Suspense></ProtectedRoute>}  />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}
