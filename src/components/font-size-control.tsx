"use client";

import { FONT_SIZES } from "@/constants/search";

const LABEL_SIZES = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl"];

interface FontSizeControlProps {
  sizeIndex: number;
  onChange: (index: number) => void;
}

export default function FontSizeControl({ sizeIndex, onChange }: FontSizeControlProps) {
  const isMin = sizeIndex === 0;
  const isMax = sizeIndex === FONT_SIZES.length - 1;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(sizeIndex - 1)}
        disabled={isMin}
        aria-label="글자 크기 줄이기"
        className="w-9 rounded-md py-1.5 text-sm transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        가
      </button>
      <span className={`w-12 text-center text-gray-500 dark:text-gray-400 ${LABEL_SIZES[sizeIndex]}`}>
        {FONT_SIZES[sizeIndex].label}
      </span>
      <button
        onClick={() => onChange(sizeIndex + 1)}
        disabled={isMax}
        aria-label="글자 크기 키우기"
        className="w-9 rounded-md py-1.5 text-lg transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        가
      </button>
    </div>
  );
}
