"use client";

import { useEffect } from "react";
import { adsenseConfig } from "@/lib/config";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdUnit({
  slot,
  label = "Advertisement",
}: {
  slot: string;
  label?: string;
}) {
  useEffect(() => {
    if (!adsenseConfig.enabled || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and missing script are expected in local dev.
    }
  }, [slot]);

  if (!adsenseConfig.enabled || !adsenseConfig.client || !slot) return null;

  return (
    <aside className="ad-slot" aria-label={label}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseConfig.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(adsenseConfig.testMode ? { "data-adtest": "on" } : {})}
      />
    </aside>
  );
}
