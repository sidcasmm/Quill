"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { formatMoney } from "@/lib/money";
import { listPayoutsForAuthor } from "@/lib/payouts";
import type { Payout } from "@/lib/types";
import { EmptyState } from "@/components/EmptyState";

export default function EarningsPage() {
  const { profile } = useAuth();
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    listPayoutsForAuthor(profile.uid)
      .then(setPayouts)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Could not load earnings."),
      );
  }, [profile]);

  const pending = useMemo(
    () =>
      (payouts ?? [])
        .filter((row) => row.status === "pending")
        .reduce((sum, row) => sum + row.writerShare, 0),
    [payouts],
  );
  const paid = useMemo(
    () =>
      (payouts ?? [])
        .filter((row) => row.status === "paid")
        .reduce((sum, row) => sum + row.writerShare, 0),
    [payouts],
  );

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted">
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-4xl">Earnings</h1>
      <p className="mt-2 max-w-xl text-muted">
        Your share of ad revenue from stories you published. Payouts are marked
        paid after a manual transfer.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-paper-2 p-5">
          <p className="text-sm text-muted">Pending</p>
          <p className="mt-1 font-serif text-3xl">{formatMoney(pending)}</p>
        </div>
        <div className="rounded-xl border border-line bg-paper-2 p-5">
          <p className="text-sm text-muted">Paid to date</p>
          <p className="mt-1 font-serif text-3xl">{formatMoney(paid)}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl">History</h2>
        {error ? <p className="text-red-700">{error}</p> : null}
        {payouts === null ? (
          <p className="text-muted">Loading earnings…</p>
        ) : payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            body="When monthly AdSense reports are imported, your share for each month will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 font-medium">Month</th>
                  <th className="py-2 font-medium">Ad revenue</th>
                  <th className="py-2 font-medium">Your share</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((row) => (
                  <tr key={row.id} className="border-b border-line/70">
                    <td className="py-3 pr-4">{row.month}</td>
                    <td className="py-3 pr-4">{formatMoney(row.totalAdRevenue)}</td>
                    <td className="py-3 pr-4">{formatMoney(row.writerShare)}</td>
                    <td className="py-3 capitalize">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
