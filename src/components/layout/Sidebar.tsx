import React from 'react';
import {
  Home,
  Compass,
  Search,
  Clapperboard,
  Send,
  Heart,
  PlusSquare,
  Bookmark,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { Logo } from '../branding/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreatePost: () => void;
  unreadMessagesCount?: number;
  unreadNotifsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreatePost,
  unreadMessagesCount = 0,
  unreadNotifsCount = 0,
}) => {
  const { userProfile, isAdmin, logout } = useAuth();
  const { theme, setTheme, getAccentClasses } = useTheme();
  const accent = getAccentClasses();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'reels', label: 'Reels', icon: Clapperboard, badge: 'Hot' },
    { id: 'messages', label: 'Messages', icon: Send, count: unreadMessagesCount },
    { id: 'notifications', label: 'Notifications', icon: Heart, count: unreadNotifsCount },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      badge: 'Staff',
    });
  }

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-purple-900/20 bg-[#0B0813]/90 backdrop-blur-xl shrink-0 select-none z-30">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div
          onClick={() => onSelectTab('home')}
          className="px-3 cursor-pointer group flex items-center justify-between"
        >
          <Logo size="md" showTagline />
        </div>

        {/* Main Navigation List */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-purple-900/30 text-white font-semibold shadow-inner border border-purple-500/20'
                    : 'text-purple-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-1.5 rounded-xl transition-transform group-hover:scale-110 ${isActive ? 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30' : 'text-purple-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="tracking-tight">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.count && item.count > 0 ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500 text-white animate-pulse">
                      {item.count}
                    </span>
                  ) : null}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Create Post Action Button */}
        <button
          onClick={onOpenCreatePost}
          className="mx-1 mt-2 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          <PlusSquare className="w-4 h-4" />
          <span>New Moment</span>
        </button>
      </div>

      {/* User Mini Profile & Controls Footer */}
      <div className="pt-4 border-t border-purple-900/20 flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          {/* Theme switch button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 rounded-xl text-purple-300/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Current user card */}
        {userProfile && (
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group"
          >
            <div className="relative">
              <img
                src={userProfile.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                alt={userProfile.displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40 group-hover:ring-purple-400 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0B0813]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {userProfile.displayName}
                </span>
                {userProfile.isVerified && (
                  <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                )}
              </div>
              <span className="text-xs text-purple-200/50 truncate">
                @{userProfile.username}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
