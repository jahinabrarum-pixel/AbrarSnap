/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { RightPanel } from './components/layout/RightPanel';
import { LoadingScreen } from './components/branding/LoadingScreen';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { SearchPage } from './pages/SearchPage';
import { ReelsPage } from './pages/ReelsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { SavedPostsPage } from './pages/SavedPostsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Modals
import { CreatePostModal } from './components/modals/CreatePostModal';
import { CreateStoryModal } from './components/stories/CreateStoryModal';
import { StoryViewerModal } from './components/stories/StoryViewerModal';
import { PostCommentsModal } from './components/feed/PostCommentsModal';
import { ShareModal } from './components/feed/ShareModal';
import { ReportModal } from './components/modals/ReportModal';

// Types & Services
import { Post, Reel, Story, UserProfile } from './types';
import { getFeedPosts, getActiveStories, getReels, subscribeToNotifications, subscribeToConversations } from './firebase/services';

function MainApp() {
  const { userProfile, loading } = useAuth();
  const { theme } = useTheme();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedUser, setSelectedUser] = useState<UserProfile | undefined>(undefined);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

  // Global feeds state - loads strictly from real Firestore
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);

  // Real-time unread notifications and messages badges
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeSharePost, setActiveSharePost] = useState<Post | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'post' | 'user' | 'comment' | 'reel' } | null>(null);

  // Load real feeds from Firestore
  useEffect(() => {
    getFeedPosts().then((res) => {
      setPosts(res || []);
    });
    getActiveStories().then((res) => {
      setStories(res || []);
    });
    getReels().then((res) => {
      setReels(res || []);
    });
  }, []);

  // Subscribe to real-time notification & message counts
  useEffect(() => {
    if (!userProfile) return;
    const unsubNotifs = subscribeToNotifications(userProfile.uid, (list) => {
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadNotifsCount(unread);
    });
    const unsubConvs = subscribeToConversations(userProfile.uid, (list) => {
      const unread = list.filter((c) => c.lastMessageSenderId && c.lastMessageSenderId !== userProfile.uid).length;
      setUnreadMessagesCount(unread);
    });
    return () => {
      unsubNotifs();
      unsubConvs();
    };
  }, [userProfile]);

  if (loading) {
    return <LoadingScreen message="Initializing AbrarSnap platform..." />;
  }

  // If user explicitly navigated to Auth tab
  if (!userProfile && currentTab === 'auth') {
    return (
      <AuthPage
        onSuccess={() => {
          setIsGuestMode(false);
          setCurrentTab('home');
        }}
        onExploreGuest={() => {
          setIsGuestMode(true);
          setCurrentTab('home');
        }}
      />
    );
  }

  // If not logged in and not in guest mode, show Landing page
  if (!userProfile && !isGuestMode) {
    return (
      <LandingPage
        onGetStarted={() => setCurrentTab('auth')}
        onExploreGuest={() => {
          setIsGuestMode(true);
          setCurrentTab('home');
        }}
      />
    );
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
  };

  const handleReelCreated = (newReel: Reel) => {
    setReels((prev) => [newReel, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSelectUserProfile = (user: UserProfile) => {
    setSelectedUser(user);
    setCurrentTab('profile');
  };

  const handleSelectTag = (tag: string) => {
    setCurrentTab('search');
  };

  const handleOpenCreatePost = () => {
    if (!userProfile) {
      setCurrentTab('auth');
    } else {
      setShowCreatePost(true);
    }
  };

  const handleOpenCreateStory = () => {
    if (!userProfile) {
      setCurrentTab('auth');
    } else {
      setShowCreateStory(true);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            posts={posts}
            stories={stories}
            onOpenCreatePost={handleOpenCreatePost}
            onOpenCreateStory={handleOpenCreateStory}
            onSelectStory={(s, i) => setViewingStoryIndex(i)}
            onOpenComments={(p) => setActiveCommentsPost(p)}
            onOpenShare={(p) => setActiveSharePost(p)}
            onOpenReport={(id, type) => setReportTarget({ id, type })}
            onSelectTag={handleSelectTag}
            onPostDeleted={handlePostDeleted}
          />
        );

      case 'explore':
        return (
          <ExplorePage
            posts={posts}
            reels={reels}
            onSelectPost={(p) => setActiveCommentsPost(p)}
            onSelectReel={(r) => setCurrentTab('reels')}
            onSelectTag={handleSelectTag}
          />
        );

      case 'search':
        return (
          <SearchPage
            posts={posts}
            onSelectUser={handleSelectUserProfile}
            onSelectTag={handleSelectTag}
          />
        );

      case 'reels':
        return (
          <ReelsPage
            reels={reels}
            onOpenComments={(r) =>
              setActiveCommentsPost({
                id: r.id,
                authorId: r.authorId,
                authorUsername: r.authorUsername,
                authorDisplayName: r.authorDisplayName,
                authorAvatar: r.authorAvatar,
                caption: r.caption,
                mediaUrls: [r.videoUrl],
                mediaTypes: ['video'],
                likesCount: r.likesCount,
                commentsCount: r.commentsCount,
                sharesCount: r.sharesCount,
                tags: r.tags || [],
                visibility: 'public',
                createdAt: r.createdAt,
              })
            }
            onOpenShare={(r) =>
              setActiveSharePost({
                id: r.id,
                authorId: r.authorId,
                authorUsername: r.authorUsername,
                authorDisplayName: r.authorDisplayName,
                authorAvatar: r.authorAvatar,
                caption: r.caption,
                mediaUrls: [r.videoUrl],
                mediaTypes: ['video'],
                likesCount: r.likesCount,
                commentsCount: r.commentsCount,
                sharesCount: r.sharesCount,
                tags: r.tags || [],
                visibility: 'public',
                createdAt: r.createdAt,
              })
            }
            onSelectUser={(handle) => {
              setCurrentTab('search');
            }}
            onReelCreated={handleReelCreated}
          />
        );

      case 'messages':
        return <MessagesPage />;

      case 'notifications':
        return <NotificationsPage />;

      case 'saved':
        return (
          <SavedPostsPage
            posts={posts}
            onSelectPost={(p) => setActiveCommentsPost(p)}
            onExplorePosts={() => setCurrentTab('home')}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            user={selectedUser}
            posts={posts}
            reels={reels}
            onOpenEditProfile={() => setCurrentTab('edit_profile')}
            onOpenSettings={() => setCurrentTab('settings')}
            onSelectPost={(p) => setActiveCommentsPost(p)}
            onSelectReel={(r) => setCurrentTab('reels')}
          />
        );

      case 'edit_profile':
        return (
          <EditProfilePage
            onBack={() => {
              setSelectedUser(undefined);
              setCurrentTab('profile');
            }}
            onSaved={() => {
              setSelectedUser(undefined);
              setCurrentTab('profile');
            }}
          />
        );

      case 'settings':
        return <SettingsPage />;

      case 'admin':
        return (
          <AdminDashboardPage
            posts={posts}
            onPostDeleted={handlePostDeleted}
          />
        );

      default:
        return (
          <HomePage
            posts={posts}
            stories={stories}
            onOpenCreatePost={() => setShowCreatePost(true)}
            onOpenCreateStory={() => setShowCreateStory(true)}
            onSelectStory={(s, i) => setViewingStoryIndex(i)}
            onOpenComments={(p) => setActiveCommentsPost(p)}
            onOpenShare={(p) => setActiveSharePost(p)}
            onOpenReport={(id, type) => setReportTarget({ id, type })}
            onSelectTag={handleSelectTag}
            onPostDeleted={handlePostDeleted}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-[#0B0813] text-[#F3F0F9] flex flex-col ${theme === 'light' ? 'light-mode' : ''}`}>
      {/* Top Mobile Bar */}
      <Navbar
        onSelectTab={(t) => {
          setSelectedUser(undefined);
          setCurrentTab(t);
        }}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotifsCount={unreadNotifsCount}
      />

      {/* Main Responsive Grid Layout: Left Sidebar + Center Feed + Right Panel */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(t) => {
            setSelectedUser(undefined);
            setCurrentTab(t);
          }}
          onOpenCreatePost={handleOpenCreatePost}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotifsCount={unreadNotifsCount}
        />

        {/* Center Main Stage Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Right Desktop Discovery & Personas Panel (hidden on search/messages/admin) */}
        {currentTab !== 'messages' && currentTab !== 'admin' && (
          <RightPanel
            onSelectUser={handleSelectUserProfile}
            onSelectTag={handleSelectTag}
          />
        )}
      </div>

      {/* Bottom Mobile Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(t) => {
          setSelectedUser(undefined);
          setCurrentTab(t);
        }}
        onOpenCreatePost={handleOpenCreatePost}
      />

      {/* Global Modals */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {viewingStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={viewingStoryIndex}
          onClose={() => setViewingStoryIndex(null)}
        />
      )}

      {activeCommentsPost && (
        <PostCommentsModal
          post={activeCommentsPost}
          onClose={() => setActiveCommentsPost(null)}
        />
      )}

      {activeSharePost && (
        <ShareModal
          post={activeSharePost}
          onClose={() => setActiveSharePost(null)}
          onSendToChat={(postId) => setCurrentTab('messages')}
        />
      )}

      {reportTarget && (
        <ReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
