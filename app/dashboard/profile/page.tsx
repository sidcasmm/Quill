"use client";

import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { getDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth-context";
import { firebaseErrorMessage } from "@/lib/firebase-errors";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;
  const uid = profile.uid;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      await updateDoc(doc(getDb(), "users", uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      await refreshProfile();
      setNotice("Profile saved.");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl">Your profile</h1>
      <p className="mt-2 text-muted">
        Shown on your public author page. Your email stays in your account and is
        not rendered on the public site.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          Display name
          <input
            required
            maxLength={80}
            value={displayName}
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
            className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="text-sm text-forest">{notice}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink px-5 py-2.5 text-sm text-paper-2 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}
