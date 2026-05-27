import { useCallback, useEffect, useRef, useState } from "react";

// Google Translate's unofficial TTS endpoint. Public, no key, but undocumented
// and limited to ~200 chars per request. Splits longer text into chunks.
const GTTS_BASE = "https://translate.google.com/translate_tts";
const GTTS_MAX = 190;

function chunkForTTS(text: string): string[] {
  if (text.length <= GTTS_MAX) return [text];
  const parts: string[] = [];
  let current = "";
  for (const token of text.split(/(\s+|[,.;!?])/)) {
    if ((current + token).length > GTTS_MAX) {
      if (current) parts.push(current);
      current = token;
    } else {
      current += token;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export type TTSSource = "native" | "cloud" | "none";

export function useTTS() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [nativeSupported, setNativeSupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setNativeSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const welsh =
        voices.find((v) => v.lang?.toLowerCase().startsWith("cy")) ??
        voices.find((v) => /welsh/i.test(v.name)) ??
        null;
      setVoice(welsh);
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, []);

  const playCloud = useCallback(async (text: string) => {
    audioRef.current?.pause();
    for (const part of chunkForTTS(text)) {
      const url = `${GTTS_BASE}?ie=UTF-8&q=${encodeURIComponent(part)}&tl=cy&client=tw-ob`;
      const audio = new Audio(url);
      audioRef.current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text) return;
      if (voice && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = voice;
        utter.lang = voice.lang;
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
        return;
      }
      void playCloud(text);
    },
    [voice, playCloud],
  );

  const supported = nativeSupported || typeof Audio !== "undefined";
  const source: TTSSource = voice ? "native" : supported ? "cloud" : "none";

  return { speak, supported, source, hasWelshVoice: voice !== null };
}
