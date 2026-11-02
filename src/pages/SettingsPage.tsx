import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Shield,
  Bell,
  Lock,
  Download,
  LogOut,
  Palette,
  Volume2,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AccentColor } from '../types';

export const SettingsPage: React.FC = () => {
  const { userProfile, logout, updateUserProfile } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();

  const [privateAccount, setPrivateAccount] = useState(userProfile?.isPrivate || false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [mentionSetting, setMentionSetting] = useState<'everyone' | 'following' | 'none'>('everyone');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleTogglePrivate = async () => {
    const next = !privateAccount;
    setPrivateAccount(next);
    await updateUserProfile({ isPrivate: next });
    triggerNotice();
  };

  const triggerNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const accentOptions: { key: AccentColor; label: string; colorClass: string }[] = [
    { key: 'violet', label: 'Violet', colorClass: 'bg-purple-600' },
    { key: 'cyan', label: 'Electric Cyan', colorClass: 'bg-cyan-500' },
    { key: 'emerald', label: 'Emerald Glow', colorClass: 'bg-emerald-500' },
    { key: 'rose', label: 'Rose Gold', colorClass: 'bg-pink-500' },
    { key: 'amber', label: 'Sunset Amber', colorClass: 'bg-amber-500' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4 flex flex-col gap-6 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-pink-400" />
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
            Settings & Preferences
          </h2>
        </div>
        {savedNotice && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      {/* Appearance Section */}
      <div className="p-5 rounded-3xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Appearance & Aesthetic
          </h3>
        </div>

        {/* Theme Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">Color Mode</p>
            <p className="text-[11px] text-purple-200/50">
              Switch between Midnight Violet Dark and Clean Light
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-purple-950/40 border border-purple-800/30">
            <button
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                theme === 'dark' ? 'bg-purple-600 text-white' : 'text-purple-300/60'
              }`}
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                theme === 'light' ? 'bg-purple-600 text-white' : 'text-purple-300/60'
              }`}
            >
              <Sun className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Accent Selector */}
        <div className="pt-2 border-t border-purple-900/20">
          <p className="text-xs font-bold text-white mb-2">Accent Hue</p>
          <div className="flex flex-wrap gap-2">
            {accentOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setAccentColor(opt.key);
                  triggerNotice();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  accentColor === opt.key
                    ? 'border-white bg-white/10 text-white'
                    : 'border-transparent text-purple-300/60 hover:text-white'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${opt.colorClass}`} />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Safety Section */}
      <div className="p-5 rounded-3xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Privacy & Permissions
          </h3>
        </div>

        {/* Private Account Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">Private Account</p>
            <p className="text-[11px] text-purple-200/50">
              Only approved followers will be able to see your media.
            </p>
          </div>
          <button
            onClick={handleTogglePrivate}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              privateAccount ? 'bg-pink-500' : 'bg-purple-900/60'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                privateAccount ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">Show Activity Status</p>
            <p className="text-[11px] text-purple-200/50">
              Allow accounts you follow to see when you are active on AbrarSnap.
            </p>
          </div>
          <button
            onClick={() => {
              setOnlineStatus(!onlineStatus);
              triggerNotice();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              onlineStatus ? 'bg-pink-500' : 'bg-purple-900/60'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                onlineStatus ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mentions permission */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">Allow Mentions & Tags</p>
            <p className="text-[11px] text-purple-200/50">Choose who can tag your profile</p>
          </div>
          <select
            value={mentionSetting}
            onChange={(e) => {
              setMentionSetting(e.target.value as any);
              triggerNotice();
            }}
            className="bg-purple-950/60 border border-purple-800/40 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="everyone">Everyone</option>
            <option value="following">People You Follow</option>
            <option value="none">No One</option>
          </select>
        </div>
      </div>

      {/* Notifications & Sound */}
      <div className="p-5 rounded-3xl bg-[#120E22]/80 border border-purple-900/25 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Notifications & Sound
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">Push Notifications</p>
            <p className="text-[11px] text-purple-200/50">Receive alerts for likes, comments, and messages</p>
          </div>
          <button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              triggerNotice();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-pink-500' : 'bg-purple-900/60'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-purple-900/20">
          <div>
            <p className="text-xs font-bold text-white">In-App Audio Haptics</p>
            <p className="text-[11px] text-purple-200/50">Play subtle tones on like, send, and notification</p>
          </div>
          <button
            onClick={() => {
              setSounds(!sounds);
              triggerNotice();
            }}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              sounds ? 'bg-pink-500' : 'bg-purple-900/60'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                sounds ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data & Sign Out */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-purple-950/20 border border-purple-900/30">
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile || {}, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `abrarsnap_${userProfile?.username || 'user'}_archive.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Data Archive</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
