"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, profile, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const editorMode = pathname.startsWith("/dashboard/new") || pathname.startsWith("/dashboard/edit");

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-serif text-2xl tracking-tight text-ink">
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/tags"
            className="hidden text-muted hover:text-ink sm:inline"
          >
            Tags
          </Link>

          {loading ? (
            <span className="h-4 w-16 animate-pulse rounded bg-line" />
          ) : firebaseUser ? (
            <>
              {!editorMode && (
                <Link
                  href="/dashboard/new"
                  className="rounded-full bg-ink px-3.5 py-1.5 text-paper-2 hover:bg-black"
                >
                  Write
                </Link>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-medium text-white"
                  aria-label="Account menu"
                >
                  {(profile?.displayName || firebaseUser.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-line bg-paper-2 py-1 shadow-lg">
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-sm hover:bg-paper"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-3 py-2 text-sm hover:bg-paper"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/earnings"
                      className="block px-3 py-2 text-sm hover:bg-paper"
                      onClick={() => setMenuOpen(false)}
                    >
                      Earnings
                    </Link>
                    {profile?.role === "admin" && (
                      <>
                        <Link
                          href="/dashboard/moderation"
                          className="block px-3 py-2 text-sm hover:bg-paper"
                          onClick={() => setMenuOpen(false)}
                        >
                          Moderation
                        </Link>
                        <Link
                          href="/dashboard/payouts"
                          className="block px-3 py-2 text-sm hover:bg-paper"
                          onClick={() => setMenuOpen(false)}
                        >
                          Payouts
                        </Link>
                      </>
                    )}
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-paper"
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                        router.push("/");
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-ink px-3.5 py-1.5 text-paper-2 hover:bg-black"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
