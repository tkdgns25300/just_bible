"use client";

import { useState } from "react";
import { BOOKS, OLD_TESTAMENT_COUNT } from "@/constants/bible";
import type { BibleTranslation } from "@/types/bible";
import ContextViewer from "@/components/context-viewer";

interface BibleBrowserProps {
  bible: BibleTranslation | null;
  fontSizeClass: string;
}

export default function BibleBrowser({ bible, fontSizeClass }: BibleBrowserProps) {
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const selectedBookMeta = BOOKS.find((b) => b.id === selectedBookId)!;

  function handleBookChange(bookId: number) {
    setSelectedBookId(bookId);
    setSelectedChapter(1);
  }

  function handleRead() {
    if (!bible) return;
    setIsOpen(true);
  }

  function handleChapterChange(bookId: number, chapter: number) {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
  }

  const book = bible?.books.find((b) => b.id === selectedBookId);
  const chapter = book?.chapters.find((c) => c.chapter === selectedChapter);

  return (
    <>
      <div className="flex items-center justify-center gap-2">
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
          onChange={(e) => setSelectedChapter(Number(e.target.value))}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm
            dark:border-gray-700 dark:bg-gray-800"
        >
          {Array.from({ length: selectedBookMeta.chapters }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={ch}>{ch}장</option>
          ))}
        </select>
        <button
          onClick={handleRead}
          disabled={!bible}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white
            transition-colors hover:bg-gray-700 disabled:opacity-40
            dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          읽기
        </button>
      </div>
      {isOpen && book && chapter && (
        <ContextViewer
          bookName={selectedBookMeta.name}
          chapter={chapter}
          fontSizeClass={fontSizeClass}
          onClose={() => setIsOpen(false)}
          bookId={selectedBookId}
          onChapterChange={handleChapterChange}
        />
      )}
    </>
  );
}
