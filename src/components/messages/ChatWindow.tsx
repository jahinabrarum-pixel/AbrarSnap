import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Image,
  Smile,
  Check,
  CheckCheck,
  ArrowLeft,
  Sparkles,
  Phone,
  Video,
  Info,
} from 'lucide-react';
import { Conversation, Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '../../firebase/services';
import { formatRelativeTime } from '../../utils/formatters';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

const EMOJI_REACTIONS = ['💜', '🔥', '✨', '👏', '😂', '😮'];

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onBack }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time conversation messages
  useEffect(() => {
    if (!conversation) return;

    setMessages([]);

    const unsubscribe = subscribeToMessages(conversation.id, (liveMsgs) => {
      setMessages(liveMsgs || []);
    });

    return () => unsubscribe();
  }, [conversation, userProfile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !imageUrlInput.trim()) return;
    if (!userProfile) return;

    const newMsg: Message = {
      id: `local_${Date.now()}`,
      conversationId: conversation.id,
      senderId: userProfile.uid,
      senderUsername: userProfile.username,
      senderAvatar: userProfile.avatarUrl || '',
      text: inputText.trim(),
      mediaUrl: imageUrlInput.trim() || '',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setImageUrlInput('');
    setShowImagePicker(false);

    try {
      await sendMessage({
        conversationId: conversation.id,
        senderId: userProfile.uid,
        senderUsername: userProfile.username,
        senderAvatar: userProfile.avatarUrl || '',
        text: newMsg.text,
        mediaUrl: newMsg.mediaUrl || '',
        status: 'delivered',
        createdAt: newMsg.createdAt,
      });
    } catch (err) {
      console.warn('Realtime message synced locally:', err);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    if (!userProfile) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const exists = currentReactions.find((r) => r.userId === userProfile.uid && r.emoji === emoji);
        const updated = exists
          ? currentReactions.filter((r) => r.userId !== userProfile.uid)
          : [...currentReactions, { emoji, userId: userProfile.uid }];
        return { ...m, reactions: updated };
      })
    );
  };

  const partnerName = conversation.isGroup
    ? conversation.groupName || 'Creative Group'
    : conversation.participantNames?.find((n) => n !== userProfile?.displayName) || 'Creator';

  const partnerAvatar =
    conversation.participantAvatars?.find((a) => a !== userProfile?.avatarUrl) ||
    'https://api.dicebear.com/7.x/identicon/svg?seed=partner';

  return (
    <div className="flex flex-col h-full bg-[#0B0813] rounded-3xl overflow-hidden border border-purple-900/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#120E22]/90 backdrop-blur-xl border-b border-purple-900/20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#120E22]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">
                {partnerName}
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">Active now</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-purple-300">
          <button
            title="Voice call"
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-purple-400 hover:text-white"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            title="Video call"
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-purple-400 hover:text-white"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === userProfile?.uid;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`relative max-w-[78%] sm:max-w-md px-4 py-3 rounded-3xl text-xs leading-relaxed shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-xs'
                    : 'bg-[#1C1635] text-purple-100 rounded-bl-xs border border-purple-500/15'
                }`}
              >
                {/* Media if present */}
                {msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    alt="attachment"
                    className="w-full max-h-56 rounded-2xl object-cover mb-2 border border-white/10"
                  />
                )}

                <p className="break-words">{msg.text}</p>

                {/* Message reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-[#120E22] px-2 py-0.5 rounded-full border border-purple-500/30 shadow-md">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="text-[10px]">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp & Delivery status */}
              <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-purple-300/40">
                <span>{formatRelativeTime(msg.createdAt)}</span>
                {isMe && (
                  <span>
                    {msg.status === 'seen' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-pink-400 inline" />
                    ) : (
                      <Check className="w-3.5 h-3.5 inline" />
                    )}
                  </span>
                )}

                {/* Quick reaction trigger */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                  {EMOJI_REACTIONS.slice(0, 3).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-purple-300/60 p-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
            <span className="italic">{partnerName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image URL Attachment Box */}
      {showImagePicker && (
        <div className="p-3 bg-[#161228] border-t border-purple-900/30 flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Paste media link to share..."
            className="flex-1 bg-purple-950/40 border border-purple-800/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => setShowImagePicker(false)}
            className="text-xs text-purple-300/60 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="p-3 bg-[#120E22] border-t border-purple-900/25 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowImagePicker(!showImagePicker)}
          className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Image className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${partnerName}...`}
          className="flex-1 bg-purple-950/40 border border-purple-800/30 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !imageUrlInput.trim()}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-40 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
