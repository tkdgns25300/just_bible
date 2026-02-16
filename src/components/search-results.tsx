"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RESULTS_PER_PAGE } from "@/constants/search";
import type { SearchResult } from "@/lib/search";
import Toast from "@/components/toast";

interface SearchResultsProps {
  results: SearchResult[];
  keyword?: string;
  translationName: string;
}

function formatCopyText(result: SearchResult, translationName: string): string {
  return `"${result.text}" (${result.bookName} ${result.chapter}:${result.verse}, ${translationName})`;
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

export default function SearchResults({ results, keyword, translationName }: SearchResultsProps) {
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
    const text = formatCopyText(result, translationName);
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
              onClick={() => handleCopy(result)}
              className="cursor-pointer rounded-lg border border-gray-200 px-4 py-3
                transition-colors duration-150
                hover:bg-gray-50 active:bg-gray-100
                dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700"
            >
              <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                {result.bookName} {result.chapter}:{result.verse}
              </p>
              <p className="text-base leading-relaxed">
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
    </>
  );
}
