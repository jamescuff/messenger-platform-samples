import { useMemo, useState } from "react";
import type { Phrase, ThemeId } from "../types";
import { THEMES } from "../data/themes";
import { useTTS } from "../hooks/useTTS";
import { SpeakButton } from "./SpeakButton";

interface Props {
  phrases: Phrase[];
  themeFilter: ThemeId | null;
}

export function Sentences({ phrases, themeFilter }: Props) {
  const pool = useMemo(
    () => (themeFilter ? phrases.filter((p) => p.theme === themeFilter) : phrases).filter((p) => p.example),
    [phrases, themeFilter],
  );

  const [index, setIndex] = useState(0);
  const [showEn, setShowEn] = useState(false);
  const { speak, supported } = useTTS();

  if (pool.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
        Dim brawddegau ar gael / No example sentences for this theme.
      </div>
    );
  }

  const card = pool[index];
  const themeMeta = THEMES.find((t) => t.id === card.theme);

  const next = () => {
    setShowEn(false);
    setIndex((i) => (i + 1) % pool.length);
  };
  const prev = () => {
    setShowEn(false);
    setIndex((i) => (i - 1 + pool.length) % pool.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {index + 1} / {pool.length}
        </span>
        <span>{themeMeta?.emoji} {themeMeta?.welsh}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-400">Ymadrodd / Phrase</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">{card.welsh}</div>
        <div className="text-sm text-slate-500">{card.english}</div>

        <div className="my-4 h-px bg-slate-100" />

        <div className="text-xs uppercase tracking-wide text-slate-400">Mewn cyd-destun / In context</div>
        <div className="mt-1 text-base text-slate-800">{card.example!.welsh}</div>
        {showEn && (
          <div className="mt-1 text-sm text-slate-500">{card.example!.english}</div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {supported && <SpeakButton onClick={() => speak(card.example!.welsh)} />}
          <button
            type="button"
            onClick={() => setShowEn((s) => !s)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {showEn ? "Cuddio cyfieithiad" : "Dangos cyfieithiad"}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={prev}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Blaenorol
        </button>
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nesaf →
        </button>
      </div>
    </div>
  );
}
