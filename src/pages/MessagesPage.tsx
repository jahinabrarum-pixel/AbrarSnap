import React, { useState, useEffect } from 'react';
import { ChatList } from '../components/messages/ChatList';
import { ChatWindow } from '../components/messages/ChatWindow';
import { NewChatModal } from '../components/messages/NewChatModal';
import { EmptyState } from '../components/branding/EmptyStates';
import { Conversation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUserConversations } from '../firebase/services';
import { MessageSquareDashed } from 'lucide-react';

interface MessagesPageProps {
  initialConversationId?: string;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ initialConversationId }) => {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    getUserConversations(userProfile.uid).then((res) => {
      setConversations(res);
      if (initialConversationId) {
        const found = res.find((c) => c.id === initialConversationId);
        if (found) setActiveConv(found);
      } else if (res.length > 0 && window.innerWidth >= 768) {
        setActiveConv(res[0]);
      }
      setLoading(false);
    });
  }, [userProfile, initialConversationId]);

  const handleConversationCreated = (newConv: Conversation) => {
    setConversations((prev) => [newConv, ...prev]);
    setActiveConv(newConv);
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] my-2 p-2 sm:p-4 select-none">
      <div className="grid grid-cols-1 md:grid-cols-12 h-full rounded-3xl overflow-hidden border border-purple-900/30 bg-[#0B0813] shadow-2xl">
        {/* Left Column: Chat List (hidden on mobile if active conversation is selected) */}
        <div
          className={`h-full md:col-span-5 lg:col-span-4 ${
            activeConv ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatList
            conversations={conversations}
            selectedId={activeConv?.id}
            onSelectConversation={(conv) => setActiveConv(conv)}
            onOpenNewChat={() => setShowNewChatModal(true)}
          />
        </div>

        {/* Right Column: Chat Window */}
        <div
          className={`h-full md:col-span-7 lg:col-span-8 ${
            !activeConv ? 'hidden md:flex flex-col items-center justify-center' : 'block'
          }`}
        >
          {activeConv ? (
            <ChatWindow
              key={activeConv.id}
              conversation={activeConv}
              onBack={() => setActiveConv(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-purple-300/60">
              <div className="w-16 h-16 rounded-full bg-purple-950/40 border border-purple-800/30 flex items-center justify-center mb-3">
                <MessageSquareDashed className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1 font-['Space_Grotesk']">
                Your Direct Messages
              </h3>
              <p className="text-xs text-purple-200/50 max-w-xs mb-4">
                Select an existing thread or start a new dialogue with creators worldwide.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Send New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
};
