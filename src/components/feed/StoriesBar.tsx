import React from 'react';
import { Plus } from 'lucide-react';
import { Story } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface StoriesBarProps {
  stories: Story[];
  onSelectStory: (story: Story, index: number) => void;
  onOpenCreateStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  onSelectStory,
  onOpenCreateStory,
}) => {
  const { userProfile } = useAuth();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 px-1 flex items-center gap-4 select-none">
      {/* Create User Story Button */}
      <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group" onClick={onOpenCreateStory}>
        <div className="relative p-0.5 rounded-full">
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-600/40 group-hover:ring-purple-400 transition-all">
            <img
              src={userProfile?.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=me'}
              alt="Your Story"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute bottom-0 right-0 p-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md ring-2 ring-[#0B0813] group-hover:scale-110 transition-transform">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
        <span className="text-[11px] font-medium text-purple-200/80 group-hover:text-white transition-colors">
          Your Story
        </span>
      </div>

      {/* Active Stories List */}
      {stories.map((story, idx) => (
        <div
          key={story.id}
          onClick={() => onSelectStory(story, idx)}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="p-[2.5px] rounded-full animate-ring-pulse group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-600/20">
            <div className="w-16 h-16 rounded-full p-0.5 bg-[#0B0813] overflow-hidden">
              <img
                src={story.authorAvatar || story.mediaUrl}
                alt={story.authorDisplayName}
                className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <span className="text-[11px] font-medium text-purple-200/80 group-hover:text-white truncate max-w-[68px] text-center">
            {story.authorUsername}
          </span>
        </div>
      ))}
    </div>
  );
};
