import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Grid,
  Clapperboard,
  Bookmark,
  Settings,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Lock,
  UserCheck,
  Plus,
} from 'lucide-react';
import { UserProfile, Post, Reel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FollowersModal } from '../components/modals/FollowersModal';
import { formatNumber } from '../utils/formatters';
import { toggleFollowUser, isFollowing as checkIsFollowing, getSavedPostsForUser } from '../firebase/services';

interface ProfilePageProps {
  user?: UserProfile;
  posts: Post[];
  reels: Reel[];
  onOpenEditProfile: () => void;
  onOpenSettings: () => void;
  onSelectPost: (post: Post) => void;
  onSelectReel: (reel: Reel) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  posts,
  reels,
  onOpenEditProfile,
  onOpenSettings,
  onSelectPost,
  onSelectReel,
}) => {
  const { userProfile: loggedInUser } = useAuth();
  const profile = user || loggedInUser;
  const isOwnProfile = !user || user.uid === loggedInUser?.uid;

  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [initialFollowersTab, setInitialFollowersTab] = useState<'followers' | 'following'>('followers');
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (loggedInUser && profile && loggedInUser.uid !== profile.uid) {
      checkIsFollowing(loggedInUser.uid, profile.uid).then(setIsFollowingUser);
    }
  }, [loggedInUser, profile]);

  useEffect(() => {
    if (activeTab === 'saved' && profile) {
      getSavedPostsForUser(profile.uid).then(setSavedPosts);
    }
  }, [activeTab, profile]);

  if (!profile) return null;

  const userPosts = posts.filter((p) => p.authorId === profile.uid || p.authorUsername === profile.username);
  const userReels = reels.filter((r) => r.authorId === profile.uid || r.authorUsername === profile.username);

  const handleToggleFollow = async () => {
    if (!loggedInUser) return;
    const nextState = !isFollowingUser;
    setIsFollowingUser(nextState);
    await toggleFollowUser(loggedInUser.uid, profile.uid, isFollowingUser, {
      username: loggedInUser.username,
      avatarUrl: loggedInUser.avatarUrl,
    });
  };

  const handleOpenFollowers = (tab: 'followers' | 'following') => {
    setInitialFollowersTab(tab);
    setShowFollowersModal(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2 sm:px-6 flex flex-col gap-6 select-none">
      {/* Profile Card Header */}
      <div className="relative rounded-3xl overflow-hidden bg-[#120E22]/80 border border-purple-900/25 shadow-xl">
        {/* Cover Banner */}
        <div className="h-40 sm:h-52 w-full overflow-hidden relative">
          <img
            src={
              profile.coverUrl ||
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
            }
            alt="Cover banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120E22] via-transparent to-black/30" />
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 flex flex-col gap-4 relative">
          {/* Avatar and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-2xl">
                <img
                  src={profile.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                  alt={profile.displayName}
                  className="w-full h-full rounded-full object-cover ring-4 ring-[#120E22]"
                />
              </div>
              {profile.isPrivate && (
                <div
                  title="Private Account"
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-purple-900 text-white ring-2 ring-[#120E22]"
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={onOpenEditProfile}
                    className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-purple-500/25 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-purple-500/25 text-white transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleToggleFollow}
                  className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isFollowingUser
                      ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                  }`}
                >
                  {isFollowingUser ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Name & Bio */}
          <div className="flex flex-col gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                  {profile.displayName}
                </h2>
                {profile.isVerified && (
                  <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                )}
                {profile.role === 'admin' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-500/30">
                    Staff
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-300/60 font-mono">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:underline font-semibold"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>

          {/* Followers, Following, Posts Statistics */}
          <div className="flex items-center gap-6 pt-3 border-t border-purple-900/20 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm">
                {formatNumber(userPosts.length || profile.postsCount || 0)}
              </span>
              <span className="text-purple-300/60">posts</span>
            </div>

            <button
              onClick={() => handleOpenFollowers('followers')}
              className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <span className="font-extrabold text-white text-sm">
                {formatNumber(profile.followersCount || 0)}
              </span>
              <span className="text-purple-300/60">followers</span>
            </button>

            <button
              onClick={() => handleOpenFollowers('following')}
              className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer"
            >
              <span className="font-extrabold text-white text-sm">
                {formatNumber(profile.followingCount || 0)}
              </span>
              <span className="text-purple-300/60">following</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center justify-center gap-6 border-b border-purple-900/20 text-xs font-bold font-['Space_Grotesk']">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 pb-3 transition-colors cursor-pointer ${
            activeTab === 'posts'
              ? 'text-white border-b-2 border-pink-500'
              : 'text-purple-300/50 hover:text-purple-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Moments ({userPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 pb-3 transition-colors cursor-pointer ${
            activeTab === 'reels'
              ? 'text-white border-b-2 border-pink-500'
              : 'text-purple-300/50 hover:text-purple-200'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span>Reels ({userReels.length})</span>
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 pb-3 transition-colors cursor-pointer ${
              activeTab === 'saved'
                ? 'text-white border-b-2 border-pink-500'
                : 'text-purple-300/50 hover:text-purple-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Grid Content Stream */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {userPosts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-purple-300/50">
              No moments uploaded yet.
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="relative aspect-square rounded-2xl overflow-hidden group bg-purple-950/40 border border-purple-900/30 cursor-pointer"
              >
                <img
                  src={post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt="Post preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                  <span>❤️ {formatNumber(post.likesCount)}</span>
                  <span>💬 {formatNumber(post.commentsCount)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reels' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {userReels.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-purple-300/50">
              No short video reels created yet.
            </div>
          ) : (
            userReels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => onSelectReel(reel)}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden group bg-black border border-purple-900/30 cursor-pointer"
              >
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-semibold truncate drop-shadow">
                  {reel.caption}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {savedPosts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-purple-300/50">
              No saved moments yet.
            </div>
          ) : (
            savedPosts.map((post) => (
              <div
                key={`saved_${post.id}`}
                onClick={() => onSelectPost(post)}
                className="relative aspect-square rounded-2xl overflow-hidden group bg-purple-950/40 border border-purple-900/30 cursor-pointer"
              >
                <img
                  src={post.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt="Saved post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ))
          )}
        </div>
      )}

      {showFollowersModal && (
        <FollowersModal
          user={profile}
          initialTab={initialFollowersTab}
          onClose={() => setShowFollowersModal(false)}
        />
      )}
    </div>
  );
};
