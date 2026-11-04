import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Test backend connection on startup per SKILL.md
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        const isTargetAdmin = user.email === 'abrarjahin702@gmail.com';
        const fallbackProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          username: (user.email?.split('@')[0] || `user_${user.uid.slice(0, 6)}`).toLowerCase().replace(/[^a-z0-9_]/g, ''),
          displayName: user.displayName || user.email?.split('@')[0] || 'AbrarSnap Creator',
          bio: 'Creating my world with AbrarSnap ✨',
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
          coverUrl: '',
          website: '',
          isPrivate: false,
          accentColor: 'violet',
          role: isTargetAdmin ? 'admin' : 'user',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isVerified: isTargetAdmin,
          createdAt: new Date().toISOString(),
        };

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);

          if (!isMounted) return;

          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // First time login - bootstrap real user profile
            await setDoc(userDocRef, fallbackProfile);
            if (isMounted) {
              setUserProfile(fallbackProfile);
            }

            if (isTargetAdmin) {
              try {
                await setDoc(doc(db, 'admins', user.uid), {
                  uid: user.uid,
                  email: user.email || '',
                  grantedAt: new Date().toISOString(),
                });
              } catch (adminErr) {
                console.warn('Admin record provision notice:', adminErr);
              }
            }
          }
        } catch (error: any) {
          console.warn('Profile load notice (using fallback profile):', error?.message || error);
          if (isMounted) {
            setUserProfile(fallbackProfile);
          }
          const isOfflineOrUnavailable =
            error?.message?.includes('offline') ||
            error?.code === 'unavailable' ||
            error?.message?.includes('network-request-failed');
          if (!isOfflineOrUnavailable) {
            try {
              handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
            } catch (loggedErr) {
              console.warn('Firestore profile get error logged:', loggedErr);
            }
          }
        }
      } else {
        if (isMounted) {
          setUserProfile(null);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (
        error?.code !== 'auth/unauthorized-domain' &&
        error?.code !== 'auth/configuration-not-found' &&
        error?.code !== 'auth/popup-closed-by-user'
      ) {
        console.error('Google Sign In Error:', error);
      } else {
        console.warn('Google Sign In Notice:', error?.message || error?.code);
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email Sign In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, username: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const isTargetAdmin = email === 'abrarjahin702@gmail.com';
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: email,
        username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        displayName: name,
        bio: 'Just joined AbrarSnap ✨',
        avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${res.user.uid}`,
        coverUrl: '',
        website: '',
        isPrivate: false,
        accentColor: 'violet',
        role: isTargetAdmin ? 'admin' : 'user',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: isTargetAdmin,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', res.user.uid), newProfile);
      setUserProfile(newProfile);
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      throw error;
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    try {
      const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
      const cleaned = Object.fromEntries(
        Object.entries(updated).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, 'users', currentUser.uid), cleaned);
      setUserProfile(updated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    currentUser?.email === 'abrarjahin702@gmail.com';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
