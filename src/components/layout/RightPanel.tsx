import React, { useState, useEffect } from 'react';
import { Sparkles, Users, TrendingUp, Plus, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toggleFollowUser, getAllUsers } from '../../firebase/services';
import { UserProfile } from '../../types';

interface RightPanelProps {
  onSelectUser?: (user: UserProfile) => void;
  onSelectTag?: (tag: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSelectUser, onSelectTag }) => {
  const { userProfile } = useAuth();
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getAllUsers().then((users) => {
      setSuggestedUsers(users.filter((u) => u.uid !== userProfile?.uid));
    });
  }, [userProfile]);

  const handleFollowToggle = async (targetId: string) => {
    if (!userProfile) return;
    const current = !!followedMap[targetId];
    setFollowedMap((prev) => ({ ...prev, [targetId]: !current }));
    await toggleFollowUser(userProfile.uid, targetId, current);
  };

  const trendingTags = [
    { tag: '#AbrarSnap', count: 'Original Moments', trending: true },
    { tag: '#MidnightViolet', count: 'Aesthetic Palette', trending: true },
    { tag: '#CreativeVision', count: 'Explore Ideas' },
    { tag: '#Photography', count: 'Captured Moments' },
  ];

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-80 h-screen sticky top-0 px-5 py-6 border-l border-purple-900/20 bg-[#0B0813]/60 backdrop-blur-md overflow-y-auto shrink-0 select-none">
      {/* Current User Quick Summary Card */}
      {userProfile && (
        <div
          onClick={() => onSelectUser && onSelectUser(userProfile)}
          className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/30 to-pink-900/10 border border-purple-500/20 shadow-lg flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={userProfile.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
            alt={userProfile.displayName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/40 group-hover:ring-purple-400 transition-all shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                {userProfile.displayName}
              </h4>
              {userProfile.isVerified && (
                <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              )}
            </div>
            <p className="text-xs text-purple-300/60 truncate font-mono">@{userProfile.username}</p>
          </div>
        </div>
      )}

      {/* Suggested Creators (Real from Firestore) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Community Creators
            </h4>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {suggestedUsers.length === 0 ? (
            <p className="text-xs text-purple-300/40 px-2 py-3">
              Connect with fellow creators as they join AbrarSnap.
            </p>
          ) : (
            suggestedUsers.slice(0, 5).map((creator) => {
              const isFollowingUser = !!followedMap[creator.uid];

              return (
                <div
                  key={creator.uid}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div
                    onClick={() => onSelectUser && onSelectUser(creator)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <img
                      src={creator.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                      alt={creator.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-purple-500/30"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {creator.displayName}
                        </p>
                        {creator.isVerified && (
                          <Sparkles className="w-3 h-3 text-pink-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-purple-200/50 truncate">
                        @{creator.username}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowToggle(creator.uid)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                      isFollowingUser
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                        : 'bg-white text-purple-950 hover:bg-purple-200'
                    }`}
                  >
                    {isFollowingUser ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="w-4 h-4 text-pink-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Explore Topics
          </h4>
        </div>

        <div className="flex flex-col gap-1">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              onClick={() => onSelectTag && onSelectTag(item.tag)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-left transition-colors cursor-pointer group"
            >
              <div>
                <p className="text-xs font-semibold text-purple-100 group-hover:text-purple-300 transition-colors">
                  {item.tag}
                </p>
                <p className="text-[11px] text-purple-200/40">{item.count}</p>
              </div>
              {item.trending && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-900/40 text-pink-400 border border-purple-500/20">
                  Trending
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-auto pt-6 border-t border-purple-900/20 text-center">
        <p className="text-[11px] text-purple-300/40">
          AbrarSnap © 2026 • Premium Social Platform
        </p>
        <p className="text-[10px] text-purple-300/30 mt-1">
          Capture moments. Create your world.
        </p>
      </div>
    </aside>
  );
};
