"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDb } from "@/lib/firebase/client";
import { formatDate } from "@/lib/excerpt";
import { postFromData } from "@/lib/posts";
import type { PostView } from "@/lib/types";

export function WriterPostList({ authorId }: { authorId: string }) {
  const [posts, setPosts] = useState<PostView[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(
      collection(getDb(), "posts"),
      where("authorId", "==", authorId),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => setPosts(snap.docs.map((d) => postFromData(d.id, d.data()))),
      (err) => setError(err.message),
    );
    return unsub;
  }, [authorId]);

  async function handleDelete(post: PostView) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    await deleteDoc(doc(getDb(), "posts", post.id));
  }

  if (error) return <p className="text-red-700">{error}</p>;
  if (!posts) return <p className="text-muted">Loading your posts…</p>;
  if (posts.length === 0) {
    return (
      <p className="text-muted">
        No posts yet.{" "}
        <Link href="/dashboard/new" className="text-ink underline">
          Write your first story
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium">Views</th>
            <th className="py-2 font-medium sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-line/70">
              <td className="py-3 pr-4">
                <Link href={`/dashboard/edit/${post.id}`} className="hover:underline">
                  {post.title || "Untitled"}
                </Link>
              </td>
              <td className="py-3 pr-4 capitalize text-muted">{post.status}</td>
              <td className="py-3 pr-4 text-muted">
                {formatDate(post.publishedAt || post.createdAt)}
              </td>
              <td className="py-3 pr-4 text-muted">{post.viewCount}</td>
              <td className="py-3 text-right">
                <Link
                  href={`/dashboard/edit/${post.id}`}
                  className="mr-3 text-ink underline"
                >
                  Edit
                </Link>
                {post.status === "published" && post.slug ? (
                  <Link
                    href={`/post/${post.slug}`}
                    className="mr-3 text-muted underline"
                  >
                    View
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  className="text-red-700 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
