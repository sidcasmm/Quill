import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
