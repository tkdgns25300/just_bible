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

export const STORAGE_KEY_COPY_FORMAT = "just-bible-copy-format";
export const DEFAULT_COPY_FORMAT = "default";

export const COPY_FORMATS = [
  { id: "default", name: "기본형", example: '"본문" (창세기 1:1, 개역개정)' },
  { id: "compact", name: "간결형", example: "본문 (창1:1)" },
  { id: "newline", name: "줄바꿈형", example: "본문\\n- 창세기 1:1 (개역개정)" },
  { id: "plain", name: "순수 본문", example: "본문" },
] as const;

export type CopyFormatId = (typeof COPY_FORMATS)[number]["id"];

export const STORAGE_KEY_FONT_SIZE = "just-bible-font-size";
export const DEFAULT_FONT_SIZE = 2;
export const FONT_SIZES = [
  { label: "최소", class: "text-sm leading-relaxed" },
  { label: "작게", class: "text-base leading-relaxed" },
  { label: "보통", class: "text-lg leading-relaxed" },
  { label: "크게", class: "text-xl leading-relaxed" },
  { label: "최대", class: "text-2xl leading-relaxed" },
] as const;
