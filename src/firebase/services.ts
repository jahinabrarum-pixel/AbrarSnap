import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import {
  Comment,
  Conversation,
  Message,
  ModerationReport,
  NotificationItem,
  Post,
  Reel,
  Story,
  UserProfile,
} from '../types';

export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) {
      continue;
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      cleaned[key] = cleanFirestoreData(val);
    } else if (Array.isArray(val)) {
      cleaned[key] = val
        .filter((item) => item !== undefined)
        .map((item) => {
          if (item !== null && typeof item === 'object' && !(item instanceof Date)) {
            return cleanFirestoreData(item);
          }
          return item;
        });
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// --- POST SERVICES ---
export async function getFeedPosts(): Promise<Post[]> {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  } catch (error) {
    console.warn('Error fetching posts:', error);
    return [];
  }
}

export async function createNewPost(postData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount'>): Promise<Post> {
  try {
    const rawData = cleanFirestoreData({
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    });
    const docRef = await addDoc(collection(db, 'posts'), rawData);
    return {
      id: docRef.id,
      ...postData,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'posts');
  }
}

export async function togglePostLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean,
  authorId?: string,
  userProfile?: { username: string; avatarUrl?: string }
): Promise<boolean> {
  const likeDocId = `${postId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const postRef = doc(db, 'posts', postId);

  try {
    if (currentlyLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likesCount: increment(-1) }).catch(() => {});
      return false;
    } else {
      await setDoc(likeRef, {
        targetId: postId,
        userId: userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(postRef, { likesCount: increment(1) }).catch(() => {});
      if (authorId && authorId !== userId && userProfile) {
        createNotification({
          recipientId: authorId,
          senderId: userId,
          senderUsername: userProfile.username,
          senderAvatar: userProfile.avatarUrl || '',
          type: 'like',
          text: 'liked your moment',
          targetId: postId,
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    }
  } catch (error) {
    return !currentlyLiked;
  }
}

export async function toggleReelLike(
  reelId: string,
  userId: string,
  currentlyLiked: boolean,
  authorId?: string,
  userProfile?: { username: string; avatarUrl?: string }
): Promise<boolean> {
  const likeDocId = `reel_${reelId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const reelRef = doc(db, 'reels', reelId);

  try {
    if (currentlyLiked) {
      await deleteDoc(likeRef);
      await updateDoc(reelRef, { likesCount: increment(-1) }).catch(() => {});
      return false;
    } else {
      await setDoc(likeRef, {
        targetId: reelId,
        targetType: 'reel',
        userId: userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(reelRef, { likesCount: increment(1) }).catch(() => {});
      if (authorId && authorId !== userId && userProfile) {
        createNotification({
          recipientId: authorId,
          senderId: userId,
          senderUsername: userProfile.username,
          senderAvatar: userProfile.avatarUrl || '',
          type: 'like',
          text: 'liked your reel',
          targetId: reelId,
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    }
  } catch (error) {
    return !currentlyLiked;
  }
}

export async function togglePostSave(postId: string, userId: string, currentlySaved: boolean): Promise<boolean> {
  const saveDocId = `${postId}_${userId}`;
  const saveRef = doc(db, 'savedPosts', saveDocId);

  try {
    if (currentlySaved) {
      await deleteDoc(saveRef);
      return false;
    } else {
      await setDoc(saveRef, {
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    return !currentlySaved;
  }
}

export async function getSavedPostsForUser(userId: string): Promise<Post[]> {
  try {
    const q = query(collection(db, 'savedPosts'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return [];
    }
    const postIds = snap.docs.map((d) => d.data().postId);
    const posts: Post[] = [];
    for (const pid of postIds) {
      const pSnap = await getDoc(doc(db, 'posts', pid));
      if (pSnap.exists()) {
        posts.push({ id: pSnap.id, ...pSnap.data() } as Post);
      }
    }
    return posts;
  } catch {
    return [];
  }
}

export async function deletePostById(postId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
  }
}

// --- COMMENTS SERVICES ---
export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  try {
    const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
  } catch {
    return [];
  }
}

export async function addCommentToPost(
  comment: Omit<Comment, 'id'>,
  postAuthorId?: string
): Promise<Comment> {
  try {
    const rawData = cleanFirestoreData(comment);
    const docRef = await addDoc(collection(db, 'comments'), rawData);
    await updateDoc(doc(db, 'posts', comment.postId), { commentsCount: increment(1) }).catch(() => {});
    if (postAuthorId && postAuthorId !== comment.authorId) {
      createNotification({
        recipientId: postAuthorId,
        senderId: comment.authorId,
        senderUsername: comment.authorUsername,
        senderAvatar: comment.authorAvatar || '',
        type: 'comment',
        text: `commented: "${comment.text.slice(0, 45)}${comment.text.length > 45 ? '...' : ''}"`,
        targetId: comment.postId,
        createdAt: new Date().toISOString(),
      });
    }
    return { id: docRef.id, ...comment };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'comments');
  }
}

// --- STORIES SERVICES ---
export async function getActiveStories(): Promise<Story[]> {
  try {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Story));
  } catch {
    return [];
  }
}

export async function createStory(story: Omit<Story, 'id' | 'viewsCount' | 'expiresAt'>): Promise<Story> {
  const expiresAt = new Date(Date.now() + 24 * 3600000).toISOString();
  try {
    const rawData = cleanFirestoreData({
      ...story,
      viewsCount: 0,
      expiresAt,
    });
    const docRef = await addDoc(collection(db, 'stories'), rawData);
    return {
      id: docRef.id,
      ...story,
      viewsCount: 0,
      expiresAt,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'stories');
  }
}

export async function recordStoryView(storyId: string, userId: string): Promise<void> {
  try {
    const viewRef = doc(db, 'storyViews', `${storyId}_${userId}`);
    await setDoc(viewRef, {
      storyId,
      userId,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'stories', storyId), { viewsCount: increment(1) });
  } catch {
    // Non-blocking
  }
}

// --- REELS SERVICES ---
export async function getReels(): Promise<Reel[]> {
  try {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reel));
  } catch {
    return [];
  }
}

export async function createReel(reel: Omit<Reel, 'id' | 'likesCount' | 'commentsCount' | 'sharesCount'>): Promise<Reel> {
  try {
    const rawData = cleanFirestoreData({
      ...reel,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    });
    const docRef = await addDoc(collection(db, 'reels'), rawData);
    return {
      id: docRef.id,
      ...reel,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reels');
  }
}

// --- MESSAGES & CHAT SERVICES ---
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
  } catch {
    return [];
  }
}

export function subscribeToMessages(conversationId: string, callback: (msgs: Message[]) => void) {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    return onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
        callback(msgs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `messages`);
      }
    );
  } catch (error) {
    console.warn('Realtime subscription notice:', error);
    return () => {};
  }
}

export async function sendMessage(msg: Omit<Message, 'id'>): Promise<Message> {
  try {
    const rawData = cleanFirestoreData(msg);
    const docRef = await addDoc(collection(db, 'messages'), rawData);
    // update parent conversation last message
    await updateDoc(doc(db, 'conversations', msg.conversationId), {
      lastMessage: msg.text || (msg.mediaUrl ? 'Shared an image' : 'New message'),
      lastMessageSenderId: msg.senderId,
      lastMessageAt: msg.createdAt,
      updatedAt: msg.createdAt,
    }).catch(() => {});
    return { id: docRef.id, ...msg };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'messages');
  }
}

export async function createConversation(data: Omit<Conversation, 'id'>): Promise<Conversation> {
  try {
    const rawData = cleanFirestoreData(data);
    const docRef = await addDoc(collection(db, 'conversations'), rawData);
    return { id: docRef.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'conversations');
  }
}

// --- FOLLOWS & CONNECTIONS ---
export async function toggleFollowUser(
  followerId: string,
  followingId: string,
  currentlyFollowing: boolean,
  followerProfile?: { username: string; avatarUrl?: string }
): Promise<boolean> {
  const followDocId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followDocId);

  try {
    if (currentlyFollowing) {
      await deleteDoc(followRef);
      await updateDoc(doc(db, 'users', followingId), { followersCount: increment(-1) }).catch(() => {});
      await updateDoc(doc(db, 'users', followerId), { followingCount: increment(-1) }).catch(() => {});
      return false;
    } else {
      await setDoc(followRef, {
        followerId,
        followingId,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'users', followingId), { followersCount: increment(1) }).catch(() => {});
      await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) }).catch(() => {});
      if (followerProfile && followerId !== followingId) {
        createNotification({
          recipientId: followingId,
          senderId: followerId,
          senderUsername: followerProfile.username,
          senderAvatar: followerProfile.avatarUrl || '',
          type: 'follow',
          text: 'started following you',
          targetId: followerId,
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    }
  } catch {
    return !currentlyFollowing;
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  try {
    const followDocId = `${followerId}_${followingId}`;
    const snap = await getDoc(doc(db, 'follows', followDocId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().followingId as string);
  } catch {
    return [];
  }
}

export async function getUserFollowers(userId: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'follows'), where('followingId', '==', userId));
    const snap = await getDocs(q);
    const followerIds = snap.docs.map((d) => d.data().followerId as string);
    const users: UserProfile[] = [];
    for (const fid of followerIds) {
      const uSnap = await getDoc(doc(db, 'users', fid));
      if (uSnap.exists()) {
        users.push(uSnap.data() as UserProfile);
      }
    }
    return users;
  } catch {
    return [];
  }
}

export async function getUserFollowing(userId: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'follows'), where('followerId', '==', userId));
    const snap = await getDocs(q);
    const followingIds = snap.docs.map((d) => d.data().followingId as string);
    const users: UserProfile[] = [];
    for (const fid of followingIds) {
      const uSnap = await getDoc(doc(db, 'users', fid));
      if (uSnap.exists()) {
        users.push(uSnap.data() as UserProfile);
      }
    }
    return users;
  } catch {
    return [];
  }
}

// --- NOTIFICATIONS ---
export async function createNotification(
  notif: Omit<NotificationItem, 'id' | 'isRead'>
): Promise<void> {
  try {
    if (notif.senderId === notif.recipientId) return;
    const rawData = cleanFirestoreData({
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    await addDoc(collection(db, 'notifications'), rawData);
  } catch (error) {
    console.warn('Failed to dispatch notification:', error);
  }
}

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
  } catch {
    return [];
  }
}

export function subscribeToNotifications(userId: string, callback: (notifs: NotificationItem[]) => void) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    return onSnapshot(
      q,
      (snap) => {
        const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationItem));
        callback(notifs);
      },
      (err) => {
        console.warn('Notifications subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export function subscribeToConversations(userId: string, callback: (convs: Conversation[]) => void) {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(
      q,
      (snap) => {
        const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
        callback(convs);
      },
      (err) => {
        console.warn('Conversations subscription notice:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch {
    // Non-blocking
  }
}

// --- CREATOR SEARCH & DISCOVERY ---
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserProfile);
  } catch {
    return [];
  }
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const term = searchTerm.toLowerCase().trim();

  try {
    const q = query(collection(db, 'users'), limit(50));
    const snap = await getDocs(q);
    const dbUsers = snap.docs.map((d) => d.data() as UserProfile);

    if (!term) return dbUsers;

    return dbUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(term) ||
        u.displayName?.toLowerCase().includes(term) ||
        (u.bio && u.bio.toLowerCase().includes(term))
    );
  } catch {
    return [];
  }
}

// --- MODERATION & REPORTS ---
export async function submitReport(report: Omit<ModerationReport, 'id' | 'status' | 'createdAt'>): Promise<void> {
  try {
    const rawData = cleanFirestoreData({
      ...report,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await addDoc(collection(db, 'reports'), rawData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reports');
  }
}

export async function getAdminReports(): Promise<ModerationReport[]> {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModerationReport));
  } catch {
    return [];
  }
}

export async function updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed'): Promise<void> {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
  }
}
