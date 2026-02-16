"use client";

import type { SearchResult } from "@/lib/search";

interface SearchResultsProps {
  results: SearchResult[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-xl px-4">
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        {results.length}개 결과
      </p>
      <ul className="space-y-3">
        {results.map((result) => (
          <li key={`${result.bookName}-${result.chapter}-${result.verse}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {result.bookName} {result.chapter}:{result.verse}
            </p>
            <p className="text-base leading-relaxed">{result.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
