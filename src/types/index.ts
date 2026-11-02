export type ThemeMode = 'dark' | 'light' | 'system';

export type AccentColor = 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  website?: string;
  isPrivate?: boolean;
  accentColor?: AccentColor;
  role?: 'user' | 'admin';
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar?: string;
  caption: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video')[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  visibility: 'public' | 'followers' | 'private';
  location?: string;
  createdAt: string;
  updatedAt?: string;
  hasLiked?: boolean;
  hasSaved?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
  likesCount?: number;
}

export interface Story {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'text';
  caption?: string;
  accentColor?: string;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  hasViewed?: boolean;
}

export interface Reel {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatar?: string;
  videoUrl: string;
  caption: string;
  musicTitle?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags: string[];
  createdAt: string;
  hasLiked?: boolean;
  hasSaved?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames?: string[];
  participantAvatars?: string[];
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageAt?: string;
  isGroup?: boolean;
  groupName?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  text: string;
  mediaUrl?: string;
  status: 'sent' | 'delivered' | 'seen';
  reactions?: { emoji: string; userId: string }[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'message';
  targetId?: string;
  targetType?: string;
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  status: 'active' | 'pending';
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'user' | 'comment' | 'reel';
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  details?: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  theme: ThemeMode;
  accentColor: AccentColor;
  privateAccount: boolean;
  allowMentions: 'everyone' | 'following' | 'none';
  onlineStatusVisible: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  updatedAt: string;
}
