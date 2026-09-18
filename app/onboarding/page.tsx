"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { firebaseErrorMessage } from "@/lib/firebase-errors";

export default function OnboardingPage() {
  const { firebaseUser, profile, loading, completeProfile } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameValue = displayName ?? firebaseUser?.displayName ?? "";

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/signup");
      return;
    }
    if (profile) {
      router.replace("/dashboard");
    }
  }, [firebaseUser, loading, profile, router]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (nameValue.trim().length < 2) {
      setError("Display name needs at least 2 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await completeProfile(nameValue, bio);
      router.replace("/dashboard");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !firebaseUser || profile) {
    return <main className="px-4 py-16 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl">Set up your writer profile</h1>
      <p className="mt-2 text-muted">
        This name appears on every story you publish. You can edit it later.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Display name
          <input
            required
            maxLength={80}
            value={nameValue}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          Short bio
          <textarea
            maxLength={280}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A sentence or two about what you write."
            className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 outline-none focus:border-ink"
          />
          <span className="mt-1 block text-xs text-muted">{bio.length}/280</span>
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-hover disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Continue to dashboard"}
        </button>
      </form>
    </main>
  );
}
