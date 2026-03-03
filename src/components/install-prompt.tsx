"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "just-bible-install-dismissed";
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 30_000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // standalone이면 이미 설치됨
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // 데스크톱이면 표시하지 않음
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    // 이전에 닫은 적 있으면 7일간 미표시
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const elapsed = Date.now() - Number(dismissed);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // iOS 판별
    const ua = navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !("MSStream" in window);
    setIsIos(isIosDevice);

    // Android: beforeinstallprompt 이벤트 캡처
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 30초 후 표시
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  function handleDismiss() {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  }

  async function handleInstall() {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      deferredPrompt.current = null;
    }
  }

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:hidden"
      style={{ animation: "fadeInUp 0.3s ease-out" }}
    >
      <div
        className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-lg
          dark:border-gray-700 dark:bg-gray-900"
      >
        <button
          onClick={handleDismiss}
          aria-label="닫기"
          className="absolute top-3 right-3 rounded-full p-1 text-gray-400 transition-colors
            hover:bg-gray-100 hover:text-gray-600
            dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <p className="pr-6 text-sm font-medium text-gray-900 dark:text-gray-100">
          홈 화면에 추가하여 앱처럼 사용하세요
        </p>

        {isIos ? (
          <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            하단의{" "}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="inline-block h-4 w-4 align-text-bottom text-blue-500">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {" "}공유 버튼을 누른 후 &lsquo;홈 화면에 추가&rsquo;를 선택하세요.
          </p>
        ) : deferredPrompt.current ? (
          <button
            onClick={handleInstall}
            className="mt-3 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white
              transition-colors hover:bg-gray-700
              dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            홈 화면에 추가
          </button>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            브라우저 메뉴에서 &lsquo;홈 화면에 추가&rsquo;를 선택하세요.
          </p>
        )}
      </div>
    </div>
  );
}
