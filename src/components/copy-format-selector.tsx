"use client";

import { COPY_FORMATS, type CopyFormatId } from "@/constants/search";

interface CopyFormatSelectorProps {
  activeFormat: CopyFormatId;
  onChange: (format: CopyFormatId) => void;
}

export default function CopyFormatSelector({ activeFormat, onChange }: CopyFormatSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COPY_FORMATS.map(({ id, name, example }) => (
        <div key={id} className="group relative">
          <button
            onClick={() => onChange(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150
              ${
                id === activeFormat
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
          >
            {name}
          </button>
          <div
            className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2
              w-max whitespace-pre rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white text-center
              opacity-0 shadow-lg transition-opacity duration-150
              group-hover:opacity-100
              dark:bg-gray-200 dark:text-gray-900"
          >
            {example}
            <div
              className="absolute left-1/2 top-full -translate-x-1/2
                border-4 border-transparent border-t-gray-800
                dark:border-t-gray-200"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
