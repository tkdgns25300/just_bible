"use client";

import { FONT_SIZES } from "@/constants/search";

interface FontSizeControlProps {
  sizeIndex: number;
  onChange: (index: number) => void;
}

export default function FontSizeControl({ sizeIndex, onChange }: FontSizeControlProps) {
  const isMin = sizeIndex === 0;
  const isMax = sizeIndex === FONT_SIZES.length - 1;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(sizeIndex - 1)}
        disabled={isMin}
        className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        A-
      </button>
      <span className="w-10 text-center text-xs text-gray-500 dark:text-gray-400">
        {FONT_SIZES[sizeIndex].label}
      </span>
      <button
        onClick={() => onChange(sizeIndex + 1)}
        disabled={isMax}
        className="rounded-md px-2 py-1 text-sm font-medium transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        A+
      </button>
    </div>
  );
}
