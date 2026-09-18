import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { isFirebaseConfigured } from "@/lib/config";
import { getDb } from "@/lib/firebase/client";
import { defaultWriterPercent } from "@/lib/money";
import type { Payout, PayoutStatus, RevenueShareConfig } from "@/lib/types";

export const REVENUE_SHARE_DOC = ["config", "revenueShare"] as const;

export function payoutFromData(id: string, data: DocumentData): Payout {
  const total =
    typeof data.totalAdRevenue === "number"
      ? data.totalAdRevenue
      : Number(data.adRevenue ?? 0);
  const status: PayoutStatus = data.status === "paid" ? "paid" : "pending";
  return {
    id,
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    month: String(data.month ?? ""),
    totalAdRevenue: total,
    writerShare: Number(data.writerShare ?? 0),
    status,
    paidAt:
      data.paidAt && typeof data.paidAt === "object" && "toDate" in data.paidAt
        ? data.paidAt.toDate().toISOString()
        : typeof data.paidAt === "string"
          ? data.paidAt
          : null,
  };
}

export function shareConfigFromData(data: DocumentData | undefined): RevenueShareConfig {
  const writerPercent = Number(data?.writerPercent);
  return {
    writerPercent: Number.isFinite(writerPercent)
      ? Math.min(100, Math.max(0, writerPercent))
      : defaultWriterPercent(),
  };
}

export async function getRevenueShareConfig(): Promise<RevenueShareConfig> {
  if (!isFirebaseConfigured()) {
    return { writerPercent: defaultWriterPercent() };
  }
  const snap = await getDoc(doc(getDb(), ...REVENUE_SHARE_DOC));
  return shareConfigFromData(snap.exists() ? snap.data() : undefined);
}

export function payoutsToCsv(payouts: Payout[]) {
  const headers = [
    "month",
    "authorId",
    "authorName",
    "totalAdRevenue",
    "writerShare",
    "status",
    "paidAt",
  ];
  const lines = [
    headers.join(","),
    ...payouts.map((payout) =>
      [
        payout.month,
        payout.authorId,
        csvCell(payout.authorName),
        payout.totalAdRevenue.toFixed(2),
        payout.writerShare.toFixed(2),
        payout.status,
        payout.paidAt ?? "",
      ].join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function listPayoutsForAuthor(authorId: string): Promise<Payout[]> {
  const snap = await getDocs(
    query(
      collection(getDb(), "payouts"),
      where("authorId", "==", authorId),
      orderBy("month", "desc"),
    ),
  );
  return snap.docs.map((d) => payoutFromData(d.id, d.data()));
}

export async function listAllPayouts(): Promise<Payout[]> {
  const snap = await getDocs(
    query(collection(getDb(), "payouts"), orderBy("month", "desc")),
  );
  return snap.docs.map((d) => payoutFromData(d.id, d.data()));
}
