"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { WriterPostList } from "@/components/WriterPostList";

export default function DashboardPage() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Writer dashboard</p>
          <h1 className="font-serif text-4xl">Hello, {profile.displayName}</h1>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-full bg-ink px-4 py-2 text-sm text-paper-2 hover:bg-black"
        >
          New post
        </Link>
      </div>
      <p className="mt-4">
        <Link href="/dashboard/earnings" className="text-sm text-muted underline">
          View earnings
        </Link>
        {profile.role === "admin" ? (
          <>
            {" · "}
            <Link href="/dashboard/payouts" className="text-sm text-muted underline">
              Payouts
            </Link>
          </>
        ) : null}
      </p>
      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl">Your posts</h2>
        <WriterPostList authorId={profile.uid} />
      </section>
    </main>
  );
}
