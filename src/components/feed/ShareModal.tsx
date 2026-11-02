import React, { useState } from 'react';
import { X, Copy, Check, Send, Sparkles } from 'lucide-react';
import { Post } from '../../types';

interface ShareModalProps {
  post: Post | null;
  onClose: () => void;
  onSendToChat?: (postId: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, onClose, onSendToChat }) => {
  const [copied, setCopied] = useState(false);

  if (!post) return null;

  const shareUrl = `${window.location.origin}#post-${post.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#120E22] border border-purple-500/25 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Share Moment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Preview Miniature */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/30">
          {post.mediaUrls?.[0] ? (
            <img
              src={post.mediaUrls[0]}
              alt="Media thumbnail"
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">@{post.authorUsername}</p>
            <p className="text-[11px] text-purple-200/60 truncate mt-0.5">{post.caption}</p>
          </div>
        </div>

        {/* Link copying box */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-950/60 border border-purple-800/40">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 text-xs text-purple-200 truncate focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Send to Chat */}
        {onSendToChat && (
          <button
            onClick={() => {
              onSendToChat(post.id);
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Send in Direct Message</span>
          </button>
        )}
      </div>
    </div>
  );
};
