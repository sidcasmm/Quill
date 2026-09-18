import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { isFirebaseConfigured, postPath } from "@/lib/config";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import type { PostView, UserProfile, UserRole } from "@/lib/types";

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === "object" &&
    value &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

export function postFromData(id: string, data: DocumentData): PostView {
  return {
    id,
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    canonicalPath: String(data.canonicalPath ?? (data.slug ? postPath(String(data.slug)) : "")),
    content: String(data.content ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    status: data.status === "published" ? "published" : "draft",
    createdAt: toIso(data.createdAt),
    publishedAt: toIso(data.publishedAt),
    viewCount: Number(data.viewCount ?? 0),
  };
}

export function userFromData(uid: string, data: DocumentData): UserProfile {
  const role: UserRole = data.role === "admin" ? "admin" : "writer";
  return {
    uid,
    displayName: String(data.displayName ?? ""),
    email: String(data.email ?? ""),
    bio: String(data.bio ?? ""),
    role,
    createdAt: toIso(data.createdAt),
  };
}

export async function getPublishedPosts(max = 50): Promise<PostView[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(getDb(), "posts"),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
        limit(max),
      ),
    );
    return snap.docs.map((d) => postFromData(d.id, d.data()));
  } catch (error) {
    console.error("Failed to load published posts", error);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PostView | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const snap = await getDocs(
      query(
        collection(getDb(), "posts"),
        where("status", "==", "published"),
        where("slug", "==", slug),
        limit(1),
      ),
    );
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return postFromData(docSnap.id, docSnap.data());
  } catch (error) {
    console.error("Failed to load post", error);
    return null;
  }
}

export async function getPublishedPostsByAuthor(authorId: string): Promise<PostView[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(getDb(), "posts"),
        where("authorId", "==", authorId),
        where("status", "==", "published"),
        orderBy("publishedAt", "desc"),
      ),
    );
    return snap.docs.map((d) => postFromData(d.id, d.data()));
  } catch (error) {
    console.error("Failed to load author posts", error);
    return [];
  }
}

export async function getPublishedPostsByTag(tag: string): Promise<PostView[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    const snap = await getDocs(
      query(
        collection(getDb(), "posts"),
        where("status", "==", "published"),
        where("tags", "array-contains", tag),
        orderBy("publishedAt", "desc"),
      ),
    );
    return snap.docs.map((d) => postFromData(d.id, d.data()));
  } catch (error) {
    console.error("Failed to load tagged posts", error);
    return [];
  }
}

export async function getAuthorProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const snap = await getDoc(doc(getDb(), "users", uid));
    if (!snap.exists()) return null;
    return userFromData(snap.id, snap.data());
  } catch (error) {
    console.error("Failed to load author", error);
    return null;
  }
}

export async function slugIsTaken(slug: string, excludePostId?: string) {
  const db = getDb();
  const published = await getDocs(
    query(
      collection(db, "posts"),
      where("status", "==", "published"),
      where("slug", "==", slug),
      limit(5),
    ),
  );
  if (published.docs.some((d) => d.id !== excludePostId)) return true;

  const uid = getFirebaseAuth().currentUser?.uid;
  if (!uid) return false;

  const mine = await getDocs(
    query(
      collection(db, "posts"),
      where("authorId", "==", uid),
      where("slug", "==", slug),
      limit(5),
    ),
  );
  return mine.docs.some((d) => d.id !== excludePostId);
}

export async function ensureUniqueSlug(base: string, excludePostId?: string) {
  let slug = base;
  let n = 2;
  while (await slugIsTaken(slug, excludePostId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}
