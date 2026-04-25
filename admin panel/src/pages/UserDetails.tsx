import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Mail, 
  Shield, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  History,
  Activity
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const data = await adminService.getUserById(id);
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to PURGE this identity? All associated notes and media will be permanently deleted from the ecosystem.`)) return;
    
    try {
      await adminService.deleteUser(id!);
      navigate("/users");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant font-bold animate-pulse uppercase tracking-widest text-[10px]">Retrieving Identity...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 glass rounded-[32px] text-center border-error/20">
        <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <ShieldAlert className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Access Denied</h2>
        <p className="text-on-surface-variant opacity-70 mb-8">{error || "The requested identity could not be located in the ecosystem."}</p>
        <Link to="/users" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
          <ArrowLeft className="w-5 h-5" />
          Return to Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 glass rounded-2xl hover:bg-surface-container transition-all text-on-surface-variant"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl md:text-display-metrics gradient-text mb-1">{user.name}</h1>
            <p className="text-xs md:text-sm font-medium text-on-surface-variant opacity-60 flex items-center gap-2">
               <Shield className="w-3.5 h-3.5 text-primary" />
               Identity Index: {user._id}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleDelete}
            className="h-14 px-6 glass rounded-2xl text-error font-bold hover:bg-error/10 transition-all flex items-center gap-3"
           >
              <Trash2 className="w-5 h-5" />
              Purge Identity
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[32px] flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative mb-6">
            {user.avatar ? (
              <img src={user.avatar} className="w-32 h-32 rounded-3xl object-cover border-2 border-outline-variant shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold border border-primary/20">
                {user.name.charAt(0)}
              </div>
            )}
            <div className={cn(
              "absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-surface shadow-lg flex items-center justify-center",
              user.isVerified ? 'bg-secondary' : 'bg-on-surface-variant'
            )}>
              <Shield className="w-4 h-4 text-on-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">{user.name}</h2>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">{user.authProvider} Authorized</span>
          
          <div className="w-full space-y-4 pt-6 border-t border-outline-variant/30">
            <div className="flex items-center gap-4 p-4 glass rounded-2xl bg-surface-container/50">
               <Mail className="w-5 h-5 text-on-surface-variant" />
               <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Identity Address</p>
                  <p className="text-sm font-bold text-on-surface truncate max-w-[180px]">{user.email}</p>
               </div>
            </div>
            <div className="flex items-center gap-4 p-4 glass rounded-2xl bg-surface-container/50">
               <Calendar className="w-5 h-5 text-on-surface-variant" />
               <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Onboarding Date</p>
                  <p className="text-sm font-bold text-on-surface">{new Date(user.createdAt).toLocaleDateString()}</p>
               </div>
            </div>
          </div>
        </motion.section>

        {/* Activity & Stats */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 rounded-[28px] border-secondary/20 bg-secondary/5"
              >
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center">
                       <FileText className="w-6 h-6 text-secondary" />
                    </div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Active Storage</span>
                 </div>
                 <p className="text-3xl font-bold text-on-surface">{user.mediaCount || 0}</p>
                 <p className="text-xs font-medium text-on-surface-variant opacity-60 mt-1">Total notes and assets linked</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 rounded-[28px] border-accent-purple/20 bg-accent-purple/5"
              >
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center">
                       <Activity className="w-6 h-6 text-accent-purple" />
                    </div>
                    <span className="text-[10px] font-bold text-accent-purple uppercase tracking-widest">Health Level</span>
                 </div>
                 <p className="text-3xl font-bold text-on-surface">98.2%</p>
                 <p className="text-xs font-medium text-on-surface-variant opacity-60 mt-1">System interactions verified</p>
              </motion.div>
           </div>

           <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-8 rounded-[32px]"
           >
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-bold text-on-surface flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    Recent Activity Timeline
                 </h3>
              </div>
              
              {user.recentMedia && user.recentMedia.length > 0 ? (
                <div className="space-y-4">
                   {user.recentMedia.map((item: any) => (
                     <div key={item._id} className="p-4 glass rounded-2xl flex items-center justify-between group hover:bg-surface-container/50 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-on-surface">{item.fileName || "Untitled Asset"}</p>
                              <p className="text-[10px] font-medium text-on-surface-variant opacity-60">Uploaded {new Date(item.createdAt).toLocaleString()}</p>
                           </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                   ))}
                </div>
              ) : (
                <div className="p-12 text-center glass rounded-2xl border-dashed border-outline-variant/30">
                   <p className="text-on-surface-variant text-sm font-medium">No recent ecosystem activity recorded for this identity.</p>
                </div>
              )}
           </motion.section>
        </div>
      </div>
    </div>
  );
}
