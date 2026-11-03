import React, { useEffect, useState, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Story } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { recordStoryView, createNotification } from '../../firebase/services';
import { useAuth } from '../../contexts/AuthContext';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const { userProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const timerRef = useRef<any>(null);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory || !userProfile) return;
    recordStoryView(currentStory.id, userProfile.uid);
  }, [currentIndex, currentStory, userProfile]);

  useEffect(() => {
    setProgress(0);
    if (isPaused) return;

    const intervalTime = 50; // 50ms ticks
    const totalTime = 5000; // 5 seconds per story
    const step = (intervalTime / totalTime) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReaction = (emoji: string) => {
    setReactionBurst(emoji);
    if (userProfile && currentStory && currentStory.authorId !== userProfile.uid) {
      createNotification({
        recipientId: currentStory.authorId,
        senderId: userProfile.uid,
        senderUsername: userProfile.username,
        senderAvatar: userProfile.avatarUrl || '',
        type: 'like',
        text: `reacted ${emoji} to your moment story`,
        targetId: currentStory.id,
        createdAt: new Date().toISOString(),
      });
    }
    setTimeout(() => setReactionBurst(null), 1000);
  };

  if (!currentStory) return null;

  const reactions = ['❤️', '🔥', '💜', '✨', '👏', '😮'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none animate-fade-in">
      {/* Background blur of the story */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125"
        style={{ backgroundImage: `url(${currentStory.mediaUrl})` }}
      />

      {/* Main Story Container (9:16 vertical ratio) */}
      <div
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between bg-black border border-purple-500/20"
      >
        {/* Story media */}
        <img
          src={currentStory.mediaUrl}
          alt={currentStory.caption || 'Story'}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Top Vignette Gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />
        {/* Bottom Vignette Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none" />

        {/* Reaction Burst */}
        {reactionBurst && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce text-6xl">
            {reactionBurst}
          </div>
        )}

        {/* Header Controls */}
        <div className="relative z-20 p-4 flex flex-col gap-3">
          {/* Progress Bars */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.authorAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
                alt={currentStory.authorDisplayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/60"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {currentStory.authorDisplayName}
                  </span>
                  <Sparkles className="w-3 h-3 text-pink-400" />
                </div>
                <span className="text-[10px] text-white/70">
                  {formatRelativeTime(currentStory.createdAt)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tap areas for Left & Right navigation */}
        <div className="absolute inset-y-24 inset-x-0 flex z-10">
          <div onClick={handlePrev} className="w-1/3 h-full cursor-pointer" />
          <div className="w-1/3 h-full" />
          <div onClick={handleNext} className="w-1/3 h-full cursor-pointer" />
        </div>

        {/* Bottom Interactive Area */}
        <div className="relative z-20 p-4 flex flex-col gap-3">
          {/* Caption */}
          {currentStory.caption && (
            <p className="text-xs text-white font-medium bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10 leading-relaxed">
              {currentStory.caption}
            </p>
          )}

          {/* Reaction Emojis */}
          <div className="flex items-center justify-around py-1">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-2xl hover:scale-130 active:scale-95 transition-transform duration-200 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.authorUsername}...`}
              className="flex-1 bg-white/15 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/60 focus:outline-none focus:bg-white/25 backdrop-blur-md"
            />
            {replyText.trim() && (
              <button
                onClick={() => {
                  const txt = replyText.trim();
                  setReactionBurst('💌');
                  setReplyText('');
                  if (userProfile && currentStory && currentStory.authorId !== userProfile.uid) {
                    createNotification({
                      recipientId: currentStory.authorId,
                      senderId: userProfile.uid,
                      senderUsername: userProfile.username,
                      senderAvatar: userProfile.avatarUrl || '',
                      type: 'comment',
                      text: `replied to your story: "${txt.slice(0, 50)}${txt.length > 50 ? '...' : ''}"`,
                      targetId: currentStory.id,
                      createdAt: new Date().toISOString(),
                    });
                  }
                  setTimeout(() => setReactionBurst(null), 1000);
                }}
                className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-400 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Prev / Next Buttons */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
