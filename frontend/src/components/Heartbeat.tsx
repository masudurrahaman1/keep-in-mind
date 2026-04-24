import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Heartbeat() {
  // Safer access to auth context (only if we are not on admin domain)
  const isMainDomain = !window.location.hostname.includes('admin.');
  let userToken = null;
  
  try {
    if (isMainDomain) {
      const auth = useAuth();
      userToken = auth.token;
    }
  } catch (e) {
    // Ignore context errors in admin app
  }


  useEffect(() => {
    // Determine which token to use
    // If we are in the admin portal, we might not have AuthContext user, but we have admin_token
    const adminToken = localStorage.getItem("admin_token");
    const activeToken = userToken || adminToken;

    if (!activeToken) return;

    const API_URL = import.meta.env.VITE_API_URL || "https://api.keepinmind.in/api";

    const sendPing = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/ping`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
           console.debug('Heartbeat rejected:', res.status);
        }
      } catch (err) {
        console.debug('Heartbeat network error');
      }
    };


    // Ping immediately on mount
    sendPing();

    // Ping every 2 minutes
    const interval = setInterval(sendPing, 120000);

    return () => clearInterval(interval);
  }, [user, token]);

  return null; // Invisible component
}
