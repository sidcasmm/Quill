"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { getDb } from "@/lib/firebase/client";
import { firebaseErrorMessage } from "@/lib/firebase-errors";
import { defaultWriterPercent, formatMoney } from "@/lib/money";
import {
  downloadCsv,
  getRevenueShareConfig,
  listAllPayouts,
  payoutsToCsv,
  REVENUE_SHARE_DOC,
} from "@/lib/payouts";
import type { Payout } from "@/lib/types";

export default function AdminPayoutsPage() {
  return (
    <RequireAuth admin>
      <PayoutsAdmin />
    </RequireAuth>
  );
}

function PayoutsAdmin() {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [writerPercent, setWriterPercent] = useState(defaultWriterPercent());
  const [monthFilter, setMonthFilter] = useState("all");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingShare, setSavingShare] = useState(false);

  async function load() {
    const [rows, share] = await Promise.all([
      listAllPayouts(),
      getRevenueShareConfig(),
    ]);
    setPayouts(rows);
    setWriterPercent(share.writerPercent);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [rows, share] = await Promise.all([
          listAllPayouts(),
          getRevenueShareConfig(),
        ]);
        if (cancelled) return;
        setPayouts(rows);
        setWriterPercent(share.writerPercent);
      } catch (err) {
        if (!cancelled) setError(firebaseErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const months = useMemo(() => {
    const unique = [...new Set((payouts ?? []).map((row) => row.month))];
    return unique.sort().reverse();
  }, [payouts]);

  const visible = useMemo(() => {
    if (!payouts) return [];
    if (monthFilter === "all") return payouts;
    return payouts.filter((row) => row.month === monthFilter);
  }, [monthFilter, payouts]);

  async function saveShare(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingShare(true);
    try {
      await setDoc(doc(getDb(), ...REVENUE_SHARE_DOC), {
        writerPercent: Number(writerPercent),
        updatedAt: serverTimestamp(),
      });
      setNotice("Revenue share saved. New monthly imports will use this rate.");
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setSavingShare(false);
    }
  }

  async function markPaid(payout: Payout) {
    if (!window.confirm(`Mark ${payout.month} for ${payout.authorName || payout.authorId} as paid?`)) {
      return;
    }
    setError("");
    await updateDoc(doc(getDb(), "payouts", payout.id), {
      status: "paid",
      paidAt: serverTimestamp(),
      authorId: payout.authorId,
      authorName: payout.authorName,
      month: payout.month,
      totalAdRevenue: payout.totalAdRevenue,
      writerShare: payout.writerShare,
    });
    await load();
  }

  function exportCsv() {
    const rows = visible;
    const label = monthFilter === "all" ? "all" : monthFilter;
    downloadCsv(`payouts-${label}.csv`, payoutsToCsv(rows));
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-muted">
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-4xl">Payouts</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Monthly writer shares from AdSense, joined by post URL slug. Mark a row
        paid after you transfer the money. Automatic disbursement is not enabled.
      </p>

      <form
        onSubmit={saveShare}
        className="mt-8 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-paper-2 p-5"
      >
        <label className="text-sm">
          Writer share (%)
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={writerPercent}
            onChange={(e) => setWriterPercent(Number(e.target.value))}
            className="mt-1 block w-28 rounded-lg border border-line bg-paper px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <button
          type="submit"
          disabled={savingShare}
          className="rounded-full bg-ink px-4 py-2 text-sm text-paper-2 disabled:opacity-60"
        >
          {savingShare ? "Saving…" : "Save rate"}
        </button>
        <p className="text-sm text-muted">
          Used when the monthly AdSense import runs. Platform keeps the rest.
        </p>
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <label className="text-sm">
          Month
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="ml-2 rounded-lg border border-line bg-paper-2 px-3 py-2"
          >
            <option value="all">All months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-forest">{notice}</p> : null}

      <section className="mt-6">
        {payouts === null ? (
          <p className="text-muted">Loading payouts…</p>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No payout records"
            body="This table fills in after a monthly AdSense earnings import. That job is a Cloud Function and needs the Blaze plan — it is not enabled yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 font-medium">Month</th>
                  <th className="py-2 font-medium">Author</th>
                  <th className="py-2 font-medium">Ad revenue</th>
                  <th className="py-2 font-medium">Writer share</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id} className="border-b border-line/70">
                    <td className="py-3 pr-4">{row.month}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/author/${row.authorId}`} className="underline">
                        {row.authorName || row.authorId}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{formatMoney(row.totalAdRevenue)}</td>
                    <td className="py-3 pr-4">{formatMoney(row.writerShare)}</td>
                    <td className="py-3 pr-4 capitalize">{row.status}</td>
                    <td className="py-3 text-right">
                      {row.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => markPaid(row)}
                          className="text-forest underline"
                        >
                          Mark paid
                        </button>
                      ) : (
                        <span className="text-muted">Paid</span>
                      )}
                    </td>
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
