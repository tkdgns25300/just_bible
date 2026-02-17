"use client";

import { FONT_WEIGHTS } from "@/constants/search";

interface FontWeightControlProps {
  weightIndex: number;
  onChange: (index: number) => void;
}

export default function FontWeightControl({ weightIndex, onChange }: FontWeightControlProps) {
  return (
    <div className="flex gap-2">
      {FONT_WEIGHTS.map(({ label }, index) => (
        <button
          key={label}
          onClick={() => onChange(index)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150
            sm:px-4 sm:py-2 sm:text-sm
            ${
              index === weightIndex
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
