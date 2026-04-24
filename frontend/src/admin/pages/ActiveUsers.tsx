import { Users as Group, Mail, ArrowLeft, Activity, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { adminService } from "../lib/api";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ActiveUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getActiveUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load active users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-24 font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-primary font-bold mb-4 hover:gap-3 transition-all"
           >
             <ArrowLeft size={20} /> Back to Dashboard
           </button>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-display-metrics gradient-text mb-2"
          >
            Live Sessions
          </motion.h1>
          <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Showing users currently interacting with the Keep In Mind ecosystem.</p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/10 px-6 py-3 rounded-2xl border border-secondary/20">
           <Activity className="w-5 h-5 text-secondary animate-pulse" />
           <span className="text-secondary font-bold text-sm uppercase tracking-widest">{users.length} Active Now</span>
        </div>
      </header>

      {/* List */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : users.map((user) => (
          <motion.div 
            key={user._id} 
            variants={item}
            className="glass p-6 rounded-[24px] flex items-center gap-6 group hover:bg-surface-container/30 transition-all duration-300 cursor-default"
          >
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-outline-variant shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/20">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary border-2 border-surface shadow-[0_0_8px_var(--color-secondary)] animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-hidden">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{user.name}</h3>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">{user.authProvider} • Connected</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-on-surface-variant opacity-60">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">In Session</span>
                <span className="text-[9px] font-medium text-on-surface-variant opacity-50">Updated: {new Date(user.updatedAt).toLocaleTimeString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <Shield size={18} />
              </div>
            </div>
          </motion.div>
        ))}
        
        {users.length === 0 && !loading && (
          <div className="glass p-12 rounded-3xl text-center border-dashed border-2 border-outline-variant">
            <Activity className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-20" />
            <p className="text-on-surface-variant font-medium">No live sessions detected at this moment.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
