"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme-toggle";

export default function PageHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-5 py-3 transition-[border-color,background-color] duration-200 sm:px-8 ${
      isScrolled
        ? "border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80"
        : "border-b border-transparent"
    }`}>
      <Link
        href="/"
        className="font-[family-name:var(--font-title)] text-2xl tracking-tight transition-opacity hover:opacity-70"
        style={{ WebkitTextStroke: "0.8px currentColor" }}
      >
        JB
      </Link>
      <div className="flex items-center gap-4">
        <nav className="hidden items-center gap-3 text-sm text-gray-400 sm:flex dark:text-gray-500">
          <Link href="/about" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">소개</Link>
          <span>·</span>
          <Link href="/terms" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">약관</Link>
          <span>·</span>
          <Link href="/privacy" className="transition-colors hover:text-gray-600 dark:hover:text-gray-300">개인정보</Link>
        </nav>
        <a href="https://forms.gle/gX6zrLTHfRt6Hyj97" target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white transition-colors
            hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300">
          의견 보내기
        </a>
        <ThemeToggle />
        <div className="relative sm:hidden">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="메뉴"
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700
              dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-xl border border-gray-200 bg-white py-2 shadow-lg
                dark:border-gray-700 dark:bg-gray-900"
                style={{ animation: "fadeIn 0.15s ease-out" }}>
                <Link href="/about" onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50
                    dark:text-gray-300 dark:hover:bg-gray-800">
                  소개
                </Link>
                <Link href="/terms" onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50
                    dark:text-gray-300 dark:hover:bg-gray-800">
                  이용약관
                </Link>
                <Link href="/privacy" onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50
                    dark:text-gray-300 dark:hover:bg-gray-800">
                  개인정보처리방침
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
