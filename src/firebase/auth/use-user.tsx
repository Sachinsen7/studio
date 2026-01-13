'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import {
  Auth,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseContext } from '@/firebase/provider';

export interface UserAuthHookResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  role: 'admin' | 'employee' | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useUser(auth: Auth): UserAuthHookResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);
  const context = useContext(FirebaseContext);
  
  // Directly access firestore from context to avoid the hook cycle
  const firestore = context?.firestore ?? null;

  useEffect(() => {
    if (!firestore) {
      // Firestore is not yet available, wait for it.
      // This might happen on initial load. The effect will re-run when context updates.
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setRole(userDoc.data().role);
            } else {
              // Handle case where user document doesn't exist, maybe default to a role
              setRole('employee'); 
            }
          } catch (e) {
            setError(e as Error);
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, firestore]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err as Error);
    } 
    // No finally setLoading(false) because onAuthStateChanged will handle it
  }, [auth]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
    // onAuthStateChanged will set loading to false
  }, [auth]);

  return { user, loading, error, role, signInWithGoogle, signOut };
}
