import { useState, useEffect } from 'react';
import { Compass, MessageSquare, Heart, Share2, MoreHorizontal, UserCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { feedService } from '../services/feedService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await feedService.getFeed();
        setPosts(data);
      } catch (err) {
        console.error("Explore feed failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) {
      alert("Please login to like posts");
      return;
    }

    // Store previous state for rollback
    const previousPosts = [...posts];
    
    // Optimistic Update
    setPosts(currentPosts => currentPosts.map(p => {
      if (p._id === postId) {
        const isCurrentlyLiked = p.likedBy?.includes(user.id);
        const newLikedBy = isCurrentlyLiked 
          ? p.likedBy.filter((id: string) => id !== user.id)
          : [...(p.likedBy || []), user.id];
        const newLikes = isCurrentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
        
        return { ...p, likes: newLikes, likedBy: newLikedBy };
      }
      return p;
    }));

    try {
      const data = await feedService.likePost(postId);
      // Update with actual server data to ensure consistency
      setPosts(currentPosts => currentPosts.map(p => 
        p._id === postId ? { ...p, likes: data.likes, likedBy: data.likedBy } : p
      ));
    } catch (err) {
      console.error("Like failed", err);
      // Rollback on error
      setPosts(previousPosts);
      alert("Could not update like. Please check your connection.");
    }
  };

  const handleShare = async (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    const shareData = {
      title: post.title,
      text: post.content.substring(0, 100) + '...',
      url: `${window.location.origin}/explore/${post._id}`
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const updatedComments = await feedService.commentPost(postId, commentText);
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
      setCommentText('');
      setActiveCommentId(null);
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-4 md:py-8 space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-surface-container-low rounded-none md:rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2 md:py-8 space-y-6 pb-32">
      <header className="px-4 md:px-0 mb-6">
        <div className="flex items-center gap-3 mb-1">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="text-primary w-5 h-5" />
           </div>
           <h1 className="text-2xl font-bold text-on-surface">Explores</h1>
        </div>
        <p className="text-sm text-on-surface-variant font-medium opacity-60">Discover updates and inspirations.</p>
      </header>

      {posts.length > 0 ? (
        <div className="space-y-4 md:space-y-6">
           {posts.map((post, index) => {
             const isLiked = user && post.likedBy?.includes(user.id);
             
             return (
               <motion.article 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={post._id}
                onClick={() => navigate(`/explore/${post._id}`)}
                className="bg-surface-container-lowest border-y md:border border-outline-variant/20 md:rounded-2xl overflow-hidden cursor-pointer hover:bg-surface-container-lowest/80 transition-colors"
               >
                  {/* Header (Author & Meta) */}
                  <div className="p-4 flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          <UserCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h2 className="text-sm font-bold text-on-surface leading-tight">
                             {post.author || 'System Broadcast'}
                           </h2>
                           <div className="flex items-center gap-1.5 text-xs text-on-surface-variant opacity-70">
                              <span className="font-medium text-primary">{post.category}</span>
                              <span>•</span>
                              <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                           </div>
                        </div>
                     </div>
                     <button className="p-2 hover:bg-surface-container rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
                     </button>
                  </div>

                  {/* Content (Text above image) */}
                  <div className="px-4 pb-3 space-y-2">
                     <h3 className="font-bold text-base text-on-surface">{post.title}</h3>
                     <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {post.content}
                     </p>
                  </div>

                  {/* Image (Full width) */}
                  {post.image && (
                    <div className="w-full bg-surface-container border-y border-outline-variant/10">
                       <img src={post.image} className="w-full h-auto max-h-[600px] object-contain" alt={post.title} />
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="px-4 py-3 flex items-center justify-between border-t border-outline-variant/10 mt-1">
                     <div className="flex items-center gap-2">
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={(e) => handleLike(e, post._id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                            isLiked 
                              ? 'text-error bg-error/10 ring-1 ring-error/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                              : 'text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                           <motion.div
                             animate={isLiked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                             transition={isLiked ? { duration: 0.4, type: "spring", stiffness: 300 } : {}}
                           >
                             <Heart 
                               className={`w-5 h-5 transition-all duration-300 ${
                                 isLiked 
                                   ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                                   : 'scale-100'
                               }`} 
                             />
                           </motion.div>
                           <span className={`text-sm font-bold transition-colors ${isLiked ? 'text-error' : ''}`}>
                             {post.likes || 0}
                           </span>
                        </motion.button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (activeCommentId === post._id) {
                              setActiveCommentId(null);
                            } else {
                              setActiveCommentId(post._id);
                              setCommentText('');
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                            activeCommentId === post._id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                           <MessageSquare className="w-5 h-5" />
                           <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                        </button>
                     </div>
                     <button 
                       onClick={(e) => handleShare(e, post)}
                       className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                     >
                        <Share2 className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Quick Comment Input */}
                  <AnimatePresence>
                    {activeCommentId === post._id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <form 
                          onSubmit={(e) => handleCommentSubmit(e, post._id)}
                          className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2"
                        >
                          <input 
                            autoFocus
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface"
                          />
                          <button 
                            disabled={submittingComment || !commentText.trim()}
                            className="text-primary disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.article>
             );
           })}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 px-4">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
            <Compass size={32} className="opacity-20" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">No stories yet</h2>
            <p className="text-sm text-on-surface-variant opacity-60">Check back later for new updates.</p>
          </div>
        </div>
      )}
    </div>
  );
}

