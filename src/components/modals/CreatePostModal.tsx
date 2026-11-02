import React, { useState } from 'react';
import { X, Image, Video, Plus, Trash2, MapPin, Globe, Users, Lock, Sparkles, Hash, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createNewPost } from '../../firebase/services';
import { Post } from '../../types';
import { extractHashtags } from '../../utils/formatters';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

const SAMPLE_MEDIA_PRESETS = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onPostCreated,
}) => {
  const { userProfile } = useAuth();
  const [caption, setCaption] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([SAMPLE_MEDIA_PRESETS[0]]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [publishing, setPublishing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setMediaUrls((prev) => [...prev, compressedDataUrl]);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddMedia = () => {
    if (!newUrlInput.trim()) return;
    setMediaUrls((prev) => [...prev, newUrlInput.trim()]);
    setNewUrlInput('');
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectPreset = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls((prev) => [...prev, url]);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || !userProfile || publishing) return;
    setPublishing(true);

    try {
      const tags = extractHashtags(caption);
      const postPayload: any = {
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        authorDisplayName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || '',
        caption: caption.trim(),
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : [],
        mediaTypes: mediaUrls.map(() => 'image'),
        tags,
        visibility,
        createdAt: new Date().toISOString(),
      };
      if (location.trim()) {
        postPayload.location = location.trim();
      }

      const post = await createNewPost(postPayload);

      onPostCreated(post);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#120E22] border border-purple-500/25 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Create New Moment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="flex items-center gap-3">
          <img
            src={userProfile?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40"
          />
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              {userProfile?.displayName}
            </h4>
            {/* Visibility Selector */}
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  visibility === 'public'
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                    : 'text-purple-300/60 hover:text-purple-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('followers')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  visibility === 'followers'
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40'
                    : 'text-purple-300/60 hover:text-purple-200'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Caption Textarea */}
        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              maxLength={2200}
              placeholder="What are you creating or exploring today? Use #tags for discovery..."
              className="w-full bg-purple-950/30 border border-purple-800/30 rounded-2xl p-4 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 leading-relaxed resize-none"
            />
          </div>

          {/* Location Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-950/30 border border-purple-800/30 rounded-xl">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (e.g. Tokyo, Copenhagen, Paris)"
              className="flex-1 bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
            />
          </div>

          {/* Media Carousel Preview & Management */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-purple-200/80">
                Media Attachments ({mediaUrls.length})
              </label>
              <span className="text-[11px] text-purple-300/40">Multiple images form a carousel</span>
            </div>

            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-3">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-purple-500/30">
                    <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Device Upload or URL Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
              <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-white text-xs font-semibold cursor-pointer transition-colors border border-purple-500/30 shrink-0">
                <Upload className="w-3.5 h-3.5 text-pink-400" />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="url"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="flex-1 bg-purple-950/30 border border-purple-800/30 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddMedia}
                  className="px-3 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add URL</span>
                </button>
              </div>
            </div>

            {/* Quick Pick Presets */}
            <div>
              <p className="text-[11px] text-purple-300/50 mb-1.5">Quick aesthetic presets:</p>
              <div className="flex items-center gap-2">
                {SAMPLE_MEDIA_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-purple-500/30 hover:scale-105 transition-transform cursor-pointer"
                  >
                    <img src={preset} alt={`preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl hover:bg-white/5 text-purple-300/80 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!caption.trim() || publishing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {publishing ? 'Publishing...' : 'Share Moment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
