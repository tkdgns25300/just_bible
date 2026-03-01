import { BOOKS } from "@/constants/bible";
import { MAX_KEYWORD_RESULTS, type SearchScope } from "@/constants/search";
import { getChosung, isChosung } from "@/lib/chosung";
import type { BibleTranslation, Book } from "@/types/bible";

const OLD_TESTAMENT_MAX_ID = 39;

function filterBooks(books: Book[], scope: SearchScope): Book[] {
  if (scope === "all") return books;
  if (scope === "old") return books.filter((b) => b.id <= OLD_TESTAMENT_MAX_ID);
  if (scope === "new") return books.filter((b) => b.id > OLD_TESTAMENT_MAX_ID);
  return books.filter((b) => b.id === scope);
}

export interface SearchResult {
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export type ParsedQuery =
  | { mode: "crossChapterRange"; bookId: number; chapterStart: number; verseStart: number; chapterEnd: number; verseEnd: number }
  | { mode: "range"; bookId: number; chapter: number; verseStart: number; verseEnd: number }
  | { mode: "verse"; bookId: number; chapter: number; verse: number }
  | { mode: "chapterRange"; bookId: number; chapterStart: number; chapterEnd: number }
  | { mode: "chapter"; bookId: number; chapter: number }
  | { mode: "book"; bookId: number }
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
  return nameToId.get(input) ?? abbrToId.get(input) ?? (isChosung(input) ? chosungToId.get(input) : null) ?? null;
}

// 교차 장 범위: "창1:2-2:2", "창세기 1장 2절-2장 2절"
const CROSS_CHAPTER_RANGE = /^(.+?)\s*(\d+)\s*[:장]\s*(\d+)\s*(?:절\s*)?[-~]\s*(\d+)\s*[:장]\s*(\d+)\s*절?$/;
// 단일 장 범위: "창 1:1-10", "롬8:1~5"
const SINGLE_CHAPTER_RANGE = /^(.+?)\s*(\d+)\s*[:장]\s*(\d+)\s*[-~]\s*(\d+)\s*절?$/;
// 장절: "창 1:1", "창세기 1장 1절"
const VERSE = /^(.+?)\s*(\d+)\s*[:장]\s*(\d+)\s*절?$/;
// 장 범위: "창 1-3", "창세기 1~3장"
const CHAPTER_RANGE = /^(.+?)\s*(\d+)\s*[-~]\s*(\d+)\s*장?$/;
// 장: "창 1", "창세기 1장"
const CHAPTER = /^(.+?)\s*(\d+)\s*장?$/;

export function parseQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  if (!trimmed) return { mode: "keyword", keyword: "" };

  let match: RegExpMatchArray | null;

  // 교차 장 범위
  match = trimmed.match(CROSS_CHAPTER_RANGE);
  if (match) {
    const bookId = resolveBook(match[1].trim());
    if (bookId) {
      return {
        mode: "crossChapterRange",
        bookId,
        chapterStart: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        chapterEnd: parseInt(match[4]),
        verseEnd: parseInt(match[5]),
      };
    }
  }

  // 단일 장 범위
  match = trimmed.match(SINGLE_CHAPTER_RANGE);
  if (match) {
    const bookId = resolveBook(match[1].trim());
    if (bookId) {
      return {
        mode: "range",
        bookId,
        chapter: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        verseEnd: parseInt(match[4]),
      };
    }
  }

  // 장절
  match = trimmed.match(VERSE);
  if (match) {
    const bookId = resolveBook(match[1].trim());
    if (bookId) {
      return {
        mode: "verse",
        bookId,
        chapter: parseInt(match[2]),
        verse: parseInt(match[3]),
      };
    }
  }

  // 장 범위
  match = trimmed.match(CHAPTER_RANGE);
  if (match) {
    const bookId = resolveBook(match[1].trim());
    if (bookId) {
      return {
        mode: "chapterRange",
        bookId,
        chapterStart: parseInt(match[2]),
        chapterEnd: parseInt(match[3]),
      };
    }
  }

  // 장
  match = trimmed.match(CHAPTER);
  if (match) {
    const bookId = resolveBook(match[1].trim());
    if (bookId) {
      return {
        mode: "chapter",
        bookId,
        chapter: parseInt(match[2]),
      };
    }
  }

  // 권명만: "창세기", "ㅊㅅㄱ", "창"
  const bookId = resolveBook(trimmed);
  if (bookId) {
    return { mode: "book", bookId };
  }

  // 키워드 검색
  return { mode: "keyword", keyword: trimmed };
}

export function searchBible(bible: BibleTranslation, query: string, scope: SearchScope = "all"): SearchResult[] {
  const parsed = parseQuery(query);

  if (parsed.mode === "keyword") {
    if (!parsed.keyword) return [];
    const results: SearchResult[] = [];
    const books = filterBooks(bible.books, scope);
    for (const book of books) {
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

  if (parsed.mode === "book") {
    const results: SearchResult[] = [];
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        results.push({
          bookName: book.name,
          chapter: chapter.chapter,
          verse: verse.verse,
          text: verse.text,
        });
      }
    }
    return results;
  }

  if (parsed.mode === "chapterRange") {
    const results: SearchResult[] = [];
    for (const chapter of book.chapters) {
      if (chapter.chapter >= parsed.chapterStart && chapter.chapter <= parsed.chapterEnd) {
        for (const verse of chapter.verses) {
          results.push({
            bookName: book.name,
            chapter: chapter.chapter,
            verse: verse.verse,
            text: verse.text,
          });
        }
      }
    }
    return results;
  }

  if (parsed.mode === "crossChapterRange") {
    const results: SearchResult[] = [];
    for (const chapter of book.chapters) {
      if (chapter.chapter < parsed.chapterStart || chapter.chapter > parsed.chapterEnd) continue;
      for (const verse of chapter.verses) {
        if (chapter.chapter === parsed.chapterStart && verse.verse < parsed.verseStart) continue;
        if (chapter.chapter === parsed.chapterEnd && verse.verse > parsed.verseEnd) continue;
        results.push({
          bookName: book.name,
          chapter: chapter.chapter,
          verse: verse.verse,
          text: verse.text,
        });
      }
    }
    return results;
  }

  if (parsed.mode === "chapter") {
    const chapter = book.chapters.find((c) => c.chapter === parsed.chapter);
    if (!chapter) return [];
    return chapter.verses.map((v) => ({
      bookName: book.name,
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
    return [{ bookName: book.name, chapter: parsed.chapter, verse: verse.verse, text: verse.text }];
  }

  if (parsed.mode === "range") {
    const chapter = book.chapters.find((c) => c.chapter === parsed.chapter);
    if (!chapter) return [];
    return chapter.verses
      .filter((v) => v.verse >= parsed.verseStart && v.verse <= parsed.verseEnd)
      .map((v) => ({
        bookName: book.name,
        chapter: parsed.chapter,
        verse: v.verse,
        text: v.text,
      }));
  }

  return [];
}
