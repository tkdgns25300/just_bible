"use client";

import { TRANSLATIONS } from "@/constants/search";

interface TranslationTabsProps {
  activeCode: string;
  onChange: (code: string) => void;
}

export default function TranslationTabs({ activeCode, onChange }: TranslationTabsProps) {
  return (
    <div className="flex gap-2">
      {TRANSLATIONS.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150
            ${
              code === activeCode
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
