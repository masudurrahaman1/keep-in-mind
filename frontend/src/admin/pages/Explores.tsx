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
  Compass,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";

export default function Explores() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = newPost.image;
      
      // Upload image if file selected
      if (selectedFile) {
        const uploadResult = await adminService.uploadImage(selectedFile);
        imageUrl = uploadResult.imageUrl;
      }

      await adminService.createPost({ ...newPost, image: imageUrl });
      setNewPost({ title: "", content: "", image: "", category: "Announcement" });
      setSelectedFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert("Failed to create exploration");
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => setIsModalOpen(true)}
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
                  className="glass p-6 md:p-8 rounded-[32px] group relative overflow-hidden"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                             <Compass className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <h3 className="font-bold text-on-surface text-base md:text-lg">{post.title}</h3>
                             <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">{post.category}</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleDelete(post._id)}
                        className="p-3 glass rounded-xl text-error opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-error/10 active:scale-90"
                       >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </div>

                    <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6">
                       {post.content}
                    </p>

                    {post.image && (
                      <div className="w-full h-56 md:h-72 rounded-2xl overflow-hidden mb-6 border border-outline-variant/30 bg-surface-container">
                         <img src={post.image} className="w-full h-full object-cover" alt="Post content" />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-outline-variant/30 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
                       <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2">
                             <Globe className="w-3.5 h-3.5" />
                             Public Feed
                          </span>
                       </div>
                       <span>{new Date(post.createdAt).toLocaleDateString('en-IN')}</span>
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-surface/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-surface md:glass p-6 md:p-10 rounded-t-[32px] md:rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
             <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-surface md:bg-transparent pt-2 pb-4 z-10">
                <h2 className="text-xl md:text-2xl font-bold text-on-surface">New Exploration</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Exploration Title</label>
                   <input 
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    placeholder="E.g. Summer Update 2024"
                    className="w-full h-14 bg-surface-container/50 rounded-2xl px-6 outline-none border border-outline-variant focus:border-primary transition-all font-medium"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Visual Asset</label>
                   <div 
                    onClick={() => document.getElementById('post-image')?.click()}
                    className="w-full h-40 md:h-48 bg-surface-container/30 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container/50 transition-all overflow-hidden relative"
                   >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                             <ImageIcon className="text-white w-8 h-8" />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-on-surface-variant opacity-30 mb-2" />
                          <span className="text-xs font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">Select Image File</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        id="post-image" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Category</label>
                   <div className="flex flex-wrap gap-2">
                      {["Announcement", "Inspiration", "Update", "Event"].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewPost({...newPost, category: cat})}
                          className={cn(
                            "px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                            newPost.category === cat 
                              ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" 
                              : "bg-surface-container/50 text-on-surface-variant border-outline-variant hover:border-primary/50"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-primary px-1">Description</label>
                   <textarea 
                    required
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows={4}
                    placeholder="Tell the community about this discovery..."
                    className="w-full bg-surface-container/50 rounded-[24px] p-6 outline-none border border-outline-variant focus:border-primary transition-all font-medium resize-none text-sm md:text-base"
                   />
                </div>

                <button 
                  disabled={submitting}
                  className="w-full h-16 bg-primary text-on-primary rounded-[24px] font-bold flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50 mt-4"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Publish Exploration
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
