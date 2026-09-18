import Link from "next/link";
import { siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. Stories from independent
          writers.
        </p>
        <div className="flex gap-4">
          <Link href="/tags" className="hover:text-ink">
            Browse tags
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Write
          </Link>
        </div>
      </div>
    </footer>
  );
}
