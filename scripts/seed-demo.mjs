import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: "demo-api-key",
  authDomain: "demo-mini-medium.firebaseapp.com",
  projectId: "demo-mini-medium",
});

const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

async function main() {
  const email = "writer@example.com";
  const password = "password123";

  let user;
  try {
    user = (await createUserWithEmailAndPassword(auth, email, password)).user;
  } catch (error) {
    if (error?.code !== "auth/email-already-in-use") throw error;
    user = (await signInWithEmailAndPassword(auth, email, password)).user;
  }

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    displayName: "Ada Lovelace",
    email,
    bio: "Notes on computing, poetry, and the machines that write with us.",
    role: "writer",
    createdAt: serverTimestamp(),
  });

  const existing = await getDocs(
    query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("slug", "==", "why-we-write"),
    ),
  );
  if (existing.empty) {
    await addDoc(collection(db, "posts"), {
      authorId: user.uid,
      authorName: "Ada Lovelace",
      title: "Why we write",
      slug: "why-we-write",
      canonicalPath: "/post/why-we-write",
      content:
        "Writing is how a private thought becomes a public one.\n\nThis is a demo post so you can see SEO tags, author pages, and tags working locally.",
      tags: ["writing", "demo"],
      status: "published",
      createdAt: serverTimestamp(),
      publishedAt: serverTimestamp(),
      viewCount: 0,
    });
  }

  console.log(`Seeded writer ${user.uid} and post /post/why-we-write`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
