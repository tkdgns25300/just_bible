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
            <mark className="bg-yellow-200 text-inherit dark:bg-yellow-700">{keyword}</mark>
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

export default function SearchResults({
  results, keyword, translationName, copyFormat, fontSizeClass, bible,
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
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {results.length}개 결과
          </p>
          <ul className="space-y-4">
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
                  className={`group cursor-pointer rounded-lg border px-4 py-3
                    transition-colors duration-150
                    ${isSelected
                      ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950"
                      : "border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:active:bg-gray-700"
                    }`}
                  style={index < 10 ? {
                    animation: "fadeInUp 0.3s ease-out both",
                    animationDelay: `${index * 0.03}s`,
                  } : undefined}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {result.bookName} {result.chapter}:{result.verse}
                    </p>
                    {!isTouch && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(result);
                        }}
                        className="text-gray-400 opacity-0 transition-opacity duration-150
                          hover:text-gray-600 group-hover:opacity-100
                          dark:text-gray-500 dark:hover:text-gray-300"
                      >
                        <CopyIcon />
                      </button>
                    )}
                  </div>
                  <p className={fontSizeClass}>
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
