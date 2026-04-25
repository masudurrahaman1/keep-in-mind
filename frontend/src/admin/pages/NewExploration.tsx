import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Send, 
  Image as ImageIcon, 
  X,
  ChevronLeft,
  Info,
  UserCircle2,
  Smile,
  MapPin,
  MoreHorizontal,
  Tags
} from "lucide-react";
import { adminService } from "../lib/api";
import { cn } from "../lib/utils";
import { useAuth } from "../../context/AuthContext";

export default function NewExploration() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createPost({ 
        ...newPost, 
        image: imagePreview || "" 
      });
      navigate("/explores");
    } catch (err) {
      alert("Failed to create exploration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans px-4">
      <header className="py-6 flex items-center justify-between sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md z-10 -mx-4 px-4 mb-4">
        <button 
          onClick={() => navigate("/explores")}
          className="p-2 hover:bg-surface-container rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="text-lg font-bold text-on-surface">Create Exploration</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
        {/* User Context */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <UserCircle2 className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-on-surface leading-tight">
              {user?.name || 'System Administrator'}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <select 
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                className="bg-surface-container text-[11px] font-bold px-2 py-0.5 rounded-md outline-none border-none text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                {["Announcement", "Inspiration", "Update", "Event"].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="px-4 pb-2">
          <input 
            required
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            placeholder="Title of your discovery..."
            className="w-full text-xl font-bold bg-transparent border-none outline-none text-on-surface placeholder:opacity-40 mb-2"
          />
          <textarea 
            required
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0] || 'Admin'}?`}
            className="w-full min-h-[120px] text-lg bg-transparent border-none outline-none text-on-surface placeholder:opacity-40 resize-none leading-relaxed"
          />
        </div>

        {/* Image Upload/Preview Card */}
        <div className="px-4 pb-4">
          <AnimatePresence mode="wait">
            {imagePreview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative rounded-xl overflow-hidden border border-outline-variant/30 group"
              >
                <img src={imagePreview} className="w-full h-auto max-h-[400px] object-contain bg-black/5" alt="Preview" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div 
                  onClick={() => document.getElementById('post-image-fb')?.click()}
                  className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-pointer"
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => document.getElementById('post-image-fb')?.click()}
                className="w-full py-12 rounded-xl border-2 border-dashed border-outline-variant/50 bg-surface-container/30 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container/50 transition-all gap-2"
              >
                <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-on-surface-variant" />
                </div>
                <p className="font-bold text-sm text-on-surface">Add Photos</p>
                <p className="text-xs text-on-surface-variant opacity-60 uppercase tracking-widest font-medium">Click to select</p>
              </motion.div>
            )}
          </AnimatePresence>
          <input 
            type="file" 
            id="post-image-fb" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Action Bar (Fake UI for aesthetics) */}
        <div className="mx-4 mb-4 p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between">
          <span className="text-[14px] font-bold text-on-surface opacity-80 pl-1">Add to your post</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => document.getElementById('post-image-fb')?.click()} className="p-2 hover:bg-surface-container rounded-full transition-colors text-success">
              <ImageIcon className="w-6 h-6" />
            </button>
            <button type="button" className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary">
              <Tags className="w-6 h-6" />
            </button>
            <button type="button" className="p-2 hover:bg-surface-container rounded-full transition-colors text-warning">
              <Smile className="w-6 h-6" />
            </button>
            <button type="button" className="p-2 hover:bg-surface-container rounded-full transition-colors text-error">
              <MapPin className="w-6 h-6" />
            </button>
            <button type="button" className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-4 pb-4">
          <button 
            disabled={submitting || (!newPost.content.trim() && !imagePreview)}
            className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? (
              <div className="w-6 h-6 border-3 border-on-primary/20 border-t-on-primary rounded-full animate-spin mx-auto" />
            ) : (
              "Post"
            )}
          </button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-8 bg-primary/5 border border-primary/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Community Guidelines
        </h3>
        <ul className="space-y-2">
          <li className="text-xs text-on-surface-variant leading-relaxed">• Ensure images are high quality and relevant.</li>
          <li className="text-xs text-on-surface-variant leading-relaxed">• Keep the content respectful and inspiring for all users.</li>
        </ul>
      </div>
    </div>
  );
}

