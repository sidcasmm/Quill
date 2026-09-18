"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { ModerationList } from "@/components/ModerationList";

export default function ModerationPage() {
  return (
    <RequireAuth admin>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl">Moderation</h1>
        <p className="mt-2 text-muted">
          Admins can edit or remove any post. This is how you keep the public
          catalog clean.
        </p>
        <div className="mt-8">
          <ModerationList />
        </div>
      </main>
    </RequireAuth>
  );
}
