export const DEFAULT_TRANSLATION_CODE = "krv";
export const MAX_KEYWORD_RESULTS = 3000;
export const SEARCH_DEBOUNCE_MS = 300;
export const RESULTS_PER_PAGE = 30;
export const STORAGE_KEY_TRANSLATION = "just-bible-translation";

export const TRANSLATIONS = [
  { code: "krv", name: "개역개정" },
  { code: "kov", name: "개역한글" },
  { code: "nkrv", name: "표준새번역" },
] as const;
