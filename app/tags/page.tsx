import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { siteConfig } from "@/lib/config";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tags",
  description: `Browse stories by topic on ${siteConfig.name}.`,
};

export default async function TagsPage() {
  const posts = await getPublishedPosts(200);
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl">Browse by tag</h1>
      <p className="mt-2 max-w-xl text-muted">
        Topics pulled from published stories, so this page stays in sync with what
        writers actually ship.
      </p>
      {tags.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No tags yet"
            body="Tags appear here after writers publish posts with them."
          />
        </div>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-3">
          {tags.map(([tag, count]) => (
            <li key={tag}>
              <Link
                href={`/tag/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 text-sm hover:border-ink"
              >
                <span>#{tag}</span>
                <span className="text-muted">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
