import React, { useState, useEffect } from 'react';
import { X, Search, Users, Sparkles, Check } from 'lucide-react';
import { UserProfile, Conversation } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { createConversation, getAllUsers } from '../../firebase/services';

interface NewChatModalProps {
  onClose: () => void;
  onConversationCreated: (conv: Conversation) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  onClose,
  onConversationCreated,
}) => {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [creators, setCreators] = useState<UserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllUsers().then((users) => {
      setCreators(users.filter((c) => c.uid !== userProfile?.uid));
    });
  }, [userProfile]);

  const filtered = creators.filter(
    (c) =>
      c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (selectedUserIds.length === 0 || !userProfile || creating) return;
    setCreating(true);

    const isGroup = selectedUserIds.length > 1;
    const participantIds = [userProfile.uid, ...selectedUserIds];
    const selectedUsers = creators.filter((c) => selectedUserIds.includes(c.uid));
    const participantNames = [userProfile.displayName, ...selectedUsers.map((u) => u.displayName)];
    const participantAvatars = [
      userProfile.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=me',
      ...selectedUsers.map((u) => u.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'),
    ];

    try {
      const conv = await createConversation({
        participantIds,
        participantNames,
        participantAvatars,
        isGroup,
        groupName: isGroup ? groupName.trim() || 'Creative Group' : undefined,
        lastMessage: 'Started conversation',
        lastMessageSenderId: userProfile.uid,
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      onConversationCreated(conv);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm max-h-[80vh] bg-[#120E22] border border-purple-500/25 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              New Direct Chat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Name input if multi-select */}
        {selectedUserIds.length > 1 && (
          <div>
            <label className="text-[11px] font-semibold text-purple-200/80 mb-1 block">
              Group Title
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Design Collective..."
              className="w-full bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-950/40 border border-purple-800/30 rounded-xl">
          <Search className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search creators..."
            className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
          />
        </div>

        {/* Creator List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-1">
          {filtered.map((creator) => {
            const isSelected = selectedUserIds.includes(creator.uid);

            return (
              <button
                key={creator.uid}
                onClick={() => toggleSelectUser(creator.uid)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-purple-900/50 border border-purple-500/40'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.displayName}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-500/30"
                  />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-white truncate">{creator.displayName}</p>
                    <p className="text-[11px] text-purple-300/50 truncate">@{creator.username}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-purple-500/40'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={selectedUserIds.length === 0 || creating}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 disabled:opacity-40 transition-all cursor-pointer"
        >
          {creating
            ? 'Starting Chat...'
            : selectedUserIds.length > 1
            ? `Start Group Chat (${selectedUserIds.length})`
            : 'Start Chat'}
        </button>
      </div>
    </div>
  );
};
