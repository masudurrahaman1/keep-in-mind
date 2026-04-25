import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useEffect, useState } from "react";

// Placeholder imports for pages we are about to create
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import Search from "./pages/Search";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";
import AuditLogs from "./pages/AuditLogs";
import ActiveSessions from "./pages/ActiveSessions";
import Terms from "./pages/Terms";
import UserDetails from "./pages/UserDetails";
import Explores from "./pages/Explores";

// Simple Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("admin_token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) return null; // Wait for initial check

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/insights" element={<Dashboard />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/users/new" element={<AddUser />} />
                  <Route path="/users/:id" element={<UserDetails />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/security/sessions" element={<ActiveSessions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/explores" element={<Explores />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/logs" element={<AuditLogs />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

