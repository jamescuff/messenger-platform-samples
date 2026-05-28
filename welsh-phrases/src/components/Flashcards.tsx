import { useEffect, useMemo, useState } from "react";
import type { Phrase, ReviewGrade, ThemeId } from "../types";
import { THEMES } from "../data/themes";
import { useTTS } from "../hooks/useTTS";
import { SpeakButton } from "./SpeakButton";

interface Props {
  phrases: Phrase[];
  themeFilter: ThemeId | null;
  dueQueue: (themeFilter?: string | null) => Phrase[];
  onReview: (phraseId: string, grade: ReviewGrade) => void;
  onRecordStat: (correct: boolean) => void;
}

export function Flashcards({ phrases, themeFilter, dueQueue, onReview, onRecordStat }: Props) {
  // Snapshot the queue when we enter the session — don't rebuild on every review.
  const initialQueue = useMemo(() => {
    const due = dueQueue(themeFilter);
    if (due.length > 0) return due;
    // No due cards — fall back to a themed practice session.
    const pool = themeFilter ? phrases.filter((p) => p.theme === themeFilter) : phrases;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const { speak, supported, error: ttsError } = useTTS();

  const card = initialQueue[index];

  useEffect(() => {
    setRevealed(false);
  }, [index]);

  if (initialQueue.length === 0) {
    return (
      <EmptyState message="Dim cardiau ar gael / No cards available for this theme." />
    );
  }

  if (!card) {
    return (
      <EmptyState message="Da iawn! Sesiwn wedi'i orffen. / Well done! Session complete." />
    );
  }

  const themeMeta = THEMES.find((t) => t.id === card.theme);

  const handleGrade = (grade: ReviewGrade) => {
    onReview(card.id, grade);
    onRecordStat(grade !== "again");
    setIndex((i) => i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {index + 1} / {initialQueue.length}
        </span>
        <span>{themeMeta?.emoji} {themeMeta?.welsh}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-slate-400">Cymraeg</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{card.welsh}</div>
          {supported && (
            <div className="mt-3 flex justify-center">
              <SpeakButton onClick={() => speak(card.welsh, card.id)} />
            </div>
          )}
          {ttsError && (
            <p className="mt-2 text-[11px] text-rose-500">Audio: {ttsError}</p>
          )}
        </div>

        <div className="my-5 h-px bg-slate-100" />

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Datgelu / Reveal
          </button>
        ) : (
          <div className="space-y-3 text-center">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">English</div>
              <div className="mt-1 text-lg font-medium text-slate-700">{card.english}</div>
            </div>
            {card.example && (
              <div className="rounded-lg bg-slate-50 p-3 text-left text-sm">
                <div className="text-slate-800">{card.example.welsh}</div>
                <div className="mt-1 text-slate-500">{card.example.english}</div>
                {supported && (
                  <div className="mt-2">
                    <SpeakButton onClick={() => speak(card.example!.welsh, `${card.id}-ex`)}>
                      Listen to example
                    </SpeakButton>
                  </div>
                )}
              </div>
            )}
            {card.notes && (
              <p className="text-xs italic text-slate-500">{card.notes}</p>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-4 gap-2">
          <GradeButton color="rose" label="Again" sub="<10m" onClick={() => handleGrade("again")} />
          <GradeButton color="orange" label="Hard" sub="~1d" onClick={() => handleGrade("hard")} />
          <GradeButton color="emerald" label="Good" sub="↑" onClick={() => handleGrade("good")} />
          <GradeButton color="sky" label="Easy" sub="↑↑" onClick={() => handleGrade("easy")} />
        </div>
      )}
    </div>
  );
}

function GradeButton({
  color,
  label,
  sub,
  onClick,
}: {
  color: "rose" | "orange" | "emerald" | "sky";
  label: string;
  sub: string;
  onClick: () => void;
}) {
  const styles: Record<typeof color, string> = {
    rose: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
    orange: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-2 py-3 text-center text-sm font-medium transition ${styles[color]}`}
    >
      <div>{label}</div>
      <div className="text-[10px] opacity-70">{sub}</div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
      {message}
    </div>
  );
}
