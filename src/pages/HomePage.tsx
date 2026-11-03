import React, { useState } from 'react';
import { StoriesBar } from '../components/feed/StoriesBar';
import { PostCard } from '../components/feed/PostCard';
import { EmptyState } from '../components/branding/EmptyStates';
import { Post, Story } from '../types';
import { Sparkles, PlusSquare, Flame, Clock, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { getFollowingIds } from '../firebase/services';

interface HomePageProps {
  posts: Post[];
  stories: Story[];
  onOpenCreatePost: () => void;
  onOpenCreateStory: () => void;
  onSelectStory: (story: Story, index: number) => void;
  onOpenComments: (post: Post) => void;
  onOpenShare: (post: Post) => void;
  onOpenReport: (postId: string, type: 'post') => void;
  onSelectTag?: (tag: string) => void;
  onPostDeleted?: (postId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  posts,
  stories,
  onOpenCreatePost,
  onOpenCreateStory,
  onSelectStory,
  onOpenComments,
  onOpenShare,
  onOpenReport,
  onSelectTag,
  onPostDeleted,
}) => {
  const { userProfile } = useAuth();
  const [feedFilter, setFeedFilter] = useState<'for_you' | 'following' | 'trending'>('for_you');
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  React.useEffect(() => {
    if (userProfile?.uid) {
      getFollowingIds(userProfile.uid).then(setFollowingIds);
    }
  }, [userProfile?.uid]);

  // Filter & sort posts based on selected tab
  const filteredPosts = posts
    .filter((p) => {
      if (feedFilter === 'following') {
        if (!userProfile) return true;
        return followingIds.includes(p.authorId) || p.authorId === userProfile.uid;
      }
      return true;
    })
    .sort((a, b) => {
      if (feedFilter === 'trending') {
        return (b.likesCount || 0) - (a.likesCount || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-2 sm:px-4 flex flex-col gap-5">
      {/* Stories Bar */}
      <div className="p-3 bg-[#120E22]/60 backdrop-blur-xl border border-purple-900/20 rounded-3xl shadow-lg">
        <StoriesBar
          stories={stories}
          onSelectStory={onSelectStory}
          onOpenCreateStory={onOpenCreateStory}
        />
      </div>

      {/* Quick Create Prompt Teaser */}
      <div
        onClick={onOpenCreatePost}
        className="flex items-center gap-3 p-3.5 bg-[#120E22]/80 backdrop-blur-xl border border-purple-900/25 hover:border-purple-500/40 rounded-3xl shadow-md cursor-pointer transition-all group"
      >
        <img
          src={userProfile?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
          alt="Avatar"
          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
        />
        <div className="flex-1 bg-purple-950/40 rounded-2xl px-4 py-2 text-xs text-purple-300/60 group-hover:text-purple-200 transition-colors">
          Share your latest moment, design, or vision...
        </div>
        <div className="p-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
          <PlusSquare className="w-4 h-4" />
        </div>
      </div>

      {/* Feed Filter Pill Bar */}
      <div className="flex items-center justify-center gap-2 p-1 bg-purple-950/30 border border-purple-900/20 rounded-2xl self-center">
        <button
          onClick={() => setFeedFilter('for_you')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            feedFilter === 'for_you'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>For You</span>
        </button>
        <button
          onClick={() => setFeedFilter('following')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            feedFilter === 'following'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Following</span>
        </button>
        <button
          onClick={() => setFeedFilter('trending')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            feedFilter === 'trending'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-purple-300/60 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Trending</span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <EmptyState
            type="feed"
            title="No moments in this stream"
            description="Be the first to share an inspiring visual creation or switch to the For You stream."
            actionText="Create Moment"
            onAction={onOpenCreatePost}
          />
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={onOpenComments}
              onOpenShare={onOpenShare}
              onOpenReport={onOpenReport}
              onSelectTag={onSelectTag}
              onPostDeleted={onPostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};
