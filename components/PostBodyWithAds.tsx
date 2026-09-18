import { AdUnit } from "@/components/AdUnit";
import { MarkdownBody } from "@/components/MarkdownBody";
import { adsenseConfig } from "@/lib/config";
import { splitAfterFirstParagraph } from "@/lib/excerpt";

export function PostBodyWithAds({ content }: { content: string }) {
  const [lead, rest] = splitAfterFirstParagraph(content);
  const showMidAd = Boolean(rest && adsenseConfig.slotInArticle);

  return (
    <div className="pt-8">
      <MarkdownBody content={lead} />
      {showMidAd ? (
        <AdUnit slot={adsenseConfig.slotInArticle} label="Advertisement" />
      ) : null}
      {rest ? <MarkdownBody content={rest} /> : null}
      <AdUnit slot={adsenseConfig.slotEnd} label="Advertisement" />
    </div>
  );
}
