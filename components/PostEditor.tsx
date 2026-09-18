"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { postPath } from "@/lib/config";
import { getDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth-context";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { parseTags } from "@/lib/excerpt";
import { ensureUniqueSlug, postFromData } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import type { PostView } from "@/lib/types";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function PostEditor({ postId }: { postId?: string }) {
  const { profile } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [existing, setExisting] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), "posts", postId));
        if (!snap.exists()) {
          setError("Post not found.");
          return;
        }
        const post = postFromData(snap.id, snap.data());
        if (cancelled) return;
        setExisting(post);
        setTitle(post.title);
        setContent(post.content);
        setTagInput(post.tags.join(", "));
      } catch (err) {
        setError(firebaseErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const previewSlug = useMemo(() => slugify(title), [title]);

  async function persist(publish: boolean) {
    if (!profile) return;
    setError("");
    setNotice("");
    if (publish && !title.trim()) {
      setError("Add a title before publishing.");
      return;
    }

    setSaving(publish ? "publish" : "draft");
    try {
      const tags = parseTags(tagInput);
      const slug = publish
        ? await ensureUniqueSlug(slugify(title), postId)
        : existing?.slug || "";
      const nextStatus = publish ? "published" : "draft";
      const payload = {
        authorId: existing?.authorId ?? profile.uid,
        authorName: existing?.authorName ?? profile.displayName,
        title: title.trim() || "Untitled",
        slug,
        canonicalPath: slug ? postPath(slug) : "",
        content,
        tags,
        status: nextStatus,
      };

      if (postId) {
        await updateDoc(doc(getDb(), "posts", postId), {
          ...payload,
          ...(publish && !existing?.publishedAt
            ? { publishedAt: serverTimestamp() }
            : {}),
        });
        setExisting((prev) =>
          prev
            ? {
                ...prev,
                ...payload,
                status: nextStatus,
                slug,
              }
            : prev,
        );
        setNotice(publish ? "Published." : "Draft saved.");
        if (publish) router.refresh();
      } else {
        const created = await addDoc(collection(getDb(), "posts"), {
          ...payload,
          createdAt: serverTimestamp(),
          publishedAt: publish ? serverTimestamp() : null,
          viewCount: 0,
        });
        router.replace(`/dashboard/edit/${created.id}`);
      }
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete() {
    if (!postId) return;
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    await deleteDoc(doc(getDb(), "posts", postId));
    router.replace("/dashboard");
  }

  if (loading) {
    return <div className="px-4 py-16 text-muted">Loading editor…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {existing?.status === "published" ? "Published" : "Draft"}
          {previewSlug ? ` · /post/${previewSlug}` : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          {postId ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => persist(false)}
            disabled={saving !== null}
            className="rounded-full border border-line px-4 py-1.5 text-sm hover:bg-paper-2 disabled:opacity-60"
          >
            {saving === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => persist(true)}
            disabled={saving !== null}
            className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-white hover:bg-forest-hover disabled:opacity-60"
          >
            {saving === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-700">{error}</p> : null}
      {notice ? (
        <p className="mb-4 text-sm text-forest">
          {notice}{" "}
          {existing?.status === "published" && existing.slug ? (
            <a href={`/post/${existing.slug}`} className="underline">
              View post
            </a>
          ) : null}
        </p>
      ) : null}

      <label className="sr-only" htmlFor="title">
        Title
      </label>
      <textarea
        id="title"
        rows={2}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full resize-none bg-transparent font-serif text-4xl leading-tight tracking-tight outline-none placeholder:text-line sm:text-5xl"
      />

      <label className="mt-4 block text-sm text-muted">
        Tags (comma separated)
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="writing, startups, design"
          className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 text-ink outline-none focus:border-ink"
        />
      </label>

      <div className="editor-shell mt-6" data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(value) => setContent(value ?? "")}
          height={520}
          preview="live"
          visibleDragbar={false}
          textareaProps={{ placeholder: "Tell your story in Markdown…" }}
        />
      </div>
    </div>
  );
}
