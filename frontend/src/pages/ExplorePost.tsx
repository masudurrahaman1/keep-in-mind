import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, MessageSquare, Share2, UserCircle2, Send } from 'lucide-react';
import { feedService } from '../services/feedService';
import { useAuth } from '../context/AuthContext';

export default function ExplorePost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await feedService.getPost(id as string);
      setPost(data);
    } catch (err) {
      console.error("Failed to load post", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like posts");
      return;
    }

    // Store previous state
    const previousPost = { ...post };

    // Optimistic Update
    const isCurrentlyLiked = post.likedBy?.includes(user.id);
    const newLikedBy = isCurrentlyLiked
      ? post.likedBy.filter((id: string) => id !== user.id)
      : [...(post.likedBy || []), user.id];
    const newLikes = isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

    setPost({ ...post, likes: newLikes, likedBy: newLikedBy });

    try {
      const data = await feedService.likePost(id as string);
      setPost({ ...post, likes: data.likes, likedBy: data.likedBy });
    } catch (err) {
      console.error("Failed to like", err);
      // Rollback
      setPost(previousPost);
      alert("Could not update like. Please check your connection.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const data = await feedService.commentPost(id as string, commentText);
      setPost({ ...post, comments: data });
      setCommentText('');
    } catch (err) {
      console.error("Failed to comment", err);
      alert("Please login to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.content.substring(0, 100) + '...',
      url: window.location.href
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 px-4">
        <div className="h-96 bg-surface-container-low rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-on-surface">Post not found</h2>
        <button onClick={() => navigate('/explore')} className="mt-4 text-primary font-bold">Back to Feed</button>
      </div>
    );
  }

  const isLiked = user && post.likedBy?.includes(user.id);

  return (
    <div className="max-w-2xl mx-auto pb-32 font-sans bg-surface-container-lowest min-h-screen">
      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/explore')} className="p-2 hover:bg-surface-container rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-on-surface" />
        </button>
        <h1 className="text-lg font-bold text-on-surface">Post Details</h1>
      </div>

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-6"
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">
              {post.author || 'System Broadcast'}
            </h2>
            <div className="text-xs text-on-surface-variant opacity-70">
              {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • {post.category}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <h3 className="font-bold text-xl text-on-surface mb-2">{post.title}</h3>
          <p className="text-on-surface text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Image */}
        {post.image && (
          <div className="w-full bg-black flex justify-center">
            <img src={post.image} className="w-full max-h-[70vh] object-contain" alt={post.title} />
          </div>
        )}

        {/* Action Bar */}
        <div className="px-4 py-3 flex items-center justify-between border-y border-outline-variant/10 mt-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isLiked
                  ? 'text-error bg-error/10 ring-1 ring-error/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : 'text-on-surface-variant hover:bg-surface-container'
                }`}
            >
              <motion.div
                animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={isLiked ? { duration: 0.4, type: "spring", stiffness: 300 } : {}}
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-300 ${isLiked
                      ? 'fill-current scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : 'scale-100'
                    }`}
                />
              </motion.div>
              <span className={`font-bold transition-colors ${isLiked ? 'text-error' : ''}`}>
                {post.likes || 0}
              </span>
            </motion.button>
            <button
              className="flex items-center gap-2 text-on-surface-variant transition-colors"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="font-bold">{post.comments?.length || 0}</span>
            </button>
          </div>
          <button
            onClick={handleShare}
            className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>


        {/* Comments Section */}
        <div className="p-4 space-y-6">
          <h3 className="font-bold text-lg text-on-surface">Comments</h3>

          <div className="space-y-4">
            {post.comments?.map((comment: any, idx: number) => (
              <div key={idx} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <UserCircle2 className="w-5 h-5 text-on-surface-variant" />
                </div>
                <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-none flex-1">
                  <div className="font-bold text-sm text-on-surface mb-0.5">{comment.user}</div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <p className="text-sm text-on-surface-variant opacity-60 text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </motion.article>

      {/* Sticky Comment Input */}
      <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/10 p-3 md:p-4 z-40 max-w-2xl mx-auto">
        <form onSubmit={handleComment} className="flex items-end gap-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-surface-container rounded-3xl px-4 py-3 min-h-[48px] max-h-32 outline-none text-sm text-on-surface resize-none"
            rows={1}
          />
          <button
            disabled={submitting || !commentText.trim()}
            className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
