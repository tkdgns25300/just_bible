"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const KOREAN_LANG = "ko-KR";

export interface UseSpeechSynthesisOptions {
  rate?: number;
  lang?: string;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const { rate = 1, lang = KOREAN_LANG } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const queueRef = useRef<string[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const optionsRef = useRef({ rate, lang });
  optionsRef.current = { rate, lang };

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    synthRef.current = window.speechSynthesis;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const playNext = useCallback(() => {
    const synth = synthRef.current;
    if (!synth || queueRef.current.length === 0) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }
    const text = queueRef.current.shift()!;
    if (!text.trim()) {
      playNext();
      return;
    }
    const { rate: curRate, lang: curLang } = optionsRef.current;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = curLang;
    utterance.rate = curRate;
    const koVoice = synth.getVoices().find((v) => v.lang.startsWith("ko"));
    if (koVoice) utterance.voice = koVoice;
    utterance.onend = () => playNext();
    utterance.onerror = () => playNext();
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const speakQueue = useCallback(
    (texts: string[]) => {
      const synth = synthRef.current;
      if (!synth) return;
      synth.cancel();
      queueRef.current = [...texts];
      playNext();
    },
    [playNext],
  );

  const pause = useCallback(() => {
    const synth = synthRef.current;
    if (synth && isPlaying) {
      synth.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    const synth = synthRef.current;
    if (synth && isPaused) {
      synth.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const cancel = useCallback(() => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      queueRef.current = [];
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  return {
    isPlaying,
    isPaused,
    speakQueue,
    pause,
    resume,
    cancel,
    isSupported: typeof window !== "undefined" && !!window.speechSynthesis,
  };
}
