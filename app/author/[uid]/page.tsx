import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { siteConfig } from "@/lib/config";
import { getAuthorProfile, getPublishedPostsByAuthor } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const author = await getAuthorProfile(uid);
  if (!author) return { title: "Author not found" };
  const description = author.bio || `Stories by ${author.displayName} on ${siteConfig.name}.`;
  return {
    title: author.displayName,
    description,
    openGraph: {
      title: author.displayName,
      description,
      type: "profile",
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { uid } = await params;
  const author = await getAuthorProfile(uid);
  if (!author) notFound();
  const posts = await getPublishedPostsByAuthor(uid);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <header className="border-b border-line pb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">Author</p>
        <h1 className="mt-2 font-serif text-4xl">{author.displayName}</h1>
        {author.bio ? (
          <p className="mt-3 max-w-2xl text-lg leading-7 text-muted">{author.bio}</p>
        ) : null}
      </header>
      <section className="pt-6" aria-labelledby="author-posts">
        <h2 id="author-posts" className="sr-only">
          Published stories
        </h2>
        {posts.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No published stories yet"
              body={`${author.displayName} has not published anything yet.`}
            />
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </main>
  );
}
