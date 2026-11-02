import React, { useState } from 'react';
import { X, Sparkles, Image, Check, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createStory } from '../../firebase/services';
import { Story } from '../../types';

interface CreateStoryModalProps {
  onClose: () => void;
  onStoryCreated: (story: Story) => void;
}

const TEMPLATE_PRESETS = [
  {
    name: 'Kyoto Twilights',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    accent: '#A855F7',
  },
  {
    name: 'Neon Cyber',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    accent: '#EC4899',
  },
  {
    name: 'Monolith Minimal',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    accent: '#8B5CF6',
  },
  {
    name: 'Velvet Sunset',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    accent: '#F59E0B',
  },
];

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  onClose,
  onStoryCreated,
}) => {
  const { userProfile } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState(TEMPLATE_PRESETS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [accentColor, setAccentColor] = useState(TEMPLATE_PRESETS[0].accent);
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
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setCustomUrl(compressed);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const activeMediaUrl = customUrl.trim() || selectedUrl;

  const handlePublish = async () => {
    if (!userProfile || !activeMediaUrl || publishing) return;
    setPublishing(true);

    try {
      const created = await createStory({
        authorId: userProfile.uid,
        authorUsername: userProfile.username,
        authorDisplayName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || '',
        mediaUrl: activeMediaUrl,
        mediaType: 'image',
        caption: caption.trim() || '',
        accentColor,
        createdAt: new Date().toISOString(),
      });
      onStoryCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#120E22] border border-purple-500/25 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Create 24h Story
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black/60 border border-purple-500/30 flex items-center justify-center">
          <img
            src={activeMediaUrl}
            alt="Story Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* User badge preview */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <img
              src={userProfile?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=creator'}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-400"
            />
            <span className="text-xs font-bold text-white drop-shadow">
              {userProfile?.displayName}
            </span>
          </div>

          {caption && (
            <p className="absolute bottom-3 inset-x-3 text-xs text-white bg-black/50 p-2 rounded-xl backdrop-blur-md truncate">
              {caption}
            </p>
          )}
        </div>

        {/* Preset Aesthetic Templates */}
        <div>
          <label className="text-xs font-semibold text-purple-200/80 mb-2 block">
            Choose Aesthetic Backdrop
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TEMPLATE_PRESETS.map((t) => {
              const isSelected = selectedUrl === t.url && !customUrl.trim();
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedUrl(t.url);
                    setAccentColor(t.accent);
                    setCustomUrl('');
                  }}
                  className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-pink-500 scale-105 shadow-md shadow-pink-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={t.url} alt={t.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-purple-900/40 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Image URL Option */}
        <div>
          <label className="text-xs font-semibold text-purple-200/80 mb-1.5 block">
            Or Paste Custom Image URL
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Caption */}
        <div>
          <label className="text-xs font-semibold text-purple-200/80 mb-1.5 block">
            Story Caption
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={160}
            placeholder="Add an evocative moment caption..."
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Publish Action */}
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {publishing ? 'Publishing Story...' : 'Publish to Your Story'}
        </button>
      </div>
    </div>
  );
};
