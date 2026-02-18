"use client";

import { BOOKS } from "@/constants/bible";
import type { SearchScope } from "@/constants/search";

interface ScopeFilterProps {
  scope: SearchScope;
  onChange: (scope: SearchScope) => void;
}

const SCOPE_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "old" as const, label: "구약" },
  { value: "new" as const, label: "신약" },
];

export default function ScopeFilter({ scope, onChange }: ScopeFilterProps) {
  const isBookSelected = typeof scope === "number";

  return (
    <div className="flex items-center gap-2">
      {SCOPE_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150
            sm:px-5 sm:py-2.5 sm:text-base
            ${
              scope === value
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
        >
          {label}
        </button>
      ))}
      <select
        value={isBookSelected ? String(scope) : ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? Number(val) : "all");
        }}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150
          appearance-none pr-7
          ${
            isBookSelected
              ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isBookSelected ? "%23ffffff" : "%236b7280"}' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
        }}
      >
        <option value="" className="text-gray-900 dark:text-gray-100">특정 권</option>
        {BOOKS.map((book) => (
          <option key={book.id} value={String(book.id)} className="text-gray-900 dark:text-gray-100">
            {book.name}
          </option>
        ))}
      </select>
    </div>
  );
}
