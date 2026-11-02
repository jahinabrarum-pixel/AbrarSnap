import React, { useEffect, useState } from 'react';
import { X, Send, Heart, Sparkles } from 'lucide-react';
import { Comment, Post } from '../../types';
import { getCommentsForPost, addCommentToPost } from '../../firebase/services';
import { useAuth } from '../../contexts/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

interface PostCommentsModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({ post, onClose }) => {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!post) return;
    setLoading(true);
    getCommentsForPost(post.id).then((res) => {
      setComments(res);
      setLoading(false);
    });
  }, [post]);

  if (!post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userProfile || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addCommentToPost({
        postId: post.id,
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        authorDisplayName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
      setComments((prev) => [...prev, newComment]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-[#120E22] border border-purple-500/25 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Comments
            </h3>
            <span className="text-xs text-purple-300/60">({comments.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Post Caption */}
        <div className="p-4 bg-purple-950/20 border-b border-purple-900/20 flex gap-3">
          <img
            src={post.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
            alt={post.authorDisplayName}
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-purple-500/30"
          />
          <div className="min-w-0 text-xs">
            <span className="font-bold text-white mr-1.5">{post.authorUsername}</span>
            <span className="text-purple-100/80 leading-relaxed">{post.caption}</span>
            <p className="text-[10px] text-purple-300/40 mt-1">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-purple-300/50">Loading discussion...</div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-xs text-purple-300/60">
              No comments yet. Start the creative conversation!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3 group">
                <img
                  src={comment.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                  alt={comment.authorDisplayName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-purple-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                      {comment.authorDisplayName}
                    </span>
                    <span className="text-[10px] text-purple-300/40">@{comment.authorUsername}</span>
                    <span className="text-[10px] text-purple-300/30">• {formatRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-purple-100/90 mt-0.5 leading-relaxed break-words">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-purple-900/30 bg-[#161228] flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your perspective..."
            className="flex-1 bg-purple-950/40 border border-purple-800/30 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60"
          />
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-purple-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
