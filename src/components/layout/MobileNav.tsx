import React from 'react';
import { Home, Compass, PlusSquare, Clapperboard, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreatePost: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreatePost,
}) => {
  const { userProfile } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2.5 px-3 bg-[#0B0813]/95 backdrop-blur-xl border-t border-purple-900/20 safe-area-pb">
      <button
        onClick={() => onSelectTab('home')}
        className={`p-2 rounded-xl transition-colors cursor-pointer ${
          currentTab === 'home' ? 'text-pink-400' : 'text-purple-300/70'
        }`}
      >
        <Home className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('explore')}
        className={`p-2 rounded-xl transition-colors cursor-pointer ${
          currentTab === 'explore' ? 'text-pink-400' : 'text-purple-300/70'
        }`}
      >
        <Compass className="w-6 h-6" />
      </button>

      {/* Floating Create Button */}
      <button
        onClick={onOpenCreatePost}
        className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 active:scale-95 transition-transform cursor-pointer"
      >
        <PlusSquare className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('reels')}
        className={`p-2 rounded-xl transition-colors cursor-pointer ${
          currentTab === 'reels' ? 'text-pink-400' : 'text-purple-300/70'
        }`}
      >
        <Clapperboard className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('profile')}
        className={`p-1.5 rounded-full ring-2 transition-all cursor-pointer ${
          currentTab === 'profile' ? 'ring-pink-500' : 'ring-transparent'
        }`}
      >
        <img
          src={userProfile?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
          alt="Profile"
          className="w-6 h-6 rounded-full object-cover"
        />
      </button>
    </nav>
  );
};
