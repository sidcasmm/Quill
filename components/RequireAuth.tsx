"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export function RequireAuth({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { firebaseUser, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
    if (admin && profile && profile.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [admin, firebaseUser, loading, pathname, profile, router]);

  if (loading || !firebaseUser || !profile || (admin && profile.role !== "admin")) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Loading…</div>
    );
  }

  return <>{children}</>;
}
