import type { MetadataRoute } from "next";
import { postCanonicalUrl, siteConfig } from "@/lib/config";
import { getPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts(1000);
  const lastPost = posts[0]?.publishedAt
    ? new Date(posts[0].publishedAt)
    : new Date();

  return [
    {
      url: siteConfig.url,
      lastModified: lastPost,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/tags`,
      lastModified: lastPost,
      changeFrequency: "daily",
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: postCanonicalUrl(post.slug),
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
