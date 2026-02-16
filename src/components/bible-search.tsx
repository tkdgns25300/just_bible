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
} from "@/constants/search";
import { useBible } from "@/hooks/use-bible";
import { useDebounce } from "@/hooks/use-debounce";
import { parseQuery, searchBible } from "@/lib/search";
import SearchBar from "@/components/search-bar";
import SearchResults from "@/components/search-results";
import TranslationTabs from "@/components/translation-tabs";
import CopyFormatSelector from "@/components/copy-format-selector";
import FontSizeControl from "@/components/font-size-control";

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const [translationCode, setTranslationCode] = useState(DEFAULT_TRANSLATION_CODE);
  const [copyFormat, setCopyFormat] = useState<CopyFormatId>(DEFAULT_COPY_FORMAT);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    const savedTranslation = localStorage.getItem(STORAGE_KEY_TRANSLATION);
    if (savedTranslation) setTranslationCode(savedTranslation);

    const savedFormat = localStorage.getItem(STORAGE_KEY_COPY_FORMAT);
    if (savedFormat) setCopyFormat(savedFormat as CopyFormatId);

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) setFontSizeIndex(Number(savedFontSize));
  }, []);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const { bible, isLoading } = useBible(translationCode);

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
      <div className="mt-4 flex flex-col items-center gap-2">
        <TranslationTabs activeCode={translationCode} onChange={handleTranslationChange} />
        <div className="flex items-center gap-3">
          <CopyFormatSelector activeFormat={copyFormat} onChange={handleCopyFormatChange} />
          <FontSizeControl sizeIndex={fontSizeIndex} onChange={handleFontSizeChange} />
        </div>
      </div>
      {hasResults && (
        <div className="mt-6 flex w-full justify-center">
          <SearchResults
            results={results}
            keyword={keyword}
            translationName={bible?.translation ?? ""}
            copyFormat={copyFormat}
            fontSizeClass={FONT_SIZES[fontSizeIndex].class}
          />
        </div>
      )}
    </main>
  );
}
