"use client";

import { COPY_FORMATS, type CopyFormatId } from "@/constants/search";

interface CopyFormatSelectorProps {
  activeFormat: CopyFormatId;
  onChange: (format: CopyFormatId) => void;
}

export default function CopyFormatSelector({ activeFormat, onChange }: CopyFormatSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COPY_FORMATS.map(({ id, name }) => (
        <button
          key={id}
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
      ))}
    </div>
  );
}
