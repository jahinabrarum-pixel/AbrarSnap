import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, Lock, Globe, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AccentColor } from '../types';

interface EditProfilePageProps {
  onBack: () => void;
  onSaved: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
];

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
];

export const EditProfilePage: React.FC<EditProfilePageProps> = ({ onBack, onSaved }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { accentColor, setAccentColor } = useTheme();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [website, setWebsite] = useState(userProfile?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatarUrl || AVATAR_PRESETS[0]);
  const [coverUrl, setCoverUrl] = useState(userProfile?.coverUrl || COVER_PRESETS[0]);
  const [isPrivate, setIsPrivate] = useState(userProfile?.isPrivate || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
        bio: bio.trim(),
        website: website.trim(),
        avatarUrl,
        coverUrl,
        isPrivate,
        accentColor,
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const accentOptions: { key: AccentColor; label: string; colorClass: string }[] = [
    { key: 'violet', label: 'Violet', colorClass: 'bg-purple-600' },
    { key: 'cyan', label: 'Electric Cyan', colorClass: 'bg-cyan-500' },
    { key: 'emerald', label: 'Emerald Glow', colorClass: 'bg-emerald-500' },
    { key: 'rose', label: 'Rose Gold', colorClass: 'bg-pink-500' },
    { key: 'amber', label: 'Sunset Amber', colorClass: 'bg-amber-500' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 select-none">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
          Edit Profile
        </h2>

        <div className="w-16" />
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Cover Preview & Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-purple-200">Cover Banner</label>
          <div className="h-36 w-full rounded-2xl overflow-hidden relative border border-purple-500/20">
            <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            {COVER_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCoverUrl(preset)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-transform ${
                  coverUrl === preset ? 'border-pink-500 scale-105' : 'border-transparent opacity-70'
                }`}
              >
                <img src={preset} alt={`cover ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Preview & Presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-purple-200">Avatar Photo</label>
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500"
            />
            <div className="flex items-center gap-2">
              {AVATAR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-transform ${
                    avatarUrl === preset ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={preset} alt={`avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="text-xs font-semibold text-purple-200 mb-1.5 block">
            Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-semibold text-purple-200 mb-1.5 block">
            Username
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-purple-200 mb-1.5 block">
            Bio
          </label>
          <textarea
            rows={3}
            maxLength={280}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your creative mission..."
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
          />
        </div>

        {/* Website */}
        <div>
          <label className="text-xs font-semibold text-purple-200 mb-1.5 block">
            Website URL
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourportfolio.art"
            className="w-full bg-purple-950/40 border border-purple-800/40 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Accent Color Customizer */}
        <div>
          <label className="text-xs font-semibold text-purple-200 mb-2 block">
            Platform Accent Theme
          </label>
          <div className="flex items-center gap-3">
            {accentOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccentColor(opt.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  accentColor === opt.key
                    ? 'border-white bg-white/10 text-white'
                    : 'border-transparent text-purple-300/60 hover:text-white'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full ${opt.colorClass}`} />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Private Account Setting */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30">
          <div>
            <p className="text-xs font-bold text-white">Private Account</p>
            <p className="text-[11px] text-purple-200/60">
              When private, only users you approve can view your posts and reels.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              isPrivate ? 'bg-pink-500' : 'bg-purple-900/60'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isPrivate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
