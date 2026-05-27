import { useCallback, useEffect, useState } from "react";

export function useTTS() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Welsh voices (cy / cy-GB), fall back to anything that says "Welsh"
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

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (voice) utter.voice = voice;
      utter.lang = voice?.lang ?? "cy-GB";
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
    },
    [supported, voice],
  );

  return { speak, supported, hasWelshVoice: voice !== null };
}
