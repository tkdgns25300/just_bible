"use client";

import { useEffect, useRef } from "react";
import { BOOKS } from "@/constants/bible";
import type { Chapter } from "@/types/bible";

interface ContextViewerProps {
  bookName: string;
  chapter: Chapter;
  highlightVerse?: number;
  fontSizeClass: string;
  onClose: () => void;
  bookId?: number;
  onChapterChange?: (bookId: number, chapter: number) => void;
}

export default function ContextViewer({
  bookName,
  chapter,
  highlightVerse,
  fontSizeClass,
  onClose,
  bookId,
  onChapterChange,
}: ContextViewerProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (highlightVerse && highlightRef.current) {
      highlightRef.current.scrollIntoView({ block: "center" });
    }
  }, [highlightVerse]);

  useEffect(() => {
    if (!highlightVerse && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [chapter, highlightVerse]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const bookMeta = bookId ? BOOKS.find((b) => b.id === bookId) : undefined;
  const hasPrev = bookId !== undefined && chapter.chapter > 1;
  const hasNext = bookId !== undefined && bookMeta !== undefined && chapter.chapter < bookMeta.chapters;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${bookName} ${chapter.chapter}장`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: "fadeIn 0.2s ease-out" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative mx-2 flex max-h-[90vh] w-full max-w-2xl flex-col
          rounded-xl bg-white shadow-2xl dark:bg-gray-900 sm:mx-4"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold">{bookName}</h2>
            <span className="text-sm text-gray-400 dark:text-gray-500">{chapter.chapter}장</span>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-2 text-gray-400 transition-colors
              hover:bg-gray-100 hover:text-gray-600
              dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div ref={scrollContainerRef} className="overflow-y-auto px-6 pb-6">
          <div className="space-y-0">
            {chapter.verses.map((verse) => {
              const isHighlighted = highlightVerse !== undefined && verse.verse === highlightVerse;
              return (
                <div
                  key={verse.verse}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`flex gap-3 border-l-2 py-3 pl-4 pr-2 transition-colors ${
                    isHighlighted
                      ? "border-l-blue-500 bg-blue-50/60 dark:border-l-blue-400 dark:bg-blue-950/30"
                      : "border-l-transparent"
                  }`}
                >
                  <span className={`shrink-0 pt-0.5 text-xs tabular-nums ${
                    isHighlighted
                      ? "font-bold text-blue-500 dark:text-blue-400"
                      : "font-medium text-gray-300 dark:text-gray-600"
                  }`}>
                    {verse.verse}
                  </span>
                  <p className={`leading-[1.8] ${fontSizeClass}`}>
                    {verse.text}
                  </p>
                </div>
              );
            })}
          </div>
          {onChapterChange && bookId !== undefined && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <button
                onClick={() => hasPrev && onChapterChange(bookId, chapter.chapter - 1)}
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
                onClick={() => hasNext && onChapterChange(bookId, chapter.chapter + 1)}
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
          )}
        </div>
      </div>
    </div>
  );
}
