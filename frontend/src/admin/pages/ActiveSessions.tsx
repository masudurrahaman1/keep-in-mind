import { Laptop, Smartphone, Tablet, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { adminService } from "../lib/api";
import { motion } from "motion/react";

export default function ActiveSessions() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await adminService.getProfile();
        setAdmin(data);
      } catch (err) {
        console.error("Failed to load session info:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 font-sans">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-display-metrics gradient-text mb-2"
          >
            Active Sessions
          </motion.h1>
          <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Monitor and manage all active access points to the executive core.</p>
        </div>
        <button className="h-14 bg-primary text-on-primary font-bold px-8 rounded-2xl flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20">
          <LogOut className="w-5 h-5" />
          Terminate Other Sessions
        </button>
      </header>

      <section className="space-y-6">
        <h2 className="text-label-caps font-bold text-on-surface-variant uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           <div className="w-1.5 h-4 bg-primary rounded-full" />
           Primary Access Point
        </h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[32px] border border-primary/20 bg-primary/5 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="w-20 h-20 rounded-3xl bg-primary text-on-primary flex items-center justify-center shadow-2xl relative z-10">
             <Laptop className="w-10 h-10" />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
             <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                <h3 className="text-2xl font-bold text-on-surface">{admin?.name || "Executive Admin"}</h3>
                <span className="bg-secondary text-on-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3" />
                   Active Now
                </span>
             </div>
             <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 text-on-surface-variant opacity-60 font-medium">
                <span className="flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 opacity-40" />
                   {admin?.email}
                </span>
                <span className="hidden md:block w-1 h-1 rounded-full bg-on-surface-variant/30"></span>
                <span>Production Environment</span>
             </div>
          </div>
          
          <div className="px-6 py-3 glass rounded-2xl border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
             System Instance #842
          </div>
        </motion.div>
      </section>

      <section className="space-y-6">
        <h2 className="text-label-caps font-bold text-on-surface-variant uppercase tracking-[0.2em] px-2">External Access nodes</h2>
        <div className="glass p-16 rounded-[32px] border border-outline-variant/30 text-center">
           <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
              <Smartphone className="w-8 h-8 text-on-surface-variant" />
           </div>
           <p className="text-on-surface-variant font-medium opacity-60">No secondary or unauthorized sessions detected at this time.</p>
        </div>
      </section>
    </div>
  );
}

