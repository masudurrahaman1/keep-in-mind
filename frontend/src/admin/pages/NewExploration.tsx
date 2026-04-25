import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  Image as ImageIcon, 
  X,
  ChevronLeft,
  Info
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";

export default function NewExploration() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    category: "Announcement"
  });
  const [submitting, setSubmitting] = useState(false);

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
      
      if (selectedFile) {
        const uploadResult = await adminService.uploadImage(selectedFile);
        imageUrl = uploadResult.imageUrl;
      }

      await adminService.createPost({ ...newPost, image: imageUrl });
      navigate("/explores");
    } catch (err) {
      alert("Failed to create exploration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 font-sans">
      <header className="mb-10">
        <button 
          onClick={() => navigate("/explores")}
          className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all mb-6 group"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Explores
        </button>
        <h1 className="text-4xl md:text-display-metrics gradient-text mb-2">New Exploration</h1>
        <p className="text-on-surface-variant opacity-70 italic">Curate something beautiful for the community.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass p-8 md:p-12 rounded-[48px] space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary px-1">Headline</label>
              <input 
                required
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="E.g. The Future of Note Taking"
                className="w-full h-16 bg-surface-container/50 rounded-2xl px-6 outline-none border border-outline-variant focus:border-primary transition-all font-bold text-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary px-1">Visual Content</label>
              <div 
                onClick={() => document.getElementById('post-image-full')?.click()}
                className="w-full aspect-video bg-surface-container/30 rounded-[32px] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container/50 transition-all overflow-hidden relative"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <ImageIcon className="text-white w-10 h-10" />
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-on-surface mb-1">Select Cover Image</p>
                        <p className="text-[10px] text-on-surface-variant opacity-60 uppercase tracking-widest font-bold">High quality JPEG or PNG</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  id="post-image-full" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary px-1">Category</label>
              <div className="flex flex-wrap gap-3">
                {["Announcement", "Inspiration", "Update", "Event"].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewPost({...newPost, category: cat})}
                    className={cn(
                      "px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border",
                      newPost.category === cat 
                        ? "bg-primary text-on-primary border-primary shadow-xl shadow-primary/20 scale-105" 
                        : "bg-surface-container/50 text-on-surface-variant border-outline-variant hover:border-primary/50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-primary px-1">Detailed Story</label>
              <textarea 
                required
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={8}
                placeholder="Share the details with all users..."
                className="w-full bg-surface-container/50 rounded-[32px] p-8 outline-none border border-outline-variant focus:border-primary transition-all font-medium resize-none text-base leading-relaxed"
              />
            </div>

            <div className="pt-6">
              <button 
                disabled={submitting}
                className="w-full h-20 bg-primary text-on-primary rounded-[28px] font-bold flex items-center justify-center gap-4 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50 text-lg group"
              >
                {submitting ? (
                  <div className="w-8 h-8 border-4 border-on-primary/20 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    Launch to Community
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-8">
          <div className="glass p-8 rounded-[32px] bg-secondary/5 border-secondary/20">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-secondary" />
              Pro Tips
            </h3>
            <ul className="space-y-4">
              <li className="text-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-secondary">Visuals Matter:</span> High-quality images get 4x more engagement in the Explore feed.
              </li>
              <li className="text-sm text-on-surface-variant leading-relaxed">
                <span className="font-bold text-secondary">Be Concise:</span> Keep headlines short and punchy for mobile notifications.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
