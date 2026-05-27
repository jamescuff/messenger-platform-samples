import { useCallback, useEffect, useRef, useState } from "react";

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

function gttsUrl(text: string): string {
  return `${GTTS_BASE}?ie=UTF-8&q=${encodeURIComponent(text)}&tl=cy&client=tw-ob`;
}

export type TTSSource = "native" | "cloud" | "none";

export function useTTS() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [nativeSupported, setNativeSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create a single audio element attached to the DOM. iOS Safari treats
  // playback on a long-lived element more permissively than on `new Audio()`.
  useEffect(() => {
    const el = document.createElement("audio");
    el.preload = "none";
    el.style.display = "none";
    document.body.appendChild(el);
    audioRef.current = el;
    return () => {
      el.pause();
      el.remove();
      audioRef.current = null;
    };
  }, []);

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

  // Plays chunks sequentially. The FIRST play() call happens synchronously
  // from the user gesture (no await before it). Subsequent chunks chain
  // through the `ended` event, which iOS treats as continuing playback.
  const playCloud = useCallback((text: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);

    const parts = chunkForTTS(text);
    let i = 0;

    const onEnded = () => {
      i += 1;
      if (i >= parts.length) {
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        return;
      }
      audio.src = gttsUrl(parts[i]);
      audio.play().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Audio play failed");
      });
    };

    const onError = () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      setError("Cloud audio failed to load (network or blocked).");
    };

    audio.removeEventListener("ended", onEnded);
    audio.removeEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    audio.src = gttsUrl(parts[0]);
    audio.play().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Audio play failed");
    });
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
      playCloud(text);
    },
    [voice, playCloud],
  );

  const supported = nativeSupported || typeof Audio !== "undefined";
  const source: TTSSource = voice ? "native" : supported ? "cloud" : "none";

  return { speak, supported, source, hasWelshVoice: voice !== null, error };
}
