import { Search, ShieldAlert, UserCog, History, LogIn, Filter, Terminal, Cpu, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

import { adminService } from "../lib/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await adminService.getActivities();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);


  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 font-sans">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-display-metrics gradient-text mb-2"
          >
            Audit Logs
          </motion.h1>
          <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Immutable record of all ecosystem operations and security events.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-1.5 border border-outline-variant shadow-inner">
           <button className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20"><Terminal className="w-5 h-5" /></button>
           <button className="p-3 text-on-surface-variant hover:text-on-surface transition-all"><Cpu className="w-5 h-5" /></button>
           <button className="p-3 text-on-surface-variant hover:text-on-surface transition-all"><Globe className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-primary transition-colors opacity-50" />
            <input 
              type="text" 
              placeholder="Query logs by actor, event, or remote IP..." 
              className="w-full h-14 pl-14 pr-6 glass border-outline-variant rounded-2xl font-medium text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-on-surface-variant/40 shadow-lg"
            />
          </div>
          <button className="h-14 px-8 glass rounded-2xl font-bold flex items-center gap-3 hover:bg-surface-container transition-all">
            <Filter className="w-5 h-5 opacity-50" />
            Refine Search
          </button>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar space-x-3 pb-2">
          {["All Operations", "Security Protocol", "Access Control", "System Runtime"].map((filter, i) => (
             <button key={filter} className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${i === 0 ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" : "glass border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container"}`}>
               {filter}
             </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="h-60 flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, index) => {
               const Icon = log.title.includes('Login') ? LogIn : 
                           log.title.includes('Registration') ? UserCog : History;
               
               return (
                <motion.article 
                  key={log._id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass p-6 rounded-[24px] border border-outline-variant/30 hover:bg-surface-container/30 transition-all cursor-default group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex gap-5 flex-1 min-w-0">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110",
                        log.type === 'error' ? 'bg-error/20 text-error shadow-error/10' : 
                        log.type === 'warning' ? 'bg-accent-purple/20 text-accent-purple shadow-accent-purple/10' : 
                        log.type === 'success' ? 'bg-secondary/20 text-secondary shadow-secondary/10' : 
                        'bg-surface-container-highest text-on-surface-variant'
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">{log.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                           <span className="text-xs font-medium text-on-surface-variant opacity-60 flex items-center gap-1.5">
                              <UserCog className="w-3.5 h-3.5" />
                              {log.actor}
                           </span>
                           <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                             {new Date(log.createdAt).toLocaleString()}
                           </span>
                        </div>
                        {log.details && <p className="text-xs text-on-surface-variant/60 mt-2 italic">{log.details}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border",
                        log.type === 'error' ? 'bg-error/10 border-error/20 text-error' : 
                        log.type === 'warning' ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' : 
                        'bg-surface-container border-outline-variant text-on-surface-variant'
                      )}>
                        {log.level}
                      </span>
                    </div>
                  </div>
                </motion.article>
               );
            })}
          </AnimatePresence>
        )}
        
        {!loading && logs.length === 0 && (
          <div className="glass p-20 rounded-[32px] text-center border-dashed border-2 border-outline-variant">
             <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="text-on-surface-variant font-medium">System activity stream is currently empty.</p>
          </div>
        )}
      </div>


      <div className="mt-10 flex justify-center">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-10 py-4 glass rounded-2xl text-on-surface font-bold hover:text-primary transition-all shadow-xl active:shadow-inner"
        >
          Expand Log Archives
        </motion.button>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

