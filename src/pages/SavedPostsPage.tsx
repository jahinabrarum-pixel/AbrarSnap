import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getSavedPostsForUser } from '../firebase/services';
import { EmptyState } from '../components/branding/EmptyStates';
import { formatNumber } from '../utils/formatters';

interface SavedPostsPageProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onExplorePosts: () => void;
}

export const SavedPostsPage: React.FC<SavedPostsPageProps> = ({
  posts,
  onSelectPost,
  onExplorePosts,
}) => {
  const { userProfile } = useAuth();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    getSavedPostsForUser(userProfile.uid).then((res) => {
      setSavedPosts(res || []);
      setLoading(false);
    });
  }, [userProfile]);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 sm:px-6 flex flex-col gap-5 select-none">
      <div className="flex items-center gap-2">
        <Bookmark className="w-5 h-5 text-pink-400" />
        <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
          Saved Moments & Collections
        </h2>
      </div>

      {savedPosts.length === 0 ? (
        <EmptyState
          type="saved"
          title="No saved moments yet"
          description="Tap the bookmark icon on any post or reel to build your personal inspiration archive."
          actionText="Explore Feed"
          onAction={onExplorePosts}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="relative aspect-square rounded-2xl overflow-hidden group bg-purple-950/40 border border-purple-900/30 cursor-pointer"
            >
              <img
                src={post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                alt="Saved post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                <span>❤️ {formatNumber(post.likesCount)}</span>
                <span>💬 {formatNumber(post.commentsCount)}</span>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white/90 backdrop-blur-md">
                @{post.authorUsername}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
