import React, { useState } from 'react';
import { ReelViewer } from '../components/reels/ReelViewer';
import { Reel } from '../types';
import { Sparkles, Plus, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createReel } from '../firebase/services';

interface ReelsPageProps {
  reels: Reel[];
  onOpenComments?: (reel: Reel) => void;
  onOpenShare?: (reel: Reel) => void;
  onSelectUser?: (username: string) => void;
  onReelCreated?: (reel: Reel) => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({
  reels,
  onOpenComments,
  onOpenShare,
  onSelectUser,
  onReelCreated,
}) => {
  const { userProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-lights-at-night-42861-large.mp4');
  const [caption, setCaption] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || !userProfile || publishing) return;
    setPublishing(true);

    try {
      const created = await createReel({
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        authorDisplayName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl,
        videoUrl,
        caption: caption.trim(),
        musicTitle: musicTitle.trim() || 'AbrarSnap Original Audio',
        tags: ['reels', 'creative'],
        createdAt: new Date().toISOString(),
      });
      if (onReelCreated) onReelCreated(created);
      setShowCreateModal(false);
      setCaption('');
      setMusicTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 px-2 flex flex-col items-center justify-center">
      {/* Top action bar */}
      <div className="w-full max-w-md flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            AbrarSnap Reels
          </h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md shadow-purple-600/30 hover:scale-105 transition-transform cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Reel</span>
        </button>
      </div>

      {/* Reel Vertical Carousel */}
      <ReelViewer
        reels={reels}
        onOpenComments={onOpenComments}
        onOpenShare={onOpenShare}
        onSelectUser={onSelectUser}
      />

      {/* Create Reel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-md bg-[#120E22] border border-purple-500/25 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Publish Short Reel
            </h3>

            <form onSubmit={handleCreateReel} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
                  Video URL (MP4)
                </label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
                  Reel Caption
                </label>
                <textarea
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Tell your viewers what makes this reel unique..."
                  className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
                  Music / Audio Track Title
                </label>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="e.g. Kai Vance — Ambient Synthetics"
                  className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-purple-300/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-xs shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Publish Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
