import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PostBodyWithAds } from "@/components/PostBodyWithAds";
import { ViewTracker } from "@/components/ViewTracker";
import { formatDate, readingTimeMinutes, toExcerpt } from "@/lib/excerpt";
import { postCanonicalUrl, siteConfig } from "@/lib/config";
import { getPublishedPostBySlug } from "@/lib/posts";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return { title: "Story not found" };
  }

  const description = toExcerpt(post.content, 160) || siteConfig.description;
  const url = postCanonicalUrl(post.slug);

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: siteConfig.name,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.publishedAt ?? undefined,
      authors: [post.authorName],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const description = toExcerpt(post.content, 160);
  const minutes = readingTimeMinutes(post.content);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName,
      url: `${siteConfig.url}/author/${post.authorId}`,
    },
    mainEntityOfPage: postCanonicalUrl(post.slug),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker postId={post.id} />
      <article>
        <header className="border-b border-line pb-8">
          {post.tags.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-line/70 px-2.5 py-0.5 text-xs text-muted hover:text-ink"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-muted">
            By{" "}
            <Link href={`/author/${post.authorId}`} className="text-ink underline">
              {post.authorName}
            </Link>
            {post.publishedAt ? (
              <>
                {" · "}
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              </>
            ) : null}
            {` · ${minutes} min read`}
          </p>
        </header>
        <PostBodyWithAds content={post.content} />
      </article>
    </main>
  );
}
