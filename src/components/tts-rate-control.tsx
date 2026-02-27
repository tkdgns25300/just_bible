"use client";

import {
  DEFAULT_TTS_RATE,
  TTS_RATE_MAX,
  TTS_RATE_MIN,
  TTS_RATE_STEP,
} from "@/constants/search";

interface TtsRateControlProps {
  rate: number;
  onChange: (rate: number) => void;
}

export default function TtsRateControl({ rate, onChange }: TtsRateControlProps) {
  const isMin = rate <= TTS_RATE_MIN;
  const isMax = rate >= TTS_RATE_MAX;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(TTS_RATE_MIN, rate - TTS_RATE_STEP))}
        disabled={isMin}
        aria-label="읽기 속도 줄이기"
        className="w-9 rounded-md py-1.5 text-sm transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        −
      </button>
      <span className="w-14 text-center text-sm text-gray-500 dark:text-gray-400">
        {rate === DEFAULT_TTS_RATE ? "보통" : `${Math.round(rate * 100)}%`}
      </span>
      <button
        onClick={() => onChange(Math.min(TTS_RATE_MAX, rate + TTS_RATE_STEP))}
        disabled={isMax}
        aria-label="읽기 속도 높이기"
        className="w-9 rounded-md py-1.5 text-sm transition-colors duration-150
          enabled:hover:bg-gray-200 enabled:active:bg-gray-300
          disabled:text-gray-300
          dark:enabled:hover:bg-gray-700 dark:enabled:active:bg-gray-600
          dark:disabled:text-gray-600"
      >
        +
      </button>
    </div>
  );
}
