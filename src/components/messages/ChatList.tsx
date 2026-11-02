import React, { useState } from 'react';
import { Search, Plus, Sparkles, Users } from 'lucide-react';
import { Conversation } from '../../types';
import { formatRelativeTime } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

interface ChatListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelectConversation: (conv: Conversation) => void;
  onOpenNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onOpenNewChat,
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = conversations.filter((c) => {
    const title = c.isGroup ? c.groupName : c.participantNames?.join(' ');
    return !searchTerm || title?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full border-r border-purple-900/20 bg-[#0B0813] select-none">
      {/* Search & Header */}
      <div className="p-4 border-b border-purple-900/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] tracking-tight">
              Messages
            </h2>
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-white border border-purple-500/30 transition-colors cursor-pointer"
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-purple-950/40 border border-purple-800/30 rounded-2xl">
          <Search className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-purple-300/50">
            No chats found. Tap + to start a conversation!
          </div>
        ) : (
          filtered.map((conv) => {
            const isSelected = selectedId === conv.id;
            const displayName = conv.isGroup
              ? conv.groupName || 'Group Chat'
              : conv.participantNames?.find((n) => n !== userProfile?.displayName) || 'Creator';
            const displayAvatar =
              conv.participantAvatars?.find((a) => a !== userProfile?.avatarUrl) ||
              'https://api.dicebear.com/7.x/identicon/svg?seed=creator';

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900/40 border border-purple-500/30 text-white shadow-md'
                    : 'hover:bg-white/5 text-purple-200/80 border border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0B0813]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-purple-300/40 shrink-0">
                        {formatRelativeTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-purple-200/60 truncate">
                    {conv.lastMessage || 'Sent an attachment'}
                  </p>
                </div>

                {conv.unreadCount && conv.unreadCount > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {conv.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
