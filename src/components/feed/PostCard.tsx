import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Send,
  Flag,
  Trash2,
} from 'lucide-react';
import { Post } from '../../types';
import { formatRelativeTime, formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { togglePostLike, togglePostSave, addCommentToPost, deletePostById } from '../../firebase/services';

interface PostCardProps {
  post: Post;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
  onOpenReport: (postId: string, type: 'post') => void;
  onSelectTag?: (tag: string) => void;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onOpenShare,
  onOpenReport,
  onSelectTag,
  onPostDeleted,
}) => {
  const { userProfile, isAdmin } = useAuth();
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(post.hasSaved || false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const canDelete = isAdmin || (userProfile && userProfile.uid === post.authorId);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleLike = async () => {
    if (!userProfile) return;
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    await togglePostLike(
      post.id,
      userProfile.uid,
      isLiked,
      post.authorId,
      { username: userProfile.username, avatarUrl: userProfile.avatarUrl }
    );
  };

  const handleDoubleTap = async () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleSave = async () => {
    if (!userProfile) return;
    const nextState = !isSaved;
    setIsSaved(nextState);
    await togglePostSave(post.id, userProfile.uid, isSaved);
  };

  const handleSubmitInlineComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !userProfile || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addCommentToPost(
        {
          postId: post.id,
          authorId: userProfile.uid,
          authorUsername: userProfile.username,
          authorDisplayName: userProfile.displayName,
          authorAvatar: userProfile.avatarUrl,
          text: commentInput.trim(),
          createdAt: new Date().toISOString(),
        },
        post.authorId
      );
      setCommentsCount((prev) => prev + 1);
      setCommentInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePerformDelete = async () => {
    try {
      await deletePostById(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const hasMultipleMedia = post.mediaUrls && post.mediaUrls.length > 1;

  return (
    <article className="relative bg-[#120E22]/80 backdrop-blur-xl border border-purple-900/25 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:border-purple-500/30 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500">
            <img
              src={post.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
              alt={post.authorDisplayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#120E22]"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white tracking-tight hover:underline cursor-pointer">
                {post.authorDisplayName}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-200/50">
              <span>@{post.authorUsername}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-purple-300/70">
                    <MapPin className="w-2.5 h-2.5" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options dropdown button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-white/10 text-purple-200/70 hover:text-white transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#1C1635] border border-purple-500/20 shadow-2xl py-1.5 z-20 backdrop-blur-xl animate-fade-in">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenShare(post);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-200 hover:bg-white/10 text-left cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Share Moment</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenReport(post.id, 'post');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/10 text-left cursor-pointer"
              >
                <Flag className="w-4 h-4 text-rose-400" />
                <span>Report Content</span>
              </button>

              {canDelete && (
                <>
                  {!confirmingDelete ? (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/15 text-left border-t border-purple-900/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Post</span>
                    </button>
                  ) : (
                    <div className="p-2 border-t border-purple-900/30 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setConfirmingDelete(false);
                          handlePerformDelete();
                        }}
                        className="flex-1 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] text-center cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setConfirmingDelete(false)}
                        className="px-2 py-1 rounded-lg bg-white/10 text-purple-200 text-[11px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Viewport */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div
          onDoubleClick={handleDoubleTap}
          className="relative w-full bg-black/60 aspect-square sm:aspect-[4/3] flex items-center justify-center overflow-hidden select-none cursor-pointer"
        >
          <img
            src={post.mediaUrls[currentMediaIdx]}
            alt="Post media"
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Double-tap animated heart burst */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-ping">
              <Heart className="w-24 h-24 text-pink-500 fill-pink-500 drop-shadow-2xl" />
            </div>
          )}

          {/* Carousel Arrows */}
          {hasMultipleMedia && (
            <>
              {currentMediaIdx > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIdx((prev) => prev - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-md cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentMediaIdx < post.mediaUrls.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIdx((prev) => prev + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-all backdrop-blur-md cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md">
                {post.mediaUrls.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentMediaIdx ? 'bg-pink-400 w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Action Bar */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-purple-200/90 hover:text-pink-400 transition-colors group cursor-pointer"
            >
              <Heart
                className={`w-6 h-6 transition-transform group-active:scale-125 ${
                  isLiked ? 'text-pink-500 fill-pink-500' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-xs font-bold text-white">{formatNumber(likesCount)}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => onOpenComments(post)}
              className="flex items-center gap-1.5 text-purple-200/90 hover:text-purple-300 transition-colors group cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span className="text-xs font-bold text-white">{formatNumber(commentsCount)}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => onOpenShare(post)}
              className="p-1 text-purple-200/90 hover:text-purple-300 transition-colors group cursor-pointer"
            >
              <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleSave}
            className="p-1 text-purple-200/90 hover:text-purple-300 transition-colors group cursor-pointer"
          >
            <Bookmark
              className={`w-5 h-5 transition-transform group-active:scale-125 ${
                isSaved ? 'text-pink-400 fill-pink-400' : 'group-hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* Caption & Tags */}
        <div className="text-sm text-purple-100/90 leading-relaxed">
          <span className="font-bold text-white mr-2 cursor-pointer hover:underline">
            {post.authorUsername}
          </span>
          <span>{post.caption}</span>
        </div>

        {/* Clickable Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag && onSelectTag(tag.startsWith('#') ? tag : `#${tag}`)}
                className="text-xs font-medium text-pink-400 hover:text-pink-300 hover:underline cursor-pointer"
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </button>
            ))}
          </div>
        )}

        {/* Comments trigger */}
        {commentsCount > 0 && (
          <button
            onClick={() => onOpenComments(post)}
            className="text-xs text-purple-200/50 hover:text-purple-300 text-left transition-colors cursor-pointer pt-1"
          >
            View all {commentsCount} comments
          </button>
        )}

        {/* Inline quick comment */}
        <form onSubmit={handleSubmitInlineComment} className="flex items-center gap-2 pt-2 border-t border-purple-900/20">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
          />
          {commentInput.trim() && (
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 cursor-pointer disabled:opacity-50"
            >
              Post
            </button>
          )}
        </form>
      </div>
    </article>
  );
};
