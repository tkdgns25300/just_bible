"use client";

import { useEffect, useRef } from "react";
import type { Chapter } from "@/types/bible";

interface ContextViewerProps {
  bookName: string;
  chapter: Chapter;
  highlightVerse: number;
  fontSizeClass: string;
  onClose: () => void;
}

export default function ContextViewer({
  bookName,
  chapter,
  highlightVerse,
  fontSizeClass,
  onClose,
}: ContextViewerProps) {
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ block: "center" });
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: "fadeIn 0.2s ease-out" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative mx-2 flex max-h-[90vh] w-full max-w-2xl flex-col
          rounded-xl bg-white shadow-2xl dark:bg-gray-900 sm:mx-4"
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold">{bookName}</h2>
            <span className="text-sm text-gray-400 dark:text-gray-500">{chapter.chapter}장</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors
              hover:bg-gray-100 hover:text-gray-600
              dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">
          <div className="space-y-0">
            {chapter.verses.map((verse) => {
              const isHighlighted = verse.verse === highlightVerse;
              return (
                <div
                  key={verse.verse}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`flex gap-3 border-l-2 py-3 pl-4 pr-2 transition-colors ${
                    isHighlighted
                      ? "border-l-blue-500 bg-blue-50/60 dark:border-l-blue-400 dark:bg-blue-950/30"
                      : "border-l-transparent"
                  }`}
                >
                  <span className={`shrink-0 pt-0.5 text-xs tabular-nums ${
                    isHighlighted
                      ? "font-bold text-blue-500 dark:text-blue-400"
                      : "font-medium text-gray-300 dark:text-gray-600"
                  }`}>
                    {verse.verse}
                  </span>
                  <p className={`leading-[1.8] ${fontSizeClass}`}>
                    {verse.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
