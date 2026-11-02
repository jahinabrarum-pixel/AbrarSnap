import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Sparkles, Check, Bell } from 'lucide-react';
import { NotificationItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../firebase/services';
import { formatRelativeTime } from '../utils/formatters';
import { EmptyState } from '../components/branding/EmptyStates';

export const NotificationsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'likes' | 'follows'>('all');

  useEffect(() => {
    if (!userProfile) return;
    getUserNotifications(userProfile.uid).then((res) => {
      setNotifications(res);
      setLoading(false);
    });
  }, [userProfile]);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        markNotificationAsRead(n.id);
        return { ...n, isRead: true };
      })
    );
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-purple-400" />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-pink-400" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'likes') return n.type === 'like' || n.type === 'comment';
    if (filter === 'follows') return n.type === 'follow' || n.type === 'follow_request';
    return true;
  });

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-3 sm:px-4 flex flex-col gap-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
            Notifications
          </h2>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-semibold text-purple-300 hover:text-white transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('likes')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'likes'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          Likes & Comments
        </button>
        <button
          onClick={() => setFilter('follows')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'follows'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-950/40 text-purple-300/60 hover:text-white'
          }`}
        >
          Follows
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            type="notifications"
            title="All caught up!"
            description="When people like your posts, comment, or start following you, new notifications will appear here."
          />
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                item.isRead
                  ? 'bg-[#120E22]/60 border-purple-900/20'
                  : 'bg-purple-900/25 border-purple-500/30 shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={item.senderAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
                    alt={item.senderUsername}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#120E22] ring-1 ring-purple-500/20">
                    {getIcon(item.type)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-purple-100 leading-snug">
                    <span className="font-bold text-white mr-1">@{item.senderUsername}</span>
                    <span>{item.text}</span>
                  </p>
                  <p className="text-[10px] text-purple-300/40 mt-0.5">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </div>

              {!item.isRead && (
                <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
