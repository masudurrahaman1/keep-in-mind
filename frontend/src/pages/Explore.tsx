import { useState, useEffect } from 'react';
import { Compass, MessageSquare, Heart, Share2, MoreHorizontal, UserCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { feedService } from '../services/feedService';
import { useNavigate } from 'react-router-dom';

export default function Explore() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
           {posts.map((post, index) => (
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
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* Add quick like logic later */ }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                         <Heart className="w-5 h-5" />
                         <span className="text-sm font-bold">{post.likes || 0}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/explore/${post._id}`); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                         <MessageSquare className="w-5 h-5" />
                         <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                      </button>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); }}
                     className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
                   >
                      <Share2 className="w-5 h-5" />
                   </button>
                </div>
             </motion.article>
           ))}
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
