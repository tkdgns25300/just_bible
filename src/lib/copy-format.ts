import { BOOKS } from "@/constants/bible";
import type { CopyFormatId } from "@/constants/search";
import type { SearchResult } from "@/lib/search";

const nameToAbbr = new Map<string, string>();
for (const book of BOOKS) {
  nameToAbbr.set(book.name, book.abbr);
}

export function formatCopyText(
  result: SearchResult,
  translationName: string,
  format: CopyFormatId,
): string {
  const { text, bookName, chapter, verse } = result;
  const abbr = nameToAbbr.get(bookName) ?? bookName;

  switch (format) {
    case "default":
      return `"${text}" (${bookName} ${chapter}:${verse}, ${translationName})`;
    case "compact":
      return `${text} (${abbr}${chapter}:${verse})`;
    case "newline":
      return `${text}\n- ${bookName} ${chapter}:${verse} (${translationName})`;
    case "plain":
      return text;
  }
}

function formatVerseRange(results: SearchResult[]): string {
  if (results.length === 0) return "";
  if (results.length === 1) {
    const r = results[0];
    return `${r.bookName} ${r.chapter}:${r.verse}`;
  }
  const first = results[0];
  const last = results[results.length - 1];
  if (first.bookName === last.bookName && first.chapter === last.chapter) {
    return `${first.bookName} ${first.chapter}:${first.verse}-${last.verse}`;
  }
  return `${first.bookName} ${first.chapter}:${first.verse} - ${last.bookName} ${last.chapter}:${last.verse}`;
}

export function formatMultipleCopyText(
  results: SearchResult[],
  translationName: string,
  format: CopyFormatId,
): string {
  if (results.length === 0) return "";
  if (results.length === 1) return formatCopyText(results[0], translationName, format);

  const range = formatVerseRange(results);
  const abbr = nameToAbbr.get(results[0].bookName) ?? results[0].bookName;
  const first = results[0];
  const last = results[results.length - 1];
  const compactRange = first.bookName === last.bookName && first.chapter === last.chapter
    ? `${abbr}${first.chapter}:${first.verse}-${last.verse}`
    : `${abbr}${first.chapter}:${first.verse}-${nameToAbbr.get(last.bookName) ?? last.bookName}${last.chapter}:${last.verse}`;
  const body = results.map((r) => `${r.chapter}:${r.verse} ${r.text}`).join("\n");

  const lines = results.map((r) => r.text).join("\n");

  switch (format) {
    case "default":
      return `"${lines}" (${range}, ${translationName})`;
    case "compact":
      return `${lines} (${compactRange})`;
    case "newline":
      return `${body}\n- ${range} (${translationName})`;
    case "plain":
      return lines;
  }
}
