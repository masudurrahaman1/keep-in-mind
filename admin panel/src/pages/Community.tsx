import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  Send, 
  Trash2, 
  Image as ImageIcon, 
  MessageSquare, 
  Globe, 
  Plus, 
  X,
  Megaphone,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";

export default function Community() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    category: "Announcement"
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createPost(newPost);
      setNewPost({ title: "", content: "", image: "", category: "Announcement" });
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this post from the global feed?")) return;
    try {
      await adminService.deletePost(id);
      fetchPosts();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-display-metrics gradient-text mb-2">Global Discovery</h1>
          <p className="text-sm md:text-body-lg text-on-surface-variant font-medium opacity-70">Broadcast announcements and inspirations to all users.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Broadcast
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           {loading ? (
             <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass p-8 rounded-[32px] skeleton h-64" />
                ))}
             </div>
           ) : posts.length > 0 ? (
             <div className="grid grid-cols-1 gap-6">
               {posts.map((post) => (
                 <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={post._id}
                  className="glass p-8 rounded-[32px] group relative overflow-hidden"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                             <Megaphone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <h3 className="font-bold text-on-surface">{post.title}</h3>
                             <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{post.category}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDelete(post._id)}
                        className="p-3 glass rounded-xl text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error/10"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>

                    <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
                       {post.content}
                    </p>

                    {post.image && (
                      <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 border border-outline-variant/30">
                         <img src={post.image} className="w-full h-full object-cover" alt="Post content" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-outline-variant/30 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                       <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2">
                             <Globe className="w-3.5 h-3.5" />
                             Public Feed
                          </span>
                          <span className="flex items-center gap-2">
                             <MessageSquare className="w-3.5 h-3.5" />
                             Comments Enabled
                          </span>
                       </div>
                       <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                 </motion.div>
               ))}
             </div>
           ) : (
             <div className="glass p-20 rounded-[40px] text-center border-dashed border-outline-variant">
                <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
                   <Megaphone className="w-10 h-10 opacity-30 text-on-surface-variant" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Silence in the Feed</h2>
                <p className="text-on-surface-variant opacity-60">You haven't broadcasted any content to the ecosystem yet.</p>
             </div>
           )}
        </div>

        <aside className="space-y-6">
           <div className="glass p-8 rounded-[32px] bg-secondary/5 border-secondary/20">
              <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-3">
                 <Globe className="w-5 h-5 text-secondary" />
                 Feed Metrics
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Total Broadcasts</span>
                    <span className="font-bold text-on-surface">{posts.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Reach Estimation</span>
                    <span className="font-bold text-on-surface">14.2K</span>
                 </div>
              </div>
           </div>
           
           <div className="glass p-8 rounded-[32px] bg-accent-purple/5 border-accent-purple/20">
              <h4 className="font-bold text-on-surface mb-4 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-accent-purple" />
                 Broadcast Rules
              </h4>
              <ul className="space-y-3 text-xs text-on-surface-variant font-medium">
                 <li className="flex gap-2">
                    <span className="text-accent-purple">•</span>
                    Posts are visible to ALL users instantly.
                 </li>
                 <li className="flex gap-2">
                    <span className="text-accent-purple">•</span>
                    External images must be secure (HTTPS).
                 </li>
                 <li className="flex gap-2">
                    <span className="text-accent-purple">•</span>
                    Content should align with system guidelines.
                 </li>
              </ul>
           </div>
        </aside>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-surface/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl glass p-8 md:p-10 rounded-[40px] shadow-2xl"
          >
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-on-surface">New Broadcast</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Broadcast Title</label>
                   <input 
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="Enter an attention-grabbing headline..."
                    className="w-full h-14 bg-surface-container/50 rounded-2xl px-6 outline-none border border-outline-variant focus:border-primary transition-all font-medium"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Visual Asset URL (Optional)</label>
                    <div className="relative">
                       <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant opacity-40" />
                       <input 
                        value={newPost.image}
                        onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                        placeholder="https://..."
                        className="w-full h-14 bg-surface-container/50 rounded-2xl pl-14 pr-6 outline-none border border-outline-variant focus:border-primary transition-all font-medium"
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Category</label>
                    <select 
                      value={newPost.category}
                      onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                      className="w-full h-14 bg-surface-container/50 rounded-2xl px-6 outline-none border border-outline-variant focus:border-primary transition-all font-bold appearance-none"
                    >
                       <option>Announcement</option>
                       <option>Inspiration</option>
                       <option>Update</option>
                       <option>Event</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Message Content</label>
                   <textarea 
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={6}
                    placeholder="What would you like to share with the community?"
                    className="w-full bg-surface-container/50 rounded-[28px] p-6 outline-none border border-outline-variant focus:border-primary transition-all font-medium resize-none"
                   />
                </div>

                <button 
                  disabled={submitting}
                  className="w-full h-16 bg-primary text-on-primary rounded-[24px] font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Publish to Ecosystem
                    </>
                  )}
                </button>
             </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
