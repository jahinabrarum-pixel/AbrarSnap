import React, { useState } from 'react';
import { Post, Reel } from '../types';
import { Sparkles, Play, Heart, MessageCircle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import { EmptyState } from '../components/branding/EmptyStates';

interface ExplorePageProps {
  posts: Post[];
  reels: Reel[];
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
  onSelectTag?: (tag: string) => void;
}

const CATEGORIES = ['All', 'Architecture', 'Visual Art', 'Music & Sound', 'Editorial', 'Cyber'];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  posts,
  reels,
  onSelectPost,
  onSelectReel,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Media pool
  const exploreItems = posts.flatMap((p) =>
    (p.mediaUrls || []).map((url, i) => ({
      id: `${p.id}_${i}`,
      post: p,
      url,
      type: p.mediaTypes?.[i] || 'image',
      likes: p.likesCount,
      comments: p.commentsCount,
    }))
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-3 sm:px-6 flex flex-col gap-5 select-none">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-purple-950/40 text-purple-300/70 hover:text-white border border-purple-900/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {exploreItems.length === 0 ? (
        <EmptyState
          type="feed"
          title="Nothing to explore yet"
          description="Moments published across the community will be showcased here."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {exploreItems.map((item, idx) => {
            // Every 5th item can be featured larger or highlighted
            const isFeatured = idx % 5 === 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectPost(item.post)}
                className={`relative rounded-2xl overflow-hidden group bg-purple-950/30 border border-purple-900/30 cursor-pointer ${
                  isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                }`}
              >
                <img
                  src={item.url}
                  alt="Explore item"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Hover overlay with likes & comments */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 text-white font-bold text-xs backdrop-blur-xs">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-white" />
                    {formatNumber(item.likes)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 fill-white" />
                    {formatNumber(item.comments)}
                  </span>
                </div>

                {/* Creator handle chip */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white/90 backdrop-blur-md opacity-80 group-hover:opacity-100">
                  @{item.post.authorUsername}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
