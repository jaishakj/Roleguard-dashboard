import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, UserRole } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              const role: UserRole = user.email === 'jaishak2003@gmail.com' ? 'admin' : 'viewer';
              const newProfile: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'Anonymous',
                role,
                createdAt: serverTimestamp(),
              };
              await setDoc(doc(db, 'users', user.uid), newProfile);
              setProfile(newProfile);
            }
          } catch (error: any) {
            console.error("Failed to fetch/create user profile:", error);
            // Don't use handleFirestoreError here as it throws, which blocks setLoading(false)
          }
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in successfully");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    const confirm = window.confirm("Are you sure you want to delete your account? All your data will be permanently removed.");
    if (!confirm) return;

    try {
      setLoading(true);
      
      // 1. Delete all user records
      const recordsQuery = query(collection(db, 'records'), where('userId', '==', user.uid));
      const recordsSnapshot = await getDocs(recordsQuery);
      const batch = writeBatch(db);
      recordsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 2. Delete user profile
      await deleteDoc(doc(db, 'users', user.uid));

      // 3. Delete auth account
      await deleteUser(user);
      
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete account. You might need to re-authenticate first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
