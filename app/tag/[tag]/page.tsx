import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { siteConfig } from "@/lib/config";
import { getPublishedPostsByTag } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const title = `#${decoded}`;
  const description = `Published stories tagged ${decoded} on ${siteConfig.name}.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag).toLowerCase();
  const posts = await getPublishedPostsByTag(decoded);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="border-b border-line pb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Tag</p>
        <h1 className="mt-2 font-serif text-4xl">#{decoded}</h1>
        <p className="mt-2 text-muted">
          {posts.length} {posts.length === 1 ? "story" : "stories"}
        </p>
      </header>
      {posts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing tagged here yet"
            body="When writers add this tag to a published post, it will show up on this page."
          />
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </main>
  );
}
