import { BOOKS } from "@/constants/bible";
import { MAX_KEYWORD_RESULTS } from "@/constants/search";
import { getChosung, isChosung } from "@/lib/chosung";
import type { BibleTranslation } from "@/types/bible";

export interface SearchResult {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

type ParsedQuery =
  | { mode: "range"; bookId: number; chapter: number; verseStart: number; verseEnd: number }
  | { mode: "verse"; bookId: number; chapter: number; verse: number }
  | { mode: "chapter"; bookId: number; chapter: number }
  | { mode: "keyword"; keyword: string };

const nameToId = new Map<string, number>();
const abbrToId = new Map<string, number>();
const chosungToId = new Map<string, number>();

for (const book of BOOKS) {
  nameToId.set(book.name, book.id);
  abbrToId.set(book.abbr, book.id);
  chosungToId.set(getChosung(book.name), book.id);
}

function resolveBook(input: string): number | null {
  return nameToId.get(input) ?? abbrToId.get(input) ?? chosungToId.get(input) ?? null;
}

export function parseQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  if (!trimmed) return { mode: "keyword", keyword: "" };

  // 범위: "창 1:1-10", "창세기 1:1~10", "롬8:1-5"
  const rangePattern = /^(.+?)\s*(\d+)\s*[:장]\s*(\d+)\s*[-~]\s*(\d+)\s*절?$/;
  const rangeMatch = trimmed.match(rangePattern);
  if (rangeMatch) {
    const bookId = resolveBook(rangeMatch[1].trim());
    if (bookId) {
      return {
        mode: "range",
        bookId,
        chapter: parseInt(rangeMatch[2]),
        verseStart: parseInt(rangeMatch[3]),
        verseEnd: parseInt(rangeMatch[4]),
      };
    }
  }

  // 장절: "창 1:1", "창세기 1장 1절"
  const versePattern = /^(.+?)\s*(\d+)\s*[:장]\s*(\d+)\s*절?$/;
  const verseMatch = trimmed.match(versePattern);
  if (verseMatch) {
    const bookId = resolveBook(verseMatch[1].trim());
    if (bookId) {
      return {
        mode: "verse",
        bookId,
        chapter: parseInt(verseMatch[2]),
        verse: parseInt(verseMatch[3]),
      };
    }
  }

  // 장: "창 1", "창세기 1장"
  const chapterPattern = /^(.+?)\s+(\d+)\s*장?$/;
  const chapterMatch = trimmed.match(chapterPattern);
  if (chapterMatch) {
    const bookId = resolveBook(chapterMatch[1].trim());
    if (bookId) {
      return {
        mode: "chapter",
        bookId,
        chapter: parseInt(chapterMatch[2]),
      };
    }
  }

  // 권명만: "창세기", "ㅊㅅㄱ"
  const bookId = resolveBook(trimmed);
  if (bookId) {
    return { mode: "chapter", bookId, chapter: 1 };
  }

  // 키워드 검색
  return { mode: "keyword", keyword: trimmed };
}

function getBookName(bookId: number): string {
  return BOOKS.find((b) => b.id === bookId)?.name ?? "";
}

export function searchBible(bible: BibleTranslation, query: string): SearchResult[] {
  const parsed = parseQuery(query);

  if (parsed.mode === "keyword") {
    if (!parsed.keyword) return [];
    const results: SearchResult[] = [];
    for (const book of bible.books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.text.includes(parsed.keyword)) {
            results.push({
              bookName: book.name,
              chapter: chapter.chapter,
              verse: verse.verse,
              text: verse.text,
            });
            if (results.length >= MAX_KEYWORD_RESULTS) return results;
          }
        }
      }
    }
    return results;
  }

  const book = bible.books.find((b) => b.id === parsed.bookId);
  if (!book) return [];

  const bookName = getBookName(parsed.bookId);

  if (parsed.mode === "chapter") {
    const chapter = book.chapters.find((c) => c.chapter === parsed.chapter);
    if (!chapter) return [];
    return chapter.verses.map((v) => ({
      bookName,
      chapter: parsed.chapter,
      verse: v.verse,
      text: v.text,
    }));
  }

  if (parsed.mode === "verse") {
    const chapter = book.chapters.find((c) => c.chapter === parsed.chapter);
    if (!chapter) return [];
    const verse = chapter.verses.find((v) => v.verse === parsed.verse);
    if (!verse) return [];
    return [{ bookName, chapter: parsed.chapter, verse: verse.verse, text: verse.text }];
  }

  if (parsed.mode === "range") {
    const chapter = book.chapters.find((c) => c.chapter === parsed.chapter);
    if (!chapter) return [];
    return chapter.verses
      .filter((v) => v.verse >= parsed.verseStart && v.verse <= parsed.verseEnd)
      .map((v) => ({
        bookName,
        chapter: parsed.chapter,
        verse: v.verse,
        text: v.text,
      }));
  }

  return [];
}
