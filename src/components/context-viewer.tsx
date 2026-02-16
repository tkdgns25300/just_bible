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
        <div
          className="flex items-center justify-between border-b border-gray-200
            px-6 py-4 dark:border-gray-700"
        >
          <h2 className="text-lg font-bold">
            {bookName} {chapter.chapter}장
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors
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
        <div className="overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            {chapter.verses.map((verse) => (
              <div
                key={verse.verse}
                ref={verse.verse === highlightVerse ? highlightRef : undefined}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  verse.verse === highlightVerse
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : ""
                }`}
              >
                <p className={fontSizeClass}>
                  <span className="mr-1 text-xs font-bold text-gray-400 dark:text-gray-500">
                    {verse.verse}
                  </span>
                  {verse.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
