import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { isFirebaseConfigured, siteConfig } from "@/lib/config";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Stories from independent writers`,
  description: siteConfig.description,
};

export default async function HomePage() {
  const posts = await getPublishedPosts(50);
  const configured = isFirebaseConfigured();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className="border-b border-line py-14 sm:py-20">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          A writing community
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
          Human stories, published by the people who write them.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          {siteConfig.description} Create an account, draft in Markdown, and
          publish to a clean URL that search engines can actually read.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper-2 hover:bg-black"
          >
            Start writing
          </Link>
          <Link
            href="/tags"
            className="rounded-full border border-line px-5 py-2.5 text-sm hover:bg-paper-2"
          >
            Browse tags
          </Link>
        </div>
      </section>

      <section className="py-10" aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="font-serif text-3xl">
          Latest
        </h2>
        {!configured ? (
          <p className="mt-6 text-muted">
            Firebase is not configured yet. Copy `.env.example` to `.env.local`.
          </p>
        ) : posts.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No published stories yet"
              body="When a writer hits Publish, the post will appear here — newest first."
              action={
                <Link
                  href="/signup"
                  className="rounded-full bg-ink px-4 py-2 text-sm text-paper-2"
                >
                  Be the first to publish
                </Link>
              }
            />
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
