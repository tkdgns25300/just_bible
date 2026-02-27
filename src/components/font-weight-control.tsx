"use client";

import { FONT_WEIGHTS } from "@/constants/search";

const LABEL_WEIGHTS = ["font-light", "font-normal", "font-semibold", "font-bold"];

interface FontWeightControlProps {
  weightIndex: number;
  onChange: (index: number) => void;
}

export default function FontWeightControl({ weightIndex, onChange }: FontWeightControlProps) {
  const isMin = weightIndex === 0;
  const isMax = weightIndex === FONT_WEIGHTS.length - 1;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(weightIndex - 1)}
        disabled={isMin}
        aria-label="글자 두께 줄이기"
        className="w-9 rounded-md py-1.5 text-sm font-light transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        가
      </button>
      <span className={`w-12 text-center text-sm text-gray-500 dark:text-gray-400 ${LABEL_WEIGHTS[weightIndex]}`}>
        {FONT_WEIGHTS[weightIndex].label}
      </span>
      <button
        onClick={() => onChange(weightIndex + 1)}
        disabled={isMax}
        aria-label="글자 두께 늘리기"
        className="w-9 rounded-md py-1.5 text-sm font-bold transition-colors duration-150
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
