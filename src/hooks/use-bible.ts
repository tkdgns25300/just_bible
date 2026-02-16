"use client";

import { useEffect, useState } from "react";
import { DEFAULT_TRANSLATION_CODE } from "@/constants/search";
import type { BibleTranslation } from "@/types/bible";

const cache = new Map<string, BibleTranslation>();

async function loadTranslation(code: string): Promise<BibleTranslation> {
  const cached = cache.get(code);
  if (cached) return cached;

  let data: BibleTranslation;
  switch (code) {
    case "krv":
      data = (await import("@/data/krv.json")).default as BibleTranslation;
      break;
    case "kov":
      data = (await import("@/data/kov.json")).default as BibleTranslation;
      break;
    case "nkrv":
      data = (await import("@/data/nkrv.json")).default as BibleTranslation;
      break;
    default:
      throw new Error(`Unknown translation: ${code}`);
  }

  cache.set(code, data);
  return data;
}

export function useBible(code: string = DEFAULT_TRANSLATION_CODE) {
  const [bible, setBible] = useState<BibleTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    loadTranslation(code).then((data) => {
      if (!cancelled) {
        setBible(data);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  return { bible, isLoading };
}
