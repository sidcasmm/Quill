import Link from "next/link";
import { formatDate, readingTimeMinutes, toExcerpt } from "@/lib/excerpt";
import type { PostView } from "@/lib/types";

export function PostCard({ post }: { post: PostView }) {
  const excerpt = toExcerpt(post.content, 180);
  const minutes = readingTimeMinutes(post.content);

  return (
    <article className="border-b border-line py-8">
      <p className="text-sm text-muted">
        <Link href={`/author/${post.authorId}`} className="hover:text-ink">
          {post.authorName}
        </Link>
        {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ""}
        {` · ${minutes} min read`}
      </p>
      <h2 className="mt-2 font-serif text-2xl leading-snug tracking-tight">
        <Link href={`/post/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>
      {excerpt ? (
        <p className="mt-2 max-w-2xl text-[17px] leading-7 text-muted">{excerpt}</p>
      ) : null}
      {post.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
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
    </article>
  );
}
