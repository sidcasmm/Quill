import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore";
import { isFirebaseConfigured } from "@/lib/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const globalForFirebase = globalThis as unknown as {
  authEmulatorConnected?: boolean;
  firestoreEmulatorConnected?: boolean;
};

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase env vars are missing. Copy .env.example to .env.local.",
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

function shouldUseEmulators() {
  return process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

function alreadyStarted(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /already (?:been )?started|already been initialized/i.test(message);
}

export function getFirebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  if (shouldUseEmulators() && !globalForFirebase.authEmulatorConnected) {
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", {
        disableWarnings: true,
      });
    } catch (error) {
      if (!alreadyStarted(error)) throw error;
    }
    globalForFirebase.authEmulatorConnected = true;
  }
  return auth;
}

export function getDb(): Firestore {
  const app = getFirebaseApp();

  if (shouldUseEmulators()) {
    let db: Firestore;
    try {
      db = initializeFirestore(app, {
        host: "127.0.0.1:8080",
        ssl: false,
      });
    } catch (error) {
      if (!alreadyStarted(error)) throw error;
      db = getFirestore(app);
    }

    if (!globalForFirebase.firestoreEmulatorConnected) {
      try {
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
      } catch (error) {
        if (!alreadyStarted(error)) {
          // initializeFirestore already pointed at the emulator.
          const message = error instanceof Error ? error.message : String(error);
          if (!/emulator/i.test(message)) throw error;
        }
      }
      globalForFirebase.firestoreEmulatorConnected = true;
    }
    return db;
  }

  return getFirestore(app);
}
