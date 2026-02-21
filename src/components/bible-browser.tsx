"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKS, OLD_TESTAMENT_COUNT } from "@/constants/bible";
import type { BibleTranslation } from "@/types/bible";

interface BibleBrowserProps {
  bible: BibleTranslation | null;
  fontSizeClass: string;
}

export default function BibleBrowser({ bible, fontSizeClass }: BibleBrowserProps) {
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [startVerse, setStartVerse] = useState(0);
  const [endVerse, setEndVerse] = useState(0);

  const selectedBookMeta = BOOKS.find((b) => b.id === selectedBookId)!;

  const book = bible?.books.find((b) => b.id === selectedBookId);
  const chapter = book?.chapters.find((c) => c.chapter === selectedChapter);
  const totalVerses = chapter?.verses.length ?? 0;

  function handleBookChange(bookId: number) {
    setSelectedBookId(bookId);
    setSelectedChapter(1);
    setStartVerse(0);
    setEndVerse(0);
  }

  function handleChapterChange(chapter: number) {
    setSelectedChapter(chapter);
    setStartVerse(0);
    setEndVerse(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartVerseChange(verse: number) {
    setStartVerse(verse);
    if (verse > 0 && endVerse > 0 && endVerse < verse) {
      setEndVerse(verse);
    }
  }

  function handleEndVerseChange(verse: number) {
    setEndVerse(verse);
    if (verse > 0 && startVerse === 0) {
      setStartVerse(verse);
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [selectedBookId]);

  const filteredVerses = useMemo(() => {
    if (!chapter) return [];
    if (startVerse === 0 && endVerse === 0) return chapter.verses;
    const from = startVerse || 1;
    const to = endVerse || totalVerses;
    return chapter.verses.filter((v) => v.verse >= from && v.verse <= to);
  }, [chapter, startVerse, endVerse, totalVerses]);

  const hasPrev = selectedChapter > 1;
  const hasNext = selectedChapter < selectedBookMeta.chapters;

  const displayLabel = startVerse > 0 || endVerse > 0
    ? `${chapter?.chapter}:${startVerse || 1}-${endVerse || totalVerses}절`
    : `${chapter?.chapter}장`;

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <select
          value={selectedBookId}
          onChange={(e) => handleBookChange(Number(e.target.value))}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm
            dark:border-gray-700 dark:bg-gray-800"
        >
          <optgroup label="구약">
            {BOOKS.slice(0, OLD_TESTAMENT_COUNT).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </optgroup>
          <optgroup label="신약">
            {BOOKS.slice(OLD_TESTAMENT_COUNT).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </optgroup>
        </select>
        <select
          value={selectedChapter}
          onChange={(e) => handleChapterChange(Number(e.target.value))}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm
            dark:border-gray-700 dark:bg-gray-800"
        >
          {Array.from({ length: selectedBookMeta.chapters }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={ch}>{ch}장</option>
          ))}
        </select>
        <select
          value={startVerse}
          onChange={(e) => handleStartVerseChange(Number(e.target.value))}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm
            dark:border-gray-700 dark:bg-gray-800"
        >
          <option value={0}>시작절</option>
          {Array.from({ length: totalVerses }, (_, i) => i + 1).map((v) => (
            <option key={v} value={v}>{v}절</option>
          ))}
        </select>
        <select
          value={endVerse}
          onChange={(e) => handleEndVerseChange(Number(e.target.value))}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm
            dark:border-gray-700 dark:bg-gray-800"
        >
          <option value={0}>끝절</option>
          {Array.from({ length: totalVerses - (startVerse > 0 ? startVerse - 1 : 0) }, (_, i) => i + (startVerse || 1)).map((v) => (
            <option key={v} value={v}>{v}절</option>
          ))}
        </select>
      </div>

      {chapter && (
        <div className="mt-8" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-4 flex items-baseline gap-2">
            <h2 className="text-lg font-bold">{selectedBookMeta.name}</h2>
            <span className="text-sm text-gray-400 dark:text-gray-500">{displayLabel}</span>
          </div>
          <div className="space-y-0">
            {filteredVerses.map((verse) => (
              <div
                key={verse.verse}
                className="flex gap-3 border-l-2 border-l-transparent py-3 pl-4 pr-2"
              >
                <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-gray-300 dark:text-gray-600">
                  {verse.verse}
                </span>
                <p className={`leading-[1.8] ${fontSizeClass}`}>
                  {verse.text}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              onClick={() => hasPrev && handleChapterChange(selectedChapter - 1)}
              disabled={!hasPrev}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium
                transition-colors hover:bg-gray-100 disabled:invisible
                dark:hover:bg-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clipRule="evenodd" />
              </svg>
              이전장
            </button>
            <button
              onClick={() => hasNext && handleChapterChange(selectedChapter + 1)}
              disabled={!hasNext}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium
                transition-colors hover:bg-gray-100 disabled:invisible
                dark:hover:bg-gray-800"
            >
              다음장
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
