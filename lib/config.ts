function resolveSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // Empty or invalid values (common on first Vercel deploy) fall through.
    }
  }

  const vercelHost = process.env.VERCEL_URL?.trim().replace(/^https?:\/\//, "");
  if (vercelHost) {
    return `https://${vercelHost}`;
  }

  return "http://localhost:3000";
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Quill",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() ||
    "A place for writers to publish stories, and for readers to find them.",
  url: resolveSiteUrl(),
  payoutCurrency: process.env.NEXT_PUBLIC_PAYOUT_CURRENCY ?? "INR",
};

export function isFirebaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

export function postPath(slug: string) {
  return `/post/${slug}`;
}

export function postCanonicalUrl(slug: string) {
  return `${siteConfig.url}${postPath(slug)}`;
}

/** Strip origin, query, hash, and trailing slash so AdSense PAGE_URL rows join to slugs. */
export function pathFromAdSenseUrl(raw: string) {
  try {
    const url = raw.includes("://")
      ? new URL(raw)
      : new URL(raw, siteConfig.url);
    return url.pathname.replace(/\/$/, "") || "/";
  } catch {
    return raw.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  }
}

export function slugFromPostPath(path: string) {
  const match = path.match(/^\/post\/([^/]+)$/);
  return match?.[1] ?? null;
}

export const adsenseConfig = {
  enabled:
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT),
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  slotInArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ?? "",
  slotEnd: process.env.NEXT_PUBLIC_ADSENSE_SLOT_END ?? "",
  testMode: process.env.NEXT_PUBLIC_ADSENSE_TEST === "true",
};
