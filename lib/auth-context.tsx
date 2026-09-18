"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isFirebaseConfigured } from "@/lib/config";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { userFromData } from "@/lib/posts";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeProfile: (displayName: string, bio: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(configured);

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }
    const snap = await getDoc(doc(getDb(), "users", user.uid));
    setProfile(snap.exists() ? userFromData(snap.id, snap.data()) : null);
  }, []);

  useEffect(() => {
    if (!configured) return;

    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      setFirebaseUser(user);
      try {
        await loadProfile(user);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, [configured, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      configured,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      signUp: async (email, password) => {
        await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });
        await signInWithPopup(getFirebaseAuth(), provider);
      },
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth());
      },
      refreshProfile: async () => {
        await loadProfile(getFirebaseAuth().currentUser);
      },
      completeProfile: async (displayName, bio) => {
        const user = getFirebaseAuth().currentUser;
        if (!user) throw new Error("You need to be signed in.");
        await setDoc(doc(getDb(), "users", user.uid), {
          uid: user.uid,
          displayName: displayName.trim(),
          email: user.email ?? "",
          bio: bio.trim(),
          role: "writer",
          createdAt: serverTimestamp(),
        });
        await loadProfile(user);
      },
    }),
    [configured, firebaseUser, loadProfile, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
