'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firestore/lite';
import { Auth } from 'firebase/auth';
import { useUser, UserAuthHookResult } from '@/firebase/auth/use-user';

export interface FirebaseContextState {
    areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
    firebaseApp: FirebaseApp | null;
    firestore: Firestore | null;
    auth: Auth | null; // The Auth service instance
}

export interface FirebaseServicesAndUser extends FirebaseContextState, UserAuthHookResult {}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const contextValue = useMemo(() => ({
    areServicesAvailable: !!(firebaseApp && firestore && auth),
    firebaseApp: firebaseApp || null,
    firestore: firestore || null,
    auth: auth || null,
  }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};


export const useFirebase = (): FirebaseServicesAndUser => {
    const context = useContext(FirebaseContext);

    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider.');
    }

    if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
        throw new Error('Firebase core services not available. Check FirebaseProvider props.');
    }

    const userState = useUser(context.auth);

    return {
        ...context,
        ...userState,
    };
};

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  if (!auth) throw new Error("Auth service not available.");
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  if (!firestore) throw new Error("Firestore service not available.");
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  if (!firebaseApp) throw new Error("FirebaseApp not available.");
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
