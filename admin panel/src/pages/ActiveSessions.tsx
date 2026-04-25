import { Laptop, Smartphone, Tablet, LogOut, Shield, MapPin, Globe, Clock, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService } from "../lib/api";
import { motion, AnimatePresence } from "motion/react";

interface Session {
  _id: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const data = await adminService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to terminate this session?")) return;
    try {
      await adminService.revokeSession(id);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) {
      alert("Failed to revoke session");
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "phone": return <Smartphone className="w-6 h-6" />;
      case "tablet": return <Tablet className="w-6 h-6" />;
      default: return <Laptop className="w-6 h-6" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full pt-4 space-y-10 pb-24 font-sans px-4">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-[14px] md:rounded-2xl flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-display-metrics gradient-text !md:text-4xl">Active Sessions</h1>
            <p className="text-xs md:text-body-sm text-on-surface-variant opacity-70">Monitor and manage access points.</p>
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center gap-3 h-14 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all">
          <LogOut className="w-5 h-5" />
          Terminate Other Sessions
        </button>
      </header>

      <section className="space-y-6">
        <h2 className="text-label-caps text-primary flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Primary Access Point
        </h2>
        
        {sessions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 md:p-8 rounded-[28px] md:rounded-[32px] border-primary/20 bg-primary/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center shrink-0 shadow-lg border border-outline-variant">
                {getDeviceIcon(sessions[0].device)}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <h3 className="text-xl md:text-h2 font-bold text-on-surface">{sessions[0].os} — {sessions[0].browser}</h3>
                  <span className="bg-secondary text-on-secondary text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Current Session</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{sessions[0].location || "San Francisco, CA"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{sessions[0].ip}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Started {formatTime(sessions[0].lastActive)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-label-caps text-on-surface-variant opacity-60">Authentication History</h2>
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {sessions.slice(1).map((session, index) => (
              <motion.div 
                key={session._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-4 md:p-6 rounded-[24px] md:rounded-3xl border border-outline-variant/30 flex flex-col sm:flex-row gap-4 md:gap-6 sm:items-center hover:bg-surface-container-low transition-all group"
              >
                <div className="flex gap-5 items-center flex-1">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-on-surface">{session.os} — {session.browser}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 text-xs font-medium text-on-surface-variant opacity-60">
                      <span className="flex items-center gap-1.5"><Monitor className="w-3 h-3" /> {session.ip}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Last used {formatTime(session.lastActive)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRevoke(session._id)}
                  className="h-11 px-6 rounded-xl border border-error/30 text-error font-bold text-sm hover:bg-error hover:text-on-error transition-all sm:w-auto active:scale-95 shadow-sm"
                >
                  Revoke
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {sessions.length <= 1 && (
            <div className="text-center py-12 glass rounded-3xl border-dashed border-outline-variant/50">
              <p className="text-on-surface-variant font-medium">No other active sessions detected.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
