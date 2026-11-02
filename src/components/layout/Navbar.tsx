import React from 'react';
import { Logo } from '../branding/Logo';
import { Search, Send, Heart, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  onSelectTab: (tab: string) => void;
  unreadMessagesCount?: number;
  unreadNotifsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTab,
  unreadMessagesCount = 0,
  unreadNotifsCount = 0,
}) => {
  const { userProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0B0813]/95 backdrop-blur-xl border-b border-purple-900/20">
      <div onClick={() => onSelectTab('home')} className="cursor-pointer">
        <Logo size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectTab('search')}
          className="p-2 rounded-full text-purple-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectTab('notifications')}
          className="relative p-2 rounded-full text-purple-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Heart className="w-5 h-5" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('messages')}
          className="relative p-2 rounded-full text-purple-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Send className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full text-purple-300 hover:bg-white/10 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
