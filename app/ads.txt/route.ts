import { adsenseConfig } from "@/lib/config";

export function GET() {
  if (!adsenseConfig.client || adsenseConfig.client.includes("xxxx")) {
    return new Response("Not configured\n", { status: 404 });
  }

  const publisher = adsenseConfig.client.replace(/^ca-/, "");
  const body = `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
