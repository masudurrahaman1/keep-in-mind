import { Search as SearchIcon, Users as Group, Plus, MoreVertical, Mail, Shield, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
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

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.authProvider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const deleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
       // Logic for backend delete
       setUsers(users.filter(u => u._id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-24 font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-display-metrics gradient-text mb-2"
          >
            User Management
          </motion.h1>
          <p className="text-sm md:text-body-lg text-on-surface-variant font-medium opacity-70">Manage ecosystem access and permissions.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link 
            to="/users/new" 
            className="bg-primary text-on-primary font-bold px-8 rounded-2xl h-14 flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20 whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            Provision User
          </Link>
        </motion.div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5 opacity-50" />
          <input 
            type="text" 
            placeholder="Search identity..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-6 glass border-outline-variant rounded-2xl font-medium text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-on-surface-variant/40 shadow-lg"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
           <button className="h-14 px-6 glass rounded-2xl font-bold text-sm hover:bg-surface-container transition-colors whitespace-nowrap">Role: All</button>
           <button className="h-14 px-6 glass rounded-2xl font-bold text-sm hover:bg-surface-container transition-colors whitespace-nowrap">Status: Active</button>
        </div>
      </div>

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
        ) : filteredUsers.map((user) => (
          <motion.div 
            key={user._id} 
            variants={item}
            className="glass p-4 md:p-6 rounded-[20px] md:rounded-[24px] flex items-center gap-4 md:gap-6 group hover:bg-surface-container/30 transition-all duration-300 cursor-default relative"
          >
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover shrink-0 border border-outline-variant shadow-lg" />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0 border border-primary/20">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface shadow-sm",
                user.isVerified ? 'bg-secondary' : 'bg-on-surface-variant'
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex flex-col mb-1">
                 <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors truncate whitespace-nowrap">{user.name}</h3>
                 <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-60">{user.authProvider} Identity</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-on-surface-variant opacity-60">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
               </div>
            </div>

            <div className="flex items-center gap-4 relative">
              <div className="hidden sm:flex flex-col items-end">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border",
                  user.isVerified ? 'text-secondary border-secondary/20 bg-secondary/5' : 'text-on-surface-variant border-outline-variant bg-surface-container'
                )}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </span>
                {user.lastActive && (
                  <span className="text-[9px] font-medium text-on-surface-variant opacity-40 mt-1 uppercase tracking-tighter">
                    Seen: {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                  className="p-3 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant"
                >
                   <MoreVertical className="w-5 h-5" />
                </button>
                
                {activeMenu === user._id && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-2xl border border-outline-variant shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                     <button className="w-full text-left p-3 hover:bg-primary/10 rounded-xl text-sm font-bold text-on-surface transition-colors flex items-center gap-3">
                        <Plus size={16} className="opacity-50" /> Update Role
                     </button>
                     <button 
                       onClick={() => deleteUser(user._id)}
                       className="w-full text-left p-3 hover:bg-error/10 rounded-xl text-sm font-bold text-error transition-colors flex items-center gap-3"
                     >
                        <MoreVertical size={16} className="opacity-50 rotate-90" /> Delete User
                     </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredUsers.length === 0 && !loading && (
          <div className="glass p-12 rounded-3xl text-center">
            <p className="text-on-surface-variant font-medium">No users match your current filters.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}


function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}


