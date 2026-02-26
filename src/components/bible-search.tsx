"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_COPY_FORMAT,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_TTS_RATE,
  DEFAULT_TRANSLATION_CODE,
  FONT_SIZES,
  FONT_WEIGHTS,
  SEARCH_DEBOUNCE_MS,
  STORAGE_KEY_COPY_FORMAT,
  STORAGE_KEY_FONT_SIZE,
  STORAGE_KEY_FONT_WEIGHT,
  STORAGE_KEY_TTS_RATE,
  STORAGE_KEY_TRANSLATION,
  TRANSLATIONS,
  type CopyFormatId,
  type SearchScope,
} from "@/constants/search";
import { useBible } from "@/hooks/use-bible";
import { useDebounce } from "@/hooks/use-debounce";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import { parseQuery, searchBible } from "@/lib/search";
import SearchBar from "@/components/search-bar";
import SearchResults from "@/components/search-results";
import TranslationTabs from "@/components/translation-tabs";
import CopyFormatSelector from "@/components/copy-format-selector";
import FontSizeControl from "@/components/font-size-control";
import FontWeightControl from "@/components/font-weight-control";
import ScopeFilter from "@/components/scope-filter";
import ThemeToggle from "@/components/theme-toggle";
import TtsRateControl from "@/components/tts-rate-control";
import BibleBrowser from "@/components/bible-browser";

type Mode = "search" | "read";

export default function BibleSearch() {
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [translationCode, setTranslationCode] = useState(DEFAULT_TRANSLATION_CODE);
  const [copyFormat, setCopyFormat] = useState<CopyFormatId>(DEFAULT_COPY_FORMAT);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE);
  const [fontWeightIndex, setFontWeightIndex] = useState(DEFAULT_FONT_WEIGHT);
  const [scope, setScope] = useState<SearchScope>("all");
  const [showMore, setShowMore] = useState(false);
  const [compareCode, setCompareCode] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState(DEFAULT_TTS_RATE);

  useEffect(() => {
    const savedTranslation = localStorage.getItem(STORAGE_KEY_TRANSLATION);
    if (savedTranslation) setTranslationCode(savedTranslation);

    const savedFormat = localStorage.getItem(STORAGE_KEY_COPY_FORMAT);
    if (savedFormat) setCopyFormat(savedFormat as CopyFormatId);

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) setFontSizeIndex(Number(savedFontSize));

    const savedFontWeight = localStorage.getItem(STORAGE_KEY_FONT_WEIGHT);
    if (savedFontWeight) setFontWeightIndex(Number(savedFontWeight));

    const savedTtsRate = localStorage.getItem(STORAGE_KEY_TTS_RATE);
    if (savedTtsRate) {
      const n = Number(savedTtsRate);
      if (!Number.isNaN(n)) setTtsRate(n);
    }
  }, []);

  const {
    isPlaying: isTtsPlaying,
    isPaused: isTtsPaused,
    speakQueue: ttsSpeakQueue,
    pause: ttsPause,
    resume: ttsResume,
    cancel: ttsCancel,
    isSupported: isTtsSupported,
  } = useSpeechSynthesis({ rate: ttsRate });

  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const { bible, isLoading, error } = useBible(translationCode);
  const { bible: compareBible } = useBible(compareCode ?? translationCode);

  function handleTranslationChange(code: string) {
    if (compareCode === code) setCompareCode(null);
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

  function handleTtsRateChange(rate: number) {
    setTtsRate(rate);
    localStorage.setItem(STORAGE_KEY_TTS_RATE, String(rate));
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
  const fontSizeClass = `${FONT_SIZES[fontSizeIndex].class} ${FONT_WEIGHTS[fontWeightIndex].class}`;
  const isReadMode = mode === "read";

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 py-3 sm:px-8">
        <button
          onClick={() => { setQuery(""); setMode("search"); }}
          className="cursor-pointer font-[family-name:var(--font-title)] text-2xl tracking-tight transition-opacity hover:opacity-70"
          style={{ WebkitTextStroke: "0.8px currentColor" }}
        >
          JB
        </button>
        <div className="flex items-center gap-4">
          <a href="https://forms.gle/gX6zrLTHfRt6Hyj97" target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors
              hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300">
            의견 보내기
          </a>
          <ThemeToggle />
        </div>
      </header>
      <main
        className={`relative flex min-h-dvh flex-col items-center px-4 transition-all duration-300 sm:px-6 ${
          hasResults && !isReadMode ? "pt-16 pb-16" : "pt-[14vh] pb-16"
        }`}
      >
      <h1
        className={`font-[family-name:var(--font-title)] tracking-tight transition-all duration-300 ${
          hasResults && !isReadMode ? "mb-6 cursor-pointer text-7xl sm:text-8xl" : "mb-0 text-[4.5rem] leading-none sm:text-[9rem]"
        }`}
        style={{ WebkitTextStroke: "1.5px currentColor" }}
        onClick={hasResults && !isReadMode ? () => setQuery("") : undefined}
      >
        Just Bible
      </h1>
      {(!hasResults || isReadMode) && (
        <p className="mb-4 text-sm text-gray-400 sm:text-xl dark:text-gray-500">
          당신의 일상에 가장 편안한 성경 사전
        </p>
      )}
      {(!hasResults || isReadMode) && (
        <div className="mb-8 flex w-full max-w-md rounded-2xl bg-gray-100 p-1.5 dark:bg-gray-800">
          {(["search", "read"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-xl py-3 text-base font-semibold transition-all duration-200
                sm:text-lg
                ${
                  mode === m
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                }`}
            >
              {m === "search" ? "검색" : "읽기"}
            </button>
          ))}
        </div>
      )}
      {(!hasResults || isReadMode) && (
        <div className="mb-8 h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-gray-200 to-transparent
          dark:via-gray-700" />
      )}
      {!isReadMode && (
        <>
          <SearchBar value={query} onChange={setQuery} isLoading={isLoading} />
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">역본</span>
              <TranslationTabs activeCode={translationCode} onChange={handleTranslationChange} />
            </div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">범위</span>
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
                  <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">복사형식</span>
                  <CopyFormatSelector activeFormat={copyFormat} onChange={handleCopyFormatChange} />
                </div>
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">글자크기</span>
                  <FontSizeControl sizeIndex={fontSizeIndex} onChange={handleFontSizeChange} />
                </div>
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">글자두께</span>
                  <FontWeightControl weightIndex={fontWeightIndex} onChange={handleFontWeightChange} />
                </div>
                {isTtsSupported && (
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">읽기 속도</span>
                    <TtsRateControl rate={ttsRate} onChange={handleTtsRateChange} />
                  </div>
                )}
              </div>
            )}
          </div>
          {!hasQuery && !error && (
            <div className="mt-10 w-full max-w-2xl" style={{ animation: "fadeIn 0.4s ease-out" }}>
              <div className="rounded-2xl border border-pink-200/70 bg-gradient-to-b from-pink-50 to-rose-50/60
                p-5 shadow-sm sm:p-7
                dark:border-slate-700/50 dark:from-slate-800/40 dark:to-blue-950/20">
                <p className="mb-1 text-center text-lg font-semibold text-pink-900 dark:text-slate-100">
                  말씀을 검색하세요
                </p>
                <p className="mb-6 text-center text-xs text-pink-700/70 dark:text-slate-400/70">
                  구절 주소 또는 키워드로 빠르게 찾고, 바로 복사할 수 있습니다
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>, title: "주소로 찾기", desc: "정확한 장절로 바로 이동하세요", examples: ["창 1:1", "요 3:16"] },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>, title: "범위로 읽기", desc: "연속된 구절을 한 번에 읽으세요", examples: ["시 23:1-6", "마 5:1-12"] },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><path d="M7 7h10" /><path d="M7 12h4" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>, title: "초성 · 약어 검색", desc: "빠르고 간편하게 검색하세요", examples: ["ㅊㅅㄱ", "로마서 8"] },
                    { icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>, title: "키워드 찾기", desc: "주제별 말씀을 발견하세요", examples: ["사랑", "위로", "소망"] },
                  ].map(({ icon, title, desc, examples }) => (
                    <div key={title}
                      className="rounded-xl border border-pink-200/80 bg-white/80 px-4 py-4
                        dark:border-slate-700/40 dark:bg-slate-800/30"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-pink-400 dark:text-blue-400">{icon}</span>
                        <p className="text-sm font-semibold text-pink-900 dark:text-slate-100">{title}</p>
                      </div>
                      <p className="mb-3 text-xs text-pink-600/60 dark:text-slate-400/60">{desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {examples.map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuery(q)}
                            className="rounded-full border border-pink-200 bg-pink-50/80 px-3 py-0.5 text-sm font-medium text-pink-900
                              transition-all duration-150 hover:border-pink-300 hover:bg-pink-100 hover:shadow-sm
                              dark:border-slate-600/50 dark:bg-slate-800/50 dark:text-slate-200
                              dark:hover:border-blue-500/60 dark:hover:bg-slate-700/50"
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
                fontSizeClass={fontSizeClass}
                bible={bible}
                isTtsSupported={isTtsSupported}
                isTtsPlaying={isTtsPlaying}
                isTtsPaused={isTtsPaused}
                onTtsPlayAll={() => ttsSpeakQueue(results.map((r) => r.text))}
                onTtsPause={ttsPause}
                onTtsResume={ttsResume}
                onTtsCancel={ttsCancel}
              />
            </div>
          )}
        </>
      )}
      {isReadMode && (
        <div className="flex w-full flex-col items-center" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">역본</span>
              <TranslationTabs activeCode={translationCode} onChange={handleTranslationChange} />
            </div>
            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">비교</span>
              <div className="flex items-center gap-2">
                {TRANSLATIONS.filter((t) => t.code !== translationCode).map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setCompareCode(compareCode === t.code ? null : t.code)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150
                      sm:px-5 sm:py-2.5 sm:text-base
                      ${
                        compareCode === t.code
                          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
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
                  <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">글자크기</span>
                  <FontSizeControl sizeIndex={fontSizeIndex} onChange={handleFontSizeChange} />
                </div>
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">글자두께</span>
                  <FontWeightControl weightIndex={fontWeightIndex} onChange={handleFontWeightChange} />
                </div>
                {isTtsSupported && (
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="shrink-0 text-sm text-gray-400 sm:w-20 sm:text-right sm:text-base dark:text-gray-500">읽기 속도</span>
                    <TtsRateControl rate={ttsRate} onChange={handleTtsRateChange} />
                  </div>
                )}
              </div>
            )}
          </div>
          <BibleBrowser
            bible={bible}
            fontSizeClass={fontSizeClass}
            compareBible={compareCode ? compareBible : null}
            primaryName={TRANSLATIONS.find((t) => t.code === translationCode)?.name}
            compareName={TRANSLATIONS.find((t) => t.code === compareCode)?.name}
            isTtsSupported={isTtsSupported}
            isTtsPlaying={isTtsPlaying}
            isTtsPaused={isTtsPaused}
            onTtsPlayChapter={(texts) => ttsSpeakQueue(texts)}
            onTtsPause={ttsPause}
            onTtsResume={ttsResume}
            onTtsCancel={ttsCancel}
          />
        </div>
      )}
    </main>
    <footer className="flex flex-col items-center gap-4 pb-8 pt-4">
      <div className="flex items-center gap-5">
        <a href="https://github.com/tkdgns25300" target="_blank" rel="noopener noreferrer"
          className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/%EC%83%81%ED%9B%88-%EC%9D%B4-677669210/" target="_blank" rel="noopener noreferrer"
          className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065ZM6.868 20.452H3.8V9h3.068v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
          </svg>
        </a>
        <a href="https://x.com/tkdgns25300" target="_blank" rel="noopener noreferrer"
          className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="X (Twitter)">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
          </svg>
        </a>
        <a href="mailto:tkdgns25300@naver.com"
          className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </a>
      </div>
      <p className="text-xs text-gray-300 dark:text-gray-600">© 2025 Just Bible</p>
    </footer>
    </>
  );
}
