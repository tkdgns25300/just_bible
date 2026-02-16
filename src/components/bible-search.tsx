"use client";

import { useMemo, useState } from "react";
import { SEARCH_DEBOUNCE_MS } from "@/constants/search";
import { useBible } from "@/hooks/use-bible";
import { useDebounce } from "@/hooks/use-debounce";
import { parseQuery, searchBible } from "@/lib/search";
import SearchBar from "@/components/search-bar";
import SearchResults from "@/components/search-results";

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const { bible, isLoading } = useBible();

  const results = useMemo(() => {
    if (!bible || !debouncedQuery.trim()) return [];
    return searchBible(bible, debouncedQuery);
  }, [bible, debouncedQuery]);

  const keyword = useMemo(() => {
    const parsed = parseQuery(debouncedQuery);
    return parsed.mode === "keyword" ? parsed.keyword : undefined;
  }, [debouncedQuery]);

  const hasResults = results.length > 0;

  return (
    <main
      className={`flex min-h-dvh flex-col items-center px-4 transition-all duration-300 ${
        hasResults ? "pt-12 pb-16" : "justify-center pb-32"
      }`}
    >
      <h1
        className={`font-bold tracking-tight transition-all duration-300 ${
          hasResults ? "mb-4 text-2xl sm:text-3xl" : "mb-8 text-4xl sm:text-5xl"
        }`}
      >
        Just Bible
      </h1>
      <SearchBar value={query} onChange={setQuery} isLoading={isLoading} />
      {hasResults && (
        <div className="mt-6 flex w-full justify-center">
          <SearchResults
            results={results}
            keyword={keyword}
            translationName={bible?.translation ?? ""}
          />
        </div>
      )}
    </main>
  );
}
