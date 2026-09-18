import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-3 text-muted">That URL does not match a story or page on this site.</p>
      <Link href="/" className="mt-6 inline-block underline">
        Back to the homepage
      </Link>
    </main>
  );
}
