"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_COPY_FORMAT,
  DEFAULT_FONT_SIZE,
  DEFAULT_TRANSLATION_CODE,
  FONT_SIZES,
  SEARCH_DEBOUNCE_MS,
  STORAGE_KEY_COPY_FORMAT,
  STORAGE_KEY_FONT_SIZE,
  STORAGE_KEY_TRANSLATION,
  type CopyFormatId,
  type SearchScope,
} from "@/constants/search";
import { useBible } from "@/hooks/use-bible";
import { useDebounce } from "@/hooks/use-debounce";
import { parseQuery, searchBible } from "@/lib/search";
import SearchBar from "@/components/search-bar";
import SearchResults from "@/components/search-results";
import TranslationTabs from "@/components/translation-tabs";
import CopyFormatSelector from "@/components/copy-format-selector";
import FontSizeControl from "@/components/font-size-control";
import ScopeFilter from "@/components/scope-filter";
import ThemeToggle from "@/components/theme-toggle";

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const [translationCode, setTranslationCode] = useState(DEFAULT_TRANSLATION_CODE);
  const [copyFormat, setCopyFormat] = useState<CopyFormatId>(DEFAULT_COPY_FORMAT);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE);
  const [scope, setScope] = useState<SearchScope>("all");

  useEffect(() => {
    const savedTranslation = localStorage.getItem(STORAGE_KEY_TRANSLATION);
    if (savedTranslation) setTranslationCode(savedTranslation);

    const savedFormat = localStorage.getItem(STORAGE_KEY_COPY_FORMAT);
    if (savedFormat) setCopyFormat(savedFormat as CopyFormatId);

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) setFontSizeIndex(Number(savedFontSize));
  }, []);

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const { bible, isLoading, error } = useBible(translationCode);

  function handleTranslationChange(code: string) {
    setTranslationCode(code);
    localStorage.setItem(STORAGE_KEY_TRANSLATION, code);
  }

  function handleCopyFormatChange(format: CopyFormatId) {
    setCopyFormat(format);
    localStorage.setItem(STORAGE_KEY_COPY_FORMAT, format);
  }

  function handleFontSizeChange(index: number) {
    setFontSizeIndex(index);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, String(index));
  }

  const results = useMemo(() => {
    if (!bible || !debouncedQuery.trim()) return [];
    return searchBible(bible, debouncedQuery, scope);
  }, [bible, debouncedQuery, scope]);

  const keyword = useMemo(() => {
    const parsed = parseQuery(debouncedQuery);
    return parsed.mode === "keyword" ? parsed.keyword : undefined;
  }, [debouncedQuery]);

  const hasResults = results.length > 0;
  const hasQuery = debouncedQuery.trim().length > 0;
  const isSearching = hasQuery && isLoading;
  const isEmpty = hasQuery && !isLoading && results.length === 0 && !error;

  return (
    <main
      className={`relative flex min-h-dvh flex-col items-center px-4 transition-all duration-300 sm:px-6 ${
        hasResults ? "pt-12 pb-16" : "justify-center pb-32"
      }`}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1
        className={`font-bold tracking-tight transition-all duration-300 ${
          hasResults ? "mb-4 text-2xl sm:text-3xl" : "mb-8 text-4xl sm:text-5xl"
        }`}
      >
        Just Bible
      </h1>
      <SearchBar value={query} onChange={setQuery} isLoading={isLoading} />
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <TranslationTabs activeCode={translationCode} onChange={handleTranslationChange} />
          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <ScopeFilter scope={scope} onChange={setScope} />
        </div>
        <div className="flex items-center gap-1.5">
          <CopyFormatSelector activeFormat={copyFormat} onChange={handleCopyFormatChange} />
          <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <FontSizeControl sizeIndex={fontSizeIndex} onChange={handleFontSizeChange} />
        </div>
      </div>
      {error && (
        <div className="mt-8 text-center text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
      {isSearching && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-4 w-48 rounded-md bg-gray-200 dark:bg-gray-700"
            style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
          <div className="h-16 w-full max-w-2xl rounded-lg bg-gray-100 dark:bg-gray-800"
            style={{ animation: "pulse 1.5s ease-in-out 0.1s infinite" }} />
          <div className="h-16 w-full max-w-2xl rounded-lg bg-gray-100 dark:bg-gray-800"
            style={{ animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
        </div>
      )}
      {isEmpty && (
        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500"
          style={{ animation: "fadeIn 0.3s ease-out" }}>
          검색 결과가 없습니다
        </div>
      )}
      {hasResults && (
        <div className="mt-6 flex w-full justify-center"
          style={{ animation: "fadeIn 0.3s ease-out" }}>
          <SearchResults
            results={results}
            keyword={keyword}
            translationName={bible?.translation ?? ""}
            copyFormat={copyFormat}
            fontSizeClass={FONT_SIZES[fontSizeIndex].class}
            bible={bible}
          />
        </div>
      )}
    </main>
  );
}
