"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RESULTS_PER_PAGE, type CopyFormatId } from "@/constants/search";
import { formatCopyText, formatMultipleCopyText } from "@/lib/copy-format";
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
  isTtsSupported: boolean;
  isTtsPlaying: boolean;
  isTtsPaused: boolean;
  onTtsPlayAll: () => void;
  onTtsPause: () => void;
  onTtsResume: () => void;
  onTtsCancel: () => void;
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className="h-4 w-4">
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
            <mark className="rounded-sm bg-blue-100 px-0.5 font-semibold text-blue-700
              dark:bg-blue-900/50 dark:text-blue-300">{keyword}</mark>
          )}
        </span>
      ))}
    </>
  );
}

const DRAG_THRESHOLD = 6;
const LONG_PRESS_MS = 500;

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return isTouch;
}

function rectsIntersect(
  a: { left: number; top: number; right: number; bottom: number },
  b: DOMRect,
): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
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

export default function SearchResults({
  results, keyword, translationName, copyFormat, fontSizeClass, bible,
  isTtsSupported, isTtsPlaying, isTtsPaused, onTtsPlayAll, onTtsPause, onTtsResume, onTtsCancel,
}: SearchResultsProps) {
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextTarget, setContextTarget] = useState<SearchResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const isTouch = useIsTouchDevice();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const observerRef = useRef<HTMLDivElement>(null);

  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const isDragging = useRef(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const touchMoved = useRef(false);

  useEffect(() => {
    setVisibleCount(RESULTS_PER_PAGE);
    setSelectedIndices(new Set());
  }, [results]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + RESULTS_PER_PAGE, results.length));
  }, [results.length]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  // Desktop: marquee drag selection
  useEffect(() => {
    if (isTouch) return;

    function handleMouseMove(e: MouseEvent) {
      if (!dragOrigin.current) return;
      const dx = e.clientX - dragOrigin.current.x;
      const dy = e.clientY - dragOrigin.current.y;

      if (!isDragging.current && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      isDragging.current = true;

      const container = containerRef.current;
      if (!container) return;
      const cr = container.getBoundingClientRect();
      const scrollTop = container.closest("main")?.scrollTop ?? window.scrollY;

      const startX = dragOrigin.current.x - cr.left;
      const startY = dragOrigin.current.y - cr.top + scrollTop;
      const curX = e.clientX - cr.left;
      const curY = e.clientY - cr.top + scrollTop;

      const x = Math.min(startX, curX);
      const y = Math.min(startY, curY);
      const w = Math.abs(curX - startX);
      const h = Math.abs(curY - startY);

      setMarquee({ x, y, w, h });

      const selRect = {
        left: cr.left + x,
        top: cr.top + y - scrollTop,
        right: cr.left + x + w,
        bottom: cr.top + y + h - scrollTop,
      };

      const next = new Set<number>();
      cardRefs.current.forEach((el, idx) => {
        if (rectsIntersect(selRect, el.getBoundingClientRect())) {
          next.add(idx);
        }
      });
      setSelectedIndices(next);
    }

    function handleMouseUp() {
      dragOrigin.current = null;
      setMarquee(null);
      isDragging.current = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isTouch]);

  // Desktop: Cmd/Ctrl+C copy
  useEffect(() => {
    if (isTouch) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && selectedIndices.size > 0) {
        e.preventDefault();
        handleCopySelected();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function handleContainerMouseDown(e: React.MouseEvent) {
    if (isTouch) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const clickedCard = (e.target as HTMLElement).closest("li");
    if (!clickedCard && selectedIndices.size > 0) {
      setSelectedIndices(new Set());
    }
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    isDragging.current = false;
  }

  function handleCardClick(index: number) {
    if (isDragging.current) return;
    if (longPressFired.current) return;
    if (touchMoved.current) return;
    setContextTarget(results[index]);
  }

  // Mobile: long press to copy
  function handleTouchStart(index: number) {
    longPressFired.current = false;
    touchMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      handleCopy(results[index]);
    }, LONG_PRESS_MS);
  }

  function handleTouchEnd() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleTouchMove() {
    touchMoved.current = true;
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  async function handleCopy(result: SearchResult) {
    try {
      const text = formatCopyText(result, translationName, copyFormat);
      await navigator.clipboard.writeText(text);
      setToastMessage(`${result.bookName} ${result.chapter}:${result.verse} 복사됨`);
    } catch {
      setToastMessage("복사에 실패했습니다");
    }
  }

  async function handleCopySelected() {
    const sorted = Array.from(selectedIndices).sort((a, b) => a - b);
    const selectedResults = sorted.map((i) => results[i]);
    if (selectedResults.length === 0) return;
    try {
      const text = formatMultipleCopyText(selectedResults, translationName, copyFormat);
      await navigator.clipboard.writeText(text);
      setToastMessage(`${selectedResults.length}개 구절 복사됨`);
      setSelectedIndices(new Set());
    } catch {
      setToastMessage("복사에 실패했습니다");
    }
  }

  if (results.length === 0) return null;

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;
  const hasSelected = selectedIndices.size > 0;

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full ${isTouch ? "" : "select-none"}`}
        onMouseDown={handleContainerMouseDown}
      >
        {marquee && (
          <div
            className="pointer-events-none absolute z-10 rounded border border-blue-400 bg-blue-200/20
              dark:border-blue-500 dark:bg-blue-500/10"
            style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h }}
          />
        )}
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {keyword ? (
                <><span className="font-medium text-gray-600 dark:text-gray-300">&ldquo;{keyword}&rdquo;</span> 검색 결과 {results.length}건 <span className="text-gray-300 dark:text-gray-600">·</span> {translationName}</>
              ) : (
                <>{results.length}개 결과 <span className="text-gray-300 dark:text-gray-600">·</span> {translationName}</>
              )}
            </p>
            {isTtsSupported && (
              <div className="flex items-center gap-2">
                {!isTtsPlaying ? (
                  <button
                    onClick={onTtsPlayAll}
                    className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700
                      transition-colors hover:bg-gray-200
                      dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <PlayIcon />
                    검색 결과 읽어주기
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isTtsPaused ? onTtsResume : onTtsPause}
                      className="rounded-full bg-gray-100 p-2.5 text-gray-700 transition-colors
                        hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label={isTtsPaused ? "재생" : "일시정지"}
                    >
                      {isTtsPaused ? <PlayIcon /> : <PauseIcon />}
                    </button>
                    <button
                      onClick={onTtsCancel}
                      className="rounded-full bg-gray-100 p-2.5 text-gray-700 transition-colors
                        hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      aria-label="중지"
                    >
                      <StopIcon />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <ul className="space-y-1">
            {visibleResults.map((result, index) => {
              const isSelected = selectedIndices.has(index);
              return (
                <li
                  key={`${result.bookName}-${result.chapter}-${result.verse}`}
                  ref={(el) => { if (el) cardRefs.current.set(index, el); else cardRefs.current.delete(index); }}
                  onClick={() => handleCardClick(index)}
                  onContextMenu={isTouch ? (e) => e.preventDefault() : undefined}
                  onTouchStart={isTouch ? () => handleTouchStart(index) : undefined}
                  onTouchEnd={isTouch ? handleTouchEnd : undefined}
                  onTouchMove={isTouch ? handleTouchMove : undefined}
                  className={`group cursor-pointer rounded-md border-l-2 py-3 pr-4 pl-4
                    transition-all duration-150
                    ${isSelected
                      ? "border-l-blue-500 bg-blue-50/80 dark:border-l-blue-400 dark:bg-blue-950/50"
                      : "border-l-gray-200 hover:border-l-gray-400 hover:bg-gray-50/50 dark:border-l-gray-700 dark:hover:border-l-gray-500 dark:hover:bg-gray-800/50"
                    }`}
                  style={index < 10 ? {
                    animation: "fadeInUp 0.3s ease-out both",
                    animationDelay: `${index * 0.03}s`,
                  } : undefined}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-medium tracking-wide text-gray-400 dark:text-gray-500">
                      {result.bookName} {result.chapter}:{result.verse}
                    </p>
                    {!isTouch && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(result);
                        }}
                        aria-label={`${result.bookName} ${result.chapter}:${result.verse} 복사`}
                        className="text-gray-300 opacity-0 transition-opacity duration-150
                          hover:text-gray-500 group-hover:opacity-100
                          dark:text-gray-600 dark:hover:text-gray-400"
                      >
                        <CopyIcon />
                      </button>
                    )}
                  </div>
                  <p className={`leading-[1.75] ${fontSizeClass}`}>
                    <HighlightedText text={result.text} keyword={keyword} />
                  </p>
                </li>
              );
            })}
          </ul>
          {hasMore && <div ref={observerRef} className="h-10" />}
        </div>
      </div>
      {hasSelected && !marquee && (
        <div
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2"
          style={{ animation: "fadeInUp 0.2s ease-out" }}
        >
          <button
            onClick={handleCopySelected}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white
              shadow-lg transition-colors hover:bg-blue-700 active:bg-blue-800
              dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {selectedIndices.size}개 구절 복사
          </button>
          <button
            onClick={() => setSelectedIndices(new Set())}
            aria-label="선택 해제"
            className="rounded-full bg-gray-200 p-2.5 text-gray-500
              shadow-lg transition-colors hover:bg-gray-300
              dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="h-4 w-4">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
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
