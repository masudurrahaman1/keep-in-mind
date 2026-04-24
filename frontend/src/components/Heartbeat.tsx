import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Heartbeat() {
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) return;

    const API_URL = import.meta.env.VITE_API_URL || "https://api.keepinmind.in/api";

    const sendPing = async () => {
      try {
        await fetch(`${API_URL}/auth/ping`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        // Silently fail, heartbeat is non-critical
        console.debug('Heartbeat failed');
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
