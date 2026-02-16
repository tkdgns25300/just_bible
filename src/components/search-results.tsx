"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RESULTS_PER_PAGE, type CopyFormatId } from "@/constants/search";
import { formatCopyText } from "@/lib/copy-format";
import type { SearchResult } from "@/lib/search";
import type { BibleTranslation } from "@/types/bible";
import ContextViewer from "@/components/context-viewer";
import Toast from "@/components/toast";

interface SearchResultsProps {
  results: SearchResult[];
  keyword?: string;
  translationName: string;
  copyFormat: CopyFormatId;
  fontSizeClass: string;
  bible: BibleTranslation | null;
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function HighlightedText({ text, keyword }: { text: string; keyword?: string }) {
  if (!keyword || !text.includes(keyword)) {
    return <>{text}</>;
  }

  const parts = text.split(keyword);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="bg-yellow-200 text-inherit dark:bg-yellow-700">
              {keyword}
            </mark>
          )}
        </span>
      ))}
    </>
  );
}

export default function SearchResults({
  results,
  keyword,
  translationName,
  copyFormat,
  fontSizeClass,
  bible,
}: SearchResultsProps) {
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextTarget, setContextTarget] = useState<SearchResult | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
  }, [results]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + RESULTS_PER_PAGE, results.length));
  }, [results.length]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  async function handleCopy(result: SearchResult) {
    const text = formatCopyText(result, translationName, copyFormat);
    await navigator.clipboard.writeText(text);
    setToastMessage(`${result.bookName} ${result.chapter}:${result.verse} 복사됨`);
  }

  if (results.length === 0) return null;

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  return (
    <>
      <div className="w-full max-w-2xl">
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {results.length}개 결과
        </p>
        <ul className="space-y-4">
          {visibleResults.map((result) => (
            <li
              key={`${result.bookName}-${result.chapter}-${result.verse}`}
              className="group rounded-lg border border-gray-200 px-4 py-3
                transition-colors duration-150
                dark:border-gray-700"
            >
              <div className="mb-1 flex items-center justify-between">
                <button
                  onClick={() => setContextTarget(result)}
                  className="text-sm font-medium text-gray-500 transition-colors
                    hover:text-blue-600 hover:underline
                    dark:text-gray-400 dark:hover:text-blue-400"
                >
                  {result.bookName} {result.chapter}:{result.verse}
                </button>
                <button
                  onClick={() => handleCopy(result)}
                  className="text-gray-400 opacity-0 transition-opacity duration-150
                    hover:text-gray-600 group-hover:opacity-100
                    dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <CopyIcon />
                </button>
              </div>
              <p
                onClick={() => handleCopy(result)}
                className={`cursor-pointer rounded transition-colors
                  hover:bg-gray-50 active:bg-gray-100
                  dark:hover:bg-gray-800 dark:active:bg-gray-700
                  ${fontSizeClass}`}
              >
                <HighlightedText text={result.text} keyword={keyword} />
              </p>
            </li>
          ))}
        </ul>
        {hasMore && <div ref={observerRef} className="h-10" />}
      </div>
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
      {contextTarget && bible && (() => {
        const book = bible.books.find((b) => b.name === contextTarget.bookName);
        const chapter = book?.chapters.find((c) => c.chapter === contextTarget.chapter);
        if (!book || !chapter) return null;
        return (
          <ContextViewer
            bookName={contextTarget.bookName}
            chapter={chapter}
            highlightVerse={contextTarget.verse}
            fontSizeClass={fontSizeClass}
            onClose={() => setContextTarget(null)}
          />
        );
      })()}
    </>
  );
}
