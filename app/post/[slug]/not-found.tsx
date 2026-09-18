import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Story not found</h1>
      <p className="mt-3 text-muted">
        This post is missing, unpublished, or the URL is incorrect.
      </p>
      <Link href="/" className="mt-6 inline-block underline">
        Back to the homepage
      </Link>
    </main>
  );
}
