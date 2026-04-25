import { Search as SearchIcon, Users as Group, Plus, MoreVertical, Mail, Shield, UserCheck, History } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Skeleton, CardSkeleton, TableRowSkeleton } from "../components/Skeleton";

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
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, statsData] = await Promise.all([
          adminService.getUsers(),
          adminService.getStats()
        ]);
        setUsers(userData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load user management data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSeed = async () => {
    try {
      setLoading(true);
      await adminService.seed();
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Seeding failed", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-24 font-sans">
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
           <div className="space-y-4">
              <Skeleton className="w-80 h-16" />
              <Skeleton className="w-96 h-6 opacity-50" />
           </div>
           <Skeleton className="w-48 h-14 rounded-2xl" />
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <CardSkeleton />
           <CardSkeleton />
           <CardSkeleton />
        </div>
        <div className="space-y-4">
           <TableRowSkeleton />
           <TableRowSkeleton />
           <TableRowSkeleton />
           <TableRowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-24 font-sans">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-display-metrics gradient-text mb-2"
          >
            User Management
          </motion.h1>
          <p className="text-body-lg text-on-surface-variant font-medium opacity-70">Manage ecosystem access, roles, and security permissions.</p>
        </div>
        <div className="flex gap-4">
          {users.length === 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSeed}
              className="glass text-on-surface font-bold px-6 rounded-2xl h-14 flex items-center justify-center gap-3 hover:bg-surface-container transition-all shadow-lg border border-outline-variant"
            >
              <History className="w-5 h-5 text-primary" />
              Seed Sample Data
            </motion.button>
          )}
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
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors w-5 h-5 opacity-50" />
          <input 
            type="text" 
            placeholder="Search by identity or credentials..." 
            className="w-full h-14 pl-14 pr-6 glass border-outline-variant rounded-2xl font-medium text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-on-surface-variant/40 shadow-lg"
          />
        </div>
        <div className="flex gap-2">
           <button className="h-14 px-6 glass rounded-2xl font-bold text-sm hover:bg-surface-container transition-colors">Role: All</button>
           <button className="h-14 px-6 glass rounded-2xl font-bold text-sm hover:bg-surface-container transition-colors">Status: Active</button>
        </div>
      </div>

      {/* Stats row */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: "Total Identities", value: stats?.totalUsers?.toLocaleString() || "0", icon: Group, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active Sessions", value: stats?.activeNow?.toLocaleString() || "0", icon: UserCheck, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Google Linked", value: stats?.googleUsers?.toLocaleString() || "0", icon: Shield, color: "text-accent-purple", bg: "bg-accent-purple/10" },
        ].map((stat) => (
          <motion.div 
            key={stat.label}
            variants={item}
            className="glass p-8 rounded-[32px] flex flex-col justify-between card-hover relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12" />
            <div className="flex justify-between items-start mb-6">
               <div className={stat.bg + " p-4 rounded-2xl " + stat.color}>
                  <stat.icon className="w-6 h-6" />
               </div>
            </div>
            <div>
              <span className="text-label-caps text-on-surface-variant opacity-60 mb-2 block">{stat.label}</span>
              <span className="text-3xl font-bold text-on-surface">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* List */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {filteredUsers.map((user) => (
          <motion.div 
            key={user._id} 
            variants={item}
            className="glass p-6 rounded-[24px] flex items-center gap-6 group hover:bg-surface-container/30 transition-all duration-300 cursor-default"
          >
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-outline-variant shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg shrink-0 border border-secondary/20">
                  {user.name?.charAt(0)}
                </div>
              )}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface shadow-sm",
                user.isVerified ? 'bg-secondary' : 'bg-on-surface-variant'
              )} />
            </div>
            
            <div className="flex-1 overflow-hidden">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{user.name}</h3>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">{user.authProvider}</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-on-surface-variant opacity-60">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user.email}</span>
               </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={cn(
                "hidden sm:block text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border",
                user.isVerified ? 'text-secondary border-secondary/20 bg-secondary/5' : 
                'text-on-surface-variant border-outline-variant bg-surface-container'
              )}>
                {user.isVerified ? "Verified" : "Pending"}
              </span>
              <button className="p-3 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant">
                 <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="glass p-12 rounded-3xl text-center border-dashed border-outline-variant">
            <p className="text-on-surface-variant font-medium">No users found in the system database.</p>
          </div>
        )}
        
        <motion.button 
          variants={item}
          className="mt-6 py-4 w-full glass rounded-2xl text-on-surface-variant font-bold hover:text-primary transition-all shadow-lg active:scale-[0.99]"
        >
          Load More Identities
        </motion.button>
      </motion.div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

