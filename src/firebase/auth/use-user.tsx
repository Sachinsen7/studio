'use client';

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  Auth,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseContext } from '@/firebase/provider';
import { SessionManager } from './session-manager';

export interface UserAuthHookResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
  role: 'admin' | 'employee' | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useUser(auth: Auth): UserAuthHookResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [role, setRole] = useState<'admin' | 'employee' | null>(null);
  const context = useContext(FirebaseContext);
  const sessionManagerRef = useRef<SessionManager | null>(null);

  const firestore = context?.firestore ?? null;

  // Initialize session manager
  useEffect(() => {
    if (!sessionManagerRef.current) {
      sessionManagerRef.current = new SessionManager(auth);
    }

    return () => {
      if (sessionManagerRef.current) {
        sessionManagerRef.current.stop();
      }
    };
  }, [auth]);

  const fetchUserRole = useCallback(async (uid: string, email?: string | null) => {
    if (!firestore) return;
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      // Admin emails list
      const adminEmails = ['admin@adrs.com', 'superadmin@adrs.com'];
      const shouldBeAdmin = email ? adminEmails.includes(email) : false;

      if (userDoc.exists()) {
        const currentRole = userDoc.data().role;
        // Auto-fix: if email should be admin but role is wrong, fix it
        if (shouldBeAdmin && currentRole !== 'admin') {
          await setDoc(userDocRef, { role: 'admin', email: email }, { merge: true });
          setRole('admin');
        } else {
          setRole(currentRole);
        }
      } else {
        // New user - set role based on email
        const userRole = shouldBeAdmin ? 'admin' : 'employee';
        await setDoc(userDocRef, { role: userRole, email: email });
        setRole(userRole);
      }
    } catch (e) {
      setError(e as Error);
      setRole(null);
    }
  }, [firestore]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          setUser(firebaseUser);
          await fetchUserRole(firebaseUser.uid, firebaseUser.email);

          // Start session tracking when user is authenticated
          if (sessionManagerRef.current) {
            sessionManagerRef.current.start();
          }
        } else {
          setUser(null);
          setRole(null);

          // Stop session tracking when user is not authenticated
          if (sessionManagerRef.current) {
            sessionManagerRef.current.stop();
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth, fetchUserRole]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err as Error);
      // Let onAuthStateChanged handle loading state
    }
  }, [auth]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err as Error);
      setLoading(false); // Set loading false on error
      throw err;
    }
  }, [auth]);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear session data before signing out
      if (sessionManagerRef.current) {
        sessionManagerRef.current.clearSession();
      }
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [auth]);

  return { user, loading, error, role, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };
}
