import Script from "next/script";
import { adsenseConfig } from "@/lib/config";

export function AdSenseScript() {
  if (!adsenseConfig.enabled || !adsenseConfig.client) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
