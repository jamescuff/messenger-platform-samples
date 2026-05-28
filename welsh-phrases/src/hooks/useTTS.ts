import { useCallback, useEffect, useRef, useState } from "react";

export type TTSSource = "native" | "static" | "none";

const AUDIO_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/audio`;

export function useTTS() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [nativeSupported, setNativeSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Plays a pre-generated MP3 from /audio/<id>.mp3
  const playStatic = useCallback((audioId: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);

    const onError = () => {
      audio.removeEventListener("error", onError);
      // Missing static asset — likely a user-added phrase. Stay silent.
    };
    audio.removeEventListener("error", onError);
    audio.addEventListener("error", onError);

    audio.src = `${AUDIO_BASE}/${audioId}.mp3`;
    audio.play().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Playback failed");
    });
  }, []);

  const speak = useCallback(
    (text: string, audioId?: string) => {
      if (!text) return;
      // Prefer native if a Welsh voice is installed.
      if (voice && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.voice = voice;
        utter.lang = voice.lang;
        utter.rate = 0.9;
        window.speechSynthesis.speak(utter);
        return;
      }
      // Otherwise, play the pre-generated MP3 if we have an id.
      if (audioId) playStatic(audioId);
    },
    [voice, playStatic],
  );

  const supported = nativeSupported || typeof Audio !== "undefined";
  const source: TTSSource = voice ? "native" : supported ? "static" : "none";

  return { speak, supported, source, hasWelshVoice: voice !== null, error };
}
