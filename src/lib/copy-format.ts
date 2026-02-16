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
