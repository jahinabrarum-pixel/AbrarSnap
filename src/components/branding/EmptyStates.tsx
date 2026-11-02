import React from 'react';
import { BrandIcon } from './BrandIcon';

interface EmptyStateProps {
  type: 'feed' | 'messages' | 'saved' | 'notifications' | 'search' | 'reels';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
}) => {
  const getIllustration = () => {
    switch (type) {
      case 'feed':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="42" stroke="rgba(167, 139, 250, 0.2)" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="50" cy="50" r="28" fill="rgba(139, 92, 246, 0.1)" stroke="#8B5CF6" strokeWidth="2" />
            <path d="M38 50 L46 58 L62 42" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="28" cy="30" r="3" fill="#C084FC" />
            <circle cx="72" cy="68" r="4" fill="#F472B6" />
            <circle cx="76" cy="34" r="2" fill="#E879F9" />
          </svg>
        );
      case 'messages':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
            <rect x="20" y="24" width="48" height="36" rx="14" fill="rgba(139, 92, 246, 0.15)" stroke="#A78BFA" strokeWidth="2" />
            <rect x="36" y="44" width="44" height="32" rx="12" fill="rgba(236, 72, 153, 0.15)" stroke="#F472B6" strokeWidth="2" />
            <circle cx="36" cy="42" r="2.5" fill="#DDD6FE" />
            <circle cx="44" cy="42" r="2.5" fill="#DDD6FE" />
            <circle cx="52" cy="42" r="2.5" fill="#DDD6FE" />
            <circle cx="52" cy="60" r="2" fill="#FBCFE8" />
            <circle cx="58" cy="60" r="2" fill="#FBCFE8" />
            <circle cx="64" cy="60" r="2" fill="#FBCFE8" />
          </svg>
        );
      case 'saved':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
            <rect x="26" y="18" width="48" height="64" rx="10" stroke="rgba(167, 139, 250, 0.25)" strokeWidth="2" />
            <path d="M38 24 L62 24 C64 24 66 26 66 28 L66 68 L50 56 L34 68 L34 28 C34 26 36 24 38 24 Z" fill="rgba(168, 85, 247, 0.2)" stroke="#C084FC" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="50" cy="40" r="4" fill="#DDD6FE" />
          </svg>
        );
      case 'notifications':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
            <path d="M50 20 C42 20 36 26 36 34 L36 48 L30 56 L70 56 L64 48 L64 34 C64 26 58 20 50 20 Z" fill="rgba(139, 92, 246, 0.15)" stroke="#A78BFA" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M44 60 C44 63.3 46.7 66 50 66 C53.3 66 56 63.3 56 60" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
            <circle cx="68" cy="24" r="6" fill="#EC4899" />
            <circle cx="68" cy="24" r="3" fill="#FFFFFF" />
          </svg>
        );
      case 'search':
        return (
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
            <circle cx="44" cy="44" r="22" stroke="#8B5CF6" strokeWidth="3" fill="rgba(139, 92, 246, 0.1)" />
            <path d="M60 60 L78 78" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
            <circle cx="44" cy="44" r="8" stroke="rgba(221, 214, 254, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        );
      default:
        return <BrandIcon size={72} />;
    }
  };

  const defaults = {
    feed: {
      title: 'Your feed is quiet for now',
      description: 'Follow fellow creators, explore trending tags, or publish your first moment.',
    },
    messages: {
      title: 'No conversations yet',
      description: 'Connect with friends and start your first conversation in real time.',
    },
    saved: {
      title: 'No saved moments',
      description: 'Tap the bookmark icon on any post or reel to keep inspiration handy.',
    },
    notifications: {
      title: 'All caught up!',
      description: 'When people like, comment, or mention you, updates will arrive here.',
    },
    search: {
      title: 'Explore the creative world',
      description: 'Type a name, handle, or hashtag to discover creators and moments.',
    },
    reels: {
      title: 'No reels yet',
      description: 'Be the first to share a high-energy short video with the community.',
    },
  };

  const finalTitle = title || defaults[type]?.title || 'Nothing here yet';
  const finalDesc = description || defaults[type]?.description || '';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto my-6 animate-fade-in">
      <div className="p-4 rounded-3xl bg-purple-950/20 border border-purple-800/20 mb-4 shadow-inner">
        {getIllustration()}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{finalTitle}</h3>
      <p className="text-sm text-purple-200/60 mb-6 leading-relaxed">{finalDesc}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-600/25 active:scale-95 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
