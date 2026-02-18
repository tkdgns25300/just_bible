"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_COPY_FORMAT,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_TRANSLATION_CODE,
  FONT_SIZES,
  FONT_WEIGHTS,
  SEARCH_DEBOUNCE_MS,
  STORAGE_KEY_COPY_FORMAT,
  STORAGE_KEY_FONT_SIZE,
  STORAGE_KEY_FONT_WEIGHT,
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
import FontWeightControl from "@/components/font-weight-control";
import ScopeFilter from "@/components/scope-filter";
import ThemeToggle from "@/components/theme-toggle";

export default function BibleSearch() {
  const [query, setQuery] = useState("");
  const [translationCode, setTranslationCode] = useState(DEFAULT_TRANSLATION_CODE);
  const [copyFormat, setCopyFormat] = useState<CopyFormatId>(DEFAULT_COPY_FORMAT);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE);
  const [fontWeightIndex, setFontWeightIndex] = useState(DEFAULT_FONT_WEIGHT);
  const [scope, setScope] = useState<SearchScope>("all");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const savedTranslation = localStorage.getItem(STORAGE_KEY_TRANSLATION);
    if (savedTranslation) setTranslationCode(savedTranslation);

    const savedFormat = localStorage.getItem(STORAGE_KEY_COPY_FORMAT);
    if (savedFormat) setCopyFormat(savedFormat as CopyFormatId);

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) setFontSizeIndex(Number(savedFontSize));

    const savedFontWeight = localStorage.getItem(STORAGE_KEY_FONT_WEIGHT);
    if (savedFontWeight) setFontWeightIndex(Number(savedFontWeight));
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

  function handleFontWeightChange(index: number) {
    setFontWeightIndex(index);
    localStorage.setItem(STORAGE_KEY_FONT_WEIGHT, String(index));
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
        hasResults ? "pt-12 pb-16" : "pt-[18vh] pb-16"
      }`}
    >
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1
        className={`font-[family-name:var(--font-title)] tracking-tight transition-all duration-300 ${
          hasResults ? "mb-6 cursor-pointer text-6xl sm:text-7xl" : "mb-3 text-8xl sm:text-9xl"
        }`}
        style={{ WebkitTextStroke: "1.5px currentColor" }}
        onClick={hasResults ? () => setQuery("") : undefined}
      >
        Just Bible
      </h1>
      {!hasResults && (
        <p className="mb-10 text-base text-gray-400 sm:text-lg dark:text-gray-500">
          당신의 일상에 가장 가까운 성경 사전
        </p>
      )}
      <SearchBar value={query} onChange={setQuery} isLoading={isLoading} />
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="shrink-0 text-xs text-gray-400 sm:w-16 sm:text-right sm:text-sm dark:text-gray-500">역본</span>
          <TranslationTabs activeCode={translationCode} onChange={handleTranslationChange} />
        </div>
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className="shrink-0 text-xs text-gray-400 sm:w-16 sm:text-right sm:text-sm dark:text-gray-500">범위</span>
          <ScopeFilter scope={scope} onChange={setScope} />
        </div>
        <button
          onClick={() => setShowMore((prev) => !prev)}
          className="flex items-center gap-1 self-center text-xs text-gray-400 transition-colors
            hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          {showMore ? "설정 닫기" : "설정 더보기"}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}>
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </button>
        {showMore && (
          <div className="flex flex-col gap-4" style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-xs text-gray-400 sm:w-16 sm:text-right sm:text-sm dark:text-gray-500">복사형식</span>
              <CopyFormatSelector activeFormat={copyFormat} onChange={handleCopyFormatChange} />
            </div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-xs text-gray-400 sm:w-16 sm:text-right sm:text-sm dark:text-gray-500">글자크기</span>
              <FontSizeControl sizeIndex={fontSizeIndex} onChange={handleFontSizeChange} />
            </div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-xs text-gray-400 sm:w-16 sm:text-right sm:text-sm dark:text-gray-500">글자두께</span>
              <FontWeightControl weightIndex={fontWeightIndex} onChange={handleFontWeightChange} />
            </div>
          </div>
        )}
      </div>
      {!hasQuery && !error && (
        <div className="mt-10 w-full max-w-2xl" style={{ animation: "fadeIn 0.4s ease-out" }}>
          <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50/80 to-orange-50/30
            p-5 shadow-sm sm:p-7
            dark:border-amber-900/40 dark:from-amber-950/20 dark:to-orange-950/10">
            <p className="mb-1 text-center text-lg font-semibold text-amber-900 dark:text-amber-200">
              말씀을 검색하세요
            </p>
            <p className="mb-6 text-center text-xs text-amber-700/70 dark:text-amber-400/60">
              구절 주소 또는 키워드로 빠르게 찾고, 바로 복사할 수 있습니다
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: "📖", title: "주소로 찾기", desc: "정확한 장절로 바로 이동하세요", examples: ["창 1:1", "요 3:16"] },
                { icon: "📏", title: "범위로 읽기", desc: "연속된 구절을 한 번에 읽으세요", examples: ["시 23:1-6", "마 5:1-12"] },
                { icon: "⌨️", title: "초성 · 약어 검색", desc: "빠르고 간편하게 검색하세요", examples: ["ㅊㅅㄱ", "로마서 8"] },
                { icon: "🔍", title: "키워드 찾기", desc: "주제별 말씀을 발견하세요", examples: ["사랑", "위로", "소망"] },
              ].map(({ icon, title, desc, examples }) => (
                <div key={title}
                  className="rounded-xl border border-amber-100 bg-white/70 px-4 py-4
                    dark:border-amber-900/30 dark:bg-amber-950/20"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{title}</p>
                  </div>
                  <p className="mb-3 text-xs text-amber-700/60 dark:text-amber-400/50">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {examples.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuery(q)}
                        className="rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-0.5 text-sm text-amber-900
                          transition-all duration-150 hover:border-amber-300 hover:bg-amber-100 hover:shadow-sm
                          dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200
                          dark:hover:border-amber-700 dark:hover:bg-amber-900/40"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
            fontSizeClass={`${FONT_SIZES[fontSizeIndex].class} ${FONT_WEIGHTS[fontWeightIndex].class}`}
            bible={bible}
          />
        </div>
      )}
    </main>
  );
}
