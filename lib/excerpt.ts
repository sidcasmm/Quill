export function toExcerpt(markdown: string, max = 160) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function readingTimeMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function splitAfterFirstParagraph(markdown: string): [string, string] {
  const trimmed = markdown.trim();
  if (!trimmed) return ["", ""];
  const parts = trimmed.split(/\n\s*\n/);
  if (parts.length < 2) return [trimmed, ""];
  return [parts[0], parts.slice(1).join("\n\n")];
}

export function parseTags(input: string) {
  return [
    ...new Set(
      input
        .split(",")
        .map((tag) =>
          tag
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
        )
        .filter(Boolean),
    ),
  ].slice(0, 8);
}
