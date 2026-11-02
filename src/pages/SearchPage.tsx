import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Hash, User, TrendingUp, X } from 'lucide-react';
import { UserProfile, Post } from '../types';
import { searchUsers } from '../firebase/services';
import { EmptyState } from '../components/branding/EmptyStates';

interface SearchPageProps {
  onSelectUser: (user: UserProfile) => void;
  onSelectTag: (tag: string) => void;
  posts: Post[];
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onSelectUser,
  onSelectTag,
  posts,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'accounts' | 'tags'>('all');
  const [creators, setCreators] = useState<UserProfile[]>([]);

  useEffect(() => {
    searchUsers(query).then((res) => {
      setCreators(res);
    });
  }, [query]);

  const popularTags = [
    { name: '#AbrarSnap', posts: 'Moments' },
    { name: '#MidnightViolet', posts: 'Theme' },
    { name: '#MinimalArchitecture', posts: 'Explore' },
    { name: '#VisualDesign', posts: 'Design' },
    { name: '#CreativeWorld', posts: 'Vision' },
  ];

  const filteredCreators = creators;

  const filteredTags = popularTags.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-3 sm:px-4 flex flex-col gap-5 select-none">
      {/* Search Input Bar */}
      <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-[#120E22] border border-purple-500/25 shadow-lg">
        <Search className="w-5 h-5 text-purple-400 ml-2 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, hashtags, or aesthetic themes..."
          className="w-full bg-transparent text-sm text-white placeholder-purple-300/40 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded-full text-purple-300 hover:text-white hover:bg-white/10 mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterType === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          All Results
        </button>
        <button
          onClick={() => setFilterType('accounts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterType === 'accounts'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          Creators
        </button>
        <button
          onClick={() => setFilterType('tags')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterType === 'tags'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          Hashtags
        </button>
      </div>

      {/* Creators Results */}
      {(filterType === 'all' || filterType === 'accounts') && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Creators</span>
          </div>

          <div className="space-y-1.5">
            {filteredCreators.length === 0 ? (
              <p className="text-xs text-purple-300/50 p-3 text-center">No creators matched.</p>
            ) : (
              filteredCreators.map((creator) => (
                <div
                  key={creator.uid}
                  onClick={() => onSelectUser(creator)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#120E22]/60 hover:bg-white/5 border border-purple-900/20 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-400 transition-all"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {creator.displayName}
                        </p>
                        {creator.isVerified && (
                          <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-purple-300/60 truncate">@{creator.username}</p>
                      {creator.bio && (
                        <p className="text-[11px] text-purple-200/50 truncate mt-0.5">{creator.bio}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-pink-400 font-semibold px-3 py-1 rounded-full bg-pink-500/10 shrink-0">
                    View
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hashtags Results */}
      {(filterType === 'all' || filterType === 'tags') && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center gap-2 px-1 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Hash className="w-3.5 h-3.5 text-pink-400" />
            <span>Trending Hashtags</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => onSelectTag(tag.name)}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#120E22]/60 hover:bg-white/5 border border-purple-900/20 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                    {tag.name}
                  </p>
                  <p className="text-[11px] text-purple-300/40">{tag.posts} moments</p>
                </div>
                <TrendingUp className="w-3.5 h-3.5 text-pink-400/60 group-hover:text-pink-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
