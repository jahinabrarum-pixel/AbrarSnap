import React, { useState, useEffect } from 'react';
import { X, Sparkles, UserCheck, Plus } from 'lucide-react';
import { UserProfile } from '../../types';
import { toggleFollowUser, getUserFollowers, getUserFollowing, isFollowing } from '../../firebase/services';
import { useAuth } from '../../contexts/AuthContext';

interface FollowersModalProps {
  user: UserProfile;
  initialTab?: 'followers' | 'following';
  onClose: () => void;
  onSelectUser?: (user: UserProfile) => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  user,
  initialTab = 'followers',
  onClose,
  onSelectUser,
}) => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [list, setList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const fetchFunc = activeTab === 'followers' ? getUserFollowers : getUserFollowing;
    fetchFunc(user.uid).then(async (users) => {
      if (!isMounted) return;
      setList(users);
      setLoading(false);

      if (userProfile) {
        const statuses: Record<string, boolean> = {};
        for (const u of users) {
          if (u.uid !== userProfile.uid) {
            statuses[u.uid] = await isFollowing(userProfile.uid, u.uid);
          }
        }
        if (isMounted) {
          setFollowedMap(statuses);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user.uid, activeTab, userProfile]);

  const handleFollowToggle = async (targetId: string) => {
    if (!userProfile) return;
    const current = !!followedMap[targetId];
    setFollowedMap((prev) => ({ ...prev, [targetId]: !current }));
    await toggleFollowUser(userProfile.uid, targetId, current, {
      username: userProfile.username,
      avatarUrl: userProfile.avatarUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm max-h-[80vh] bg-[#120E22] border border-purple-500/25 rounded-3xl p-5 shadow-2xl flex flex-col">
        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('followers')}
              className={`text-sm font-bold font-['Space_Grotesk'] pb-1 transition-colors cursor-pointer ${
                activeTab === 'followers'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-purple-300/50 hover:text-purple-200'
              }`}
            >
              Followers ({user.followersCount})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`text-sm font-bold font-['Space_Grotesk'] pb-1 transition-colors cursor-pointer ${
                activeTab === 'following'
                  ? 'text-white border-b-2 border-pink-500'
                  : 'text-purple-300/50 hover:text-purple-200'
              }`}
            >
              Following ({user.followingCount})
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-purple-300/50">
              Loading {activeTab}...
            </div>
          ) : list.length === 0 ? (
            <div className="py-8 text-center text-xs text-purple-300/50">
              {activeTab === 'followers'
                ? 'No followers yet.'
                : 'Not following anyone yet.'}
            </div>
          ) : (
            list.map((creator) => {
              const isFollowingUser = !!followedMap[creator.uid];

              return (
                <div
                  key={creator.uid}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  <div
                    onClick={() => {
                      if (onSelectUser) onSelectUser(creator);
                      onClose();
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <img
                      src={creator.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                      alt={creator.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-500/30"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-white truncate hover:underline">
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

                  {userProfile && creator.uid !== userProfile.uid && (
                    <button
                      onClick={() => handleFollowToggle(creator.uid)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
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
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
