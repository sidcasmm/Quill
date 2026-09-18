"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDb } from "@/lib/firebase/client";
import { formatDate } from "@/lib/excerpt";
import { postFromData } from "@/lib/posts";
import type { PostView } from "@/lib/types";

export function ModerationList() {
  const [posts, setPosts] = useState<PostView[] | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(getDb(), "posts"), orderBy("createdAt", "desc")),
      (snap) => setPosts(snap.docs.map((d) => postFromData(d.id, d.data()))),
    );
    return unsub;
  }, []);

  async function handleDelete(post: PostView) {
    if (!window.confirm(`Remove “${post.title}” from the site?`)) return;
    await deleteDoc(doc(getDb(), "posts", post.id));
  }

  if (!posts) return <p className="text-muted">Loading all posts…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Author</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Date</th>
            <th className="py-2 font-medium sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-line/70">
              <td className="py-3 pr-4">{post.title || "Untitled"}</td>
              <td className="py-3 pr-4">
                <Link href={`/author/${post.authorId}`} className="underline">
                  {post.authorName}
                </Link>
              </td>
              <td className="py-3 pr-4 capitalize">{post.status}</td>
              <td className="py-3 pr-4 text-muted">
                {formatDate(post.createdAt)}
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/dashboard/edit/${post.id}`}
                  className="mr-3 underline"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className="text-red-700 underline"
                  onClick={() => handleDelete(post)}
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
