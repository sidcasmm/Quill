import { siteConfig } from "@/lib/config";

export function formatMoney(amount: number) {
  const currency = siteConfig.payoutCurrency;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function defaultWriterPercent() {
  const raw = Number(process.env.NEXT_PUBLIC_DEFAULT_WRITER_PERCENT ?? "50");
  if (!Number.isFinite(raw)) return 50;
  return Math.min(100, Math.max(0, raw));
}
