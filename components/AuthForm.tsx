"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { siteConfig } from "@/lib/config";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.7S8.9 6 12 6c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.7 3.5 14.5 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 11.7S6.8 20.9 12 20.9c5.5 0 9.1-3.9 9.1-9.3 0-.6 0-1-.1-1.4H12z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp, signInWithGoogle, configured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace(mode === "signup" ? "/onboarding" : next);
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.replace("/onboarding");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-muted">
        Firebase is not configured. Copy `.env.example` to `.env.local` and
        restart the app.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-serif text-4xl tracking-tight">
        {mode === "login" ? `Welcome back to ${siteConfig.name}` : "Join as a writer"}
      </h1>
      <p className="mt-2 text-muted">
        {mode === "login"
          ? "Sign in to write, edit, and publish."
          : "Create an account to start drafting your first story."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2.5 text-sm font-medium hover:bg-paper disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-line" />
        or email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-paper-2 px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-hover disabled:opacity-60"
        >
          {submitting
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/signup" className="text-ink underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already writing here?{" "}
            <Link href="/login" className="text-ink underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
