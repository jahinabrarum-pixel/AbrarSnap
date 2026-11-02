import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Plus,
} from 'lucide-react';
import { Reel } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { toggleReelLike, togglePostSave, toggleFollowUser } from '../../firebase/services';

interface ReelViewerProps {
  reels: Reel[];
  onOpenComments?: (reel: Reel) => void;
  onOpenShare?: (reel: Reel) => void;
  onSelectUser?: (username: string) => void;
}

export const ReelViewer: React.FC<ReelViewerProps> = ({
  reels,
  onOpenComments,
  onOpenShare,
  onSelectUser,
}) => {
  const { userProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [followedMap, setFollowedMap] = useState<Record<string, boolean>>({});
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentReel = reels[currentIndex];

  const handleLike = async () => {
    if (!currentReel || !userProfile) return;
    const isCurrentlyLiked = !!likedMap[currentReel.id];
    const newLiked = !isCurrentlyLiked;
    setLikedMap((prev) => ({ ...prev, [currentReel.id]: newLiked }));
    setLikesCountMap((prev) => ({
      ...prev,
      [currentReel.id]: (prev[currentReel.id] ?? currentReel.likesCount) + (newLiked ? 1 : -1),
    }));
    await toggleReelLike(
      currentReel.id,
      userProfile.uid,
      isCurrentlyLiked,
      currentReel.authorId,
      { username: userProfile.username, avatarUrl: userProfile.avatarUrl }
    );
  };

  const handleDoubleTap = () => {
    if (!likedMap[currentReel.id]) {
      handleLike();
    }
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleSave = async () => {
    if (!currentReel || !userProfile) return;
    const isCurrentlySaved = !!savedMap[currentReel.id];
    setSavedMap((prev) => ({ ...prev, [currentReel.id]: !isCurrentlySaved }));
    await togglePostSave(currentReel.id, userProfile.uid, isCurrentlySaved);
  };

  const handleToggleFollow = async () => {
    if (!currentReel || !userProfile) return;
    const isCurrentlyFollowed = !!followedMap[currentReel.authorId];
    setFollowedMap((prev) => ({ ...prev, [currentReel.authorId]: !isCurrentlyFollowed }));
    await toggleFollowUser(
      userProfile.uid,
      currentReel.authorId,
      isCurrentlyFollowed,
      { username: userProfile.username, avatarUrl: userProfile.avatarUrl }
    );
  };

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  if (!currentReel) {
    return (
      <div className="py-24 text-center text-purple-300/60 text-sm">
        No reels available at this moment.
      </div>
    );
  }

  const isLiked = !!likedMap[currentReel.id];
  const likesCount = likesCountMap[currentReel.id] ?? currentReel.likesCount;
  const isSaved = !!savedMap[currentReel.id];
  const isFollowed = !!followedMap[currentReel.authorId];

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto h-[86vh] max-h-[800px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-purple-500/20 select-none flex items-center justify-center">
      {/* Background Video */}
      <video
        ref={videoRef}
        key={currentReel.id}
        src={currentReel.videoUrl}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        onClick={handleTogglePlay}
        onDoubleClick={handleDoubleTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Heart Burst on Double Tap */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
          <Heart className="w-28 h-28 text-pink-500 fill-pink-500 drop-shadow-2xl" />
        </div>
      )}

      {/* Play/Pause Center Indicator */}
      {!isPlaying && (
        <div
          onClick={handleTogglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 cursor-pointer"
        >
          <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
            <Play className="w-10 h-10 fill-white" />
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>AbrarSnap Reels</span>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Right Action Bar */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-20">
        {/* Author Avatar with quick follow plus */}
        <div className="relative mb-2">
          <img
            src={currentReel.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
            alt={currentReel.authorDisplayName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-500"
          />
          <button
            onClick={handleToggleFollow}
            className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isFollowed ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'
            }`}
          >
            {isFollowed ? <UserCheck className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        </div>

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Heart
              className={`w-6 h-6 transition-transform group-active:scale-125 ${
                isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'
              }`}
            />
          </div>
          <span className="text-[11px] font-bold drop-shadow">{formatNumber(likesCount)}</span>
        </button>

        {/* Comments */}
        <button
          onClick={() => onOpenComments && onOpenComments(currentReel)}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {formatNumber(currentReel.commentsCount)}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={() => onOpenShare && onOpenShare(currentReel)}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-bold drop-shadow">
            {formatNumber(currentReel.sharesCount)}
          </span>
        </button>

        {/* Save */}
        <button
          onClick={handleToggleSave}
          className="flex flex-col items-center gap-1 text-white group cursor-pointer"
        >
          <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-black/60 transition-colors">
            <Bookmark
              className={`w-6 h-6 transition-transform group-active:scale-125 ${
                isSaved ? 'text-pink-400 fill-pink-400' : 'text-white'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Bottom Creator Meta & Caption */}
      <div className="absolute bottom-4 left-4 right-16 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <span
            onClick={() => onSelectUser && onSelectUser(currentReel.authorUsername)}
            className="text-sm font-bold text-white drop-shadow hover:underline cursor-pointer"
          >
            @{currentReel.authorUsername}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        </div>

        <p className="text-xs text-white/90 drop-shadow line-clamp-2 leading-relaxed">
          {currentReel.caption}
        </p>

        {/* Music Marquee */}
        {currentReel.musicTitle && (
          <div className="flex items-center gap-2 text-[11px] text-purple-200/90 drop-shadow pointer-events-auto mt-0.5">
            <Music2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
            <span className="truncate">{currentReel.musicTitle}</span>
          </div>
        )}
      </div>

      {/* Vertical Navigation Buttons */}
      <div className="hidden lg:flex flex-col gap-2 absolute -right-14 top-1/2 -translate-y-1/2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-white disabled:opacity-30 hover:bg-purple-800/80 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className="p-2.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-white disabled:opacity-30 hover:bg-purple-800/80 transition-colors cursor-pointer"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
