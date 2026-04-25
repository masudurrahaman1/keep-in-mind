import { useState, useEffect } from 'react';
import { Compass, Megaphone, Globe, MessageSquare, History, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { feedService } from '../services/feedService';
import { cn } from '../components/Sidebar';

export default function Explore() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-4">
           <div className="h-10 w-48 bg-surface-container rounded-xl animate-pulse" />
           <div className="h-4 w-64 bg-surface-container rounded-lg animate-pulse opacity-50" />
        </div>
        {[1, 2].map(i => (
          <div key={i} className="bg-surface-container-low rounded-[32px] h-96 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 px-4 md:px-8 space-y-8 md:space-y-12 pb-32">
      <header className="px-2 md:px-0">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Compass className="text-primary w-5 h-5" />
           </div>
           <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Explores</h1>
        </div>
        <p className="text-sm text-on-surface-variant font-medium opacity-60">Curated discoveries and inspirations.</p>
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:gap-10">
           {posts.map((post, index) => (
             <motion.article 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={post._id}
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group"
             >
                {post.image && (
                  <div className="aspect-[16/9] w-full overflow-hidden relative bg-surface-container">
                     <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={post.title} />
                     <div className="absolute top-4 left-4 md:top-6 md:left-6">
                        <span className="px-3 py-1.5 md:px-4 md:py-2 bg-black/40 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                           {post.category}
                        </span>
                     </div>
                  </div>
                )}

                <div className="p-6 md:p-10 space-y-5 md:space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <h2 className="text-xl md:text-2xl font-bold text-on-surface leading-tight">{post.title}</h2>
                         <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">
                            <Megaphone className="w-3.5 h-3.5" />
                            <span>System Broadcast • {new Date(post.createdAt).toLocaleDateString('en-IN')}</span>
                         </div>
                      </div>
                      <button className="p-3 hover:bg-surface-container rounded-2xl transition-colors">
                         <MoreHorizontal className="w-5 h-5 opacity-40" />
                      </button>
                   </div>

                   <p className="text-on-surface-variant leading-relaxed text-sm md:text-base opacity-90">
                      {post.content}
                   </p>

                   <div className="pt-5 md:pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <div className="flex items-center gap-4 md:gap-6">
                         <button className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors group/btn">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center group-hover/btn:bg-error/10 transition-colors">
                               <Heart className="w-4.5 h-4.5 md:w-5 md:h-5" />
                            </div>
                            <span className="text-xs font-bold">{post.likes || 0}</span>
                         </button>
                         <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group/btn">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
                               <MessageSquare className="w-4.5 h-4.5 md:w-5 md:h-5" />
                            </div>
                            <span className="text-xs font-bold hidden xs:inline">Discuss</span>
                         </button>
                      </div>
                      <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
                         <Share2 className="w-4.5 h-4.5 md:w-5 md:h-5 opacity-40" />
                      </button>
                   </div>
                </div>
             </motion.article>
           ))}
        </div>
      ) : (
        <div className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-6 bg-surface-container/20 rounded-[32px] md:rounded-[40px] border border-dashed border-outline-variant/30 mx-2">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container rounded-full flex items-center justify-center">
            <Compass size={32} className="opacity-20 md:w-10 md:h-10" />
          </div>
          <div className="space-y-2 px-6">
            <h2 className="text-lg md:text-xl font-bold text-on-surface">The Feed is Empty</h2>
            <p className="max-w-xs text-xs md:text-sm text-on-surface-variant opacity-60 font-medium">Check back soon for new inspirations from the ecosystem team.</p>
          </div>
        </div>
      )}
    </div>
  );
}
