import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  MessageSquare, 
  Globe, 
  Plus, 
  X,
  Compass,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";

export default function Explores() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const data = await adminService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this exploration from all users?")) return;
    try {
      await adminService.deletePost(id);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 pb-24 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 md:px-0">
        <div>
          <h1 className="text-3xl md:text-display-metrics gradient-text mb-1">Explores</h1>
          <p className="text-xs md:text-body-lg text-on-surface-variant font-medium opacity-70 italic">Publish and manage global discoveries.</p>
        </div>
        <button 
          onClick={() => navigate("/explores/new")}
          className="w-full md:w-auto h-14 px-8 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Exploration
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="glass p-6 md:p-8 rounded-[32px] skeleton h-64" />
                ))}
             </div>
           ) : posts.length > 0 ? (
             <div className="grid grid-cols-1 gap-6">
               {posts.map((post) => (
                 <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post._id}
                  className="bg-surface-container-lowest border border-outline-variant/20 rounded-[24px] md:rounded-[32px] overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all"
                 >
                    {/* Header (Author & Meta & Admin Delete) */}
                    <div className="p-5 md:p-6 flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            <Compass className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          </div>
                          <div>
                             <h2 className="text-sm md:text-base font-bold text-on-surface leading-tight">
                               {post.author || 'System Broadcast'}
                             </h2>
                             <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-on-surface-variant opacity-70 mt-0.5">
                                <span className="font-bold text-primary uppercase tracking-widest">{post.category}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDelete(post._id)}
                        className="p-2 md:p-3 bg-error/10 text-error rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-error/20 active:scale-90"
                       >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                       </button>
                    </div>

                    {/* Content (Text above image) */}
                    <div className="px-5 md:px-6 pb-4 space-y-2">
                       <h3 className="font-bold text-base md:text-lg text-on-surface">{post.title}</h3>
                       <p className="text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {post.content}
                       </p>
                    </div>

                    {/* Image (Full width) */}
                    {post.image && (
                      <div className="w-full bg-surface-container border-y border-outline-variant/10">
                         <img src={post.image} className="w-full h-auto max-h-[500px] md:max-h-[600px] object-contain" alt={post.title} />
                      </div>
                    )}

                    {/* Action Bar (Stats) */}
                    <div className="px-5 md:px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 text-xs md:text-sm font-bold text-on-surface-variant opacity-80 bg-surface-container/20">
                       <div className="flex items-center gap-6">
                          <span className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-error/80" /> {post.likes || 0} Likes
                          </span>
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary/80" /> {post.comments?.length || 0} Comments
                          </span>
                       </div>
                       <span className="flex items-center gap-2 uppercase tracking-widest text-[10px]">
                          <Globe className="w-3.5 h-3.5" /> Public Feed
                       </span>
                    </div>
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="glass p-12 md:p-20 rounded-[40px] text-center border-dashed border-outline-variant mx-2">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
                   <Compass className="w-8 h-8 md:w-10 md:h-10 opacity-30 text-on-surface-variant" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-2">Silence in Explores</h2>
                <p className="text-sm text-on-surface-variant opacity-60">Start Curating the Ecosystem.</p>
             </div>
           )}
        </div>

        <aside className="space-y-6 hidden lg:block">
           <div className="glass p-8 rounded-[32px] bg-secondary/5 border-secondary/20">
              <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-3">
                 <Globe className="w-5 h-5 text-secondary" />
                 Global Stats
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Live Explorations</span>
                    <span className="font-bold text-on-surface">{posts.length}</span>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
