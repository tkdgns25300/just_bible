"use client";

import { useEffect, useMemo, useState } from "react";
import { BOOKS, OLD_TESTAMENT_COUNT } from "@/constants/bible";
import type { BibleTranslation } from "@/types/bible";

interface BibleBrowserProps {
  bible: BibleTranslation | null;
  fontSizeClass: string;
  compareBible?: BibleTranslation | null;
  primaryName?: string;
  compareName?: string;
  isTtsSupported: boolean;
  isTtsPlaying: boolean;
  isTtsPaused: boolean;
  onTtsPlayChapter: (texts: string[]) => void;
  onTtsPause: () => void;
  onTtsResume: () => void;
  onTtsCancel: () => void;
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
    </svg>
  );
}

export default function BibleBrowser({
  bible,
  fontSizeClass,
  compareBible,
  primaryName,
  compareName,
  isTtsSupported,
  isTtsPlaying,
  isTtsPaused,
  onTtsPlayChapter,
  onTtsPause,
  onTtsResume,
  onTtsCancel,
}: BibleBrowserProps) {
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [startVerse, setStartVerse] = useState(0);
  const [endVerse, setEndVerse] = useState(0);

  const selectedBookMeta = BOOKS.find((b) => b.id === selectedBookId)!;

  const book = bible?.books.find((b) => b.id === selectedBookId);
  const chapter = book?.chapters.find((c) => c.chapter === selectedChapter);
  const totalVerses = chapter?.verses.length ?? 0;

  const compareBook = compareBible?.books.find((b) => b.id === selectedBookId);
  const compareChapter = compareBook?.chapters.find((c) => c.chapter === selectedChapter);

  const isCompareMode = compareBible !== null && compareBible !== undefined;

  function handleBookChange(bookId: number) {
    setSelectedBookId(bookId);
    setSelectedChapter(1);
    setStartVerse(0);
    setEndVerse(0);
  }

  function handleChapterChange(chapter: number) {
    setSelectedChapter(chapter);
    setStartVerse(0);
    setEndVerse(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStartVerseChange(verse: number) {
    setStartVerse(verse);
    if (verse > 0 && endVerse > 0 && endVerse < verse) {
      setEndVerse(verse);
    }
  }

  function handleEndVerseChange(verse: number) {
    setEndVerse(verse);
    if (verse > 0 && startVerse === 0) {
      setStartVerse(verse);
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [selectedBookId]);

  const filteredVerses = useMemo(() => {
    if (!chapter) return [];
    if (startVerse === 0 && endVerse === 0) return chapter.verses;
    const from = startVerse || 1;
    const to = endVerse || totalVerses;
    return chapter.verses.filter((v) => v.verse >= from && v.verse <= to);
  }, [chapter, startVerse, endVerse, totalVerses]);

  const filteredCompareVerses = useMemo(() => {
    if (!compareChapter) return [];
    if (startVerse === 0 && endVerse === 0) return compareChapter.verses;
    const from = startVerse || 1;
    const to = endVerse || totalVerses;
    return compareChapter.verses.filter((v) => v.verse >= from && v.verse <= to);
  }, [compareChapter, startVerse, endVerse, totalVerses]);

  const hasPrev = selectedChapter > 1;
  const hasNext = selectedChapter < selectedBookMeta.chapters;

  const displayLabel = startVerse > 0 || endVerse > 0
    ? `${chapter?.chapter}:${startVerse || 1}-${endVerse || totalVerses}절`
    : `${chapter?.chapter}장`;

  return (
    <div className={`w-full ${isCompareMode ? "max-w-5xl" : "max-w-2xl"}`}>
      <div className="mx-auto grid w-full max-w-xs grid-cols-2 gap-2 sm:flex sm:w-auto sm:max-w-none sm:justify-center">
        <select
          value={selectedBookId}
          onChange={(e) => handleBookChange(Number(e.target.value))}
          className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-200
            dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
            sm:w-32 sm:px-5 sm:py-2.5 sm:text-base"
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
          onChange={(e) => handleChapterChange(Number(e.target.value))}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-200
            dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
            sm:px-5 sm:py-2.5 sm:text-base"
        >
          {Array.from({ length: selectedBookMeta.chapters }, (_, i) => i + 1).map((ch) => (
            <option key={ch} value={ch}>{ch}장</option>
          ))}
        </select>
        <select
          value={startVerse}
          onChange={(e) => handleStartVerseChange(Number(e.target.value))}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-200
            dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
            sm:px-5 sm:py-2.5 sm:text-base"
        >
          <option value={0}>시작절</option>
          {Array.from({ length: totalVerses }, (_, i) => i + 1).map((v) => (
            <option key={v} value={v}>{v}절</option>
          ))}
        </select>
        <select
          value={endVerse}
          onChange={(e) => handleEndVerseChange(Number(e.target.value))}
          className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-200
            dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700
            sm:px-5 sm:py-2.5 sm:text-base"
        >
          <option value={0}>끝절</option>
          {Array.from({ length: totalVerses - (startVerse > 0 ? startVerse - 1 : 0) }, (_, i) => i + (startVerse || 1)).map((v) => (
            <option key={v} value={v}>{v}절</option>
          ))}
        </select>
      </div>

      {chapter && (
        <div className="mt-8" style={{ animation: "fadeIn 0.3s ease-out" }}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="text-lg font-bold">{selectedBookMeta.name}</h2>
              <span className="text-sm text-gray-400 dark:text-gray-500">{displayLabel}</span>
            </div>
            {isTtsSupported && (
              <div className="flex items-center gap-2">
                {!isTtsPlaying ? (
                  <button
                    onClick={() => onTtsPlayChapter(filteredVerses.map((v) => v.text))}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700
                      transition-colors hover:bg-gray-200
                      dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <PlayIcon />
                    이 장 읽어주기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isTtsPaused ? onTtsResume : onTtsPause}
                      className="rounded-full bg-gray-100 p-2.5 text-gray-700 transition-colors
                        hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title={isTtsPaused ? "재생" : "일시정지"}
                    >
                      {isTtsPaused ? <PlayIcon /> : <PauseIcon />}
                    </button>
                    <button
                      onClick={onTtsCancel}
                      className="rounded-full bg-gray-100 p-2.5 text-gray-700 transition-colors
                        hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      title="중지"
                    >
                      <StopIcon />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {!isCompareMode && (
            <div className="space-y-0">
              {filteredVerses.map((verse) => (
                <div
                  key={verse.verse}
                  className="flex gap-3 border-l-2 border-l-transparent py-3 pl-4 pr-2"
                >
                  <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-gray-300 dark:text-gray-600">
                    {verse.verse}
                  </span>
                  <p className={`leading-[1.8] ${fontSizeClass}`}>
                    {verse.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {isCompareMode && (
            <>
              {/* Desktop: side-by-side columns */}
              <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
                <div>
                  <div className="mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {primaryName}
                  </div>
                  <div className="space-y-0">
                    {filteredVerses.map((verse) => (
                      <div
                        key={verse.verse}
                        className="flex gap-3 border-l-2 border-l-transparent py-3 pl-4 pr-2"
                      >
                        <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-gray-300 dark:text-gray-600">
                          {verse.verse}
                        </span>
                        <p className={`leading-[1.8] ${fontSizeClass}`}>
                          {verse.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {compareName}
                  </div>
                  <div className="space-y-0">
                    {filteredCompareVerses.map((verse) => (
                      <div
                        key={verse.verse}
                        className="flex gap-3 border-l-2 border-l-transparent py-3 pl-4 pr-2"
                      >
                        <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-gray-300 dark:text-gray-600">
                          {verse.verse}
                        </span>
                        <p className={`leading-[1.8] ${fontSizeClass}`}>
                          {verse.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: verse-interleaved */}
              <div className="space-y-0 sm:hidden">
                {filteredVerses.map((verse) => {
                  const compareVerse = filteredCompareVerses.find((v) => v.verse === verse.verse);
                  return (
                    <div key={verse.verse} className="border-b border-gray-100 py-3 dark:border-gray-800">
                      <div className="flex gap-3 pl-4 pr-2">
                        <span className="shrink-0 pt-0.5 text-xs font-bold tabular-nums text-gray-400 dark:text-gray-500">
                          {verse.verse}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div>
                            <span className="mr-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                              {primaryName}
                            </span>
                            <p className={`inline leading-[1.8] ${fontSizeClass}`}>
                              {verse.text}
                            </p>
                          </div>
                          {compareVerse && (
                            <div>
                              <span className="mr-1.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                                {compareName}
                              </span>
                              <p className={`inline leading-[1.8] ${fontSizeClass}`}>
                                {compareVerse.text}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              onClick={() => hasPrev && handleChapterChange(selectedChapter - 1)}
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
              onClick={() => hasNext && handleChapterChange(selectedChapter + 1)}
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
        </div>
      )}
    </div>
  );
}
