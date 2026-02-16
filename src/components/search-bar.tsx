"use client";

import { useState } from "react";

const PLACEHOLDER_EXAMPLES = [
  "창 1:1",
  "요 3:16",
  "시 23:1",
  "사랑",
  "ㅊㅅㄱ 1:1",
];

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ value, onChange, isLoading }: SearchBarProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  function handleFocus() {
    setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
  }

  return (
    <div className="w-full max-w-xl px-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        placeholder={isLoading ? "로딩 중..." : PLACEHOLDER_EXAMPLES[placeholderIndex]}
        className="w-full rounded-full border border-gray-300 bg-transparent px-6 py-3
          text-base shadow-sm outline-none
          transition-shadow duration-200
          placeholder:text-gray-400
          hover:shadow-md
          focus:shadow-md focus:ring-0
          dark:border-gray-600 dark:placeholder:text-gray-500
          sm:py-4 sm:text-lg"
        autoComplete="off"
        autoFocus
      />
    </div>
  );
}
