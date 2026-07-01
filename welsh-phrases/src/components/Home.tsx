import type { Mode, Phrase, ThemeId } from "../types";
import { THEMES } from "../data/themes";

interface Props {
  phrases: Phrase[];
  selectedTheme: ThemeId | null;
  onSelectTheme: (id: ThemeId | null) => void;
  onPickMode: (mode: Mode) => void;
  dueCount: number;
}

export function Home({ phrases, selectedTheme, onSelectTheme, onPickMode, dueCount }: Props) {
  const countsByTheme = phrases.reduce<Record<string, number>>((acc, p) => {
    acc[p.theme] = (acc[p.theme] ?? 0) + 1;
    return acc;
  }, {});

  const filteredCount = selectedTheme
    ? phrases.filter((p) => p.theme === selectedTheme).length
    : phrases.length;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pwnc / Theme
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onSelectTheme(null)}
            className={`rounded-xl border p-3 text-left transition ${
              selectedTheme === null
                ? "border-rose-500 bg-rose-50 text-rose-900"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="text-lg">🗂️</div>
            <div className="text-sm font-medium">Y cyfan</div>
            <div className="text-xs text-slate-500">All themes · {phrases.length}</div>
          </button>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectTheme(t.id)}
              className={`rounded-xl border p-3 text-left transition ${
                selectedTheme === t.id
                  ? "border-rose-500 bg-rose-50 text-rose-900"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="text-lg">{t.emoji}</div>
              <div className="text-sm font-medium leading-tight">{t.welsh}</div>
              <div className="text-xs text-slate-500">
                {t.english} · {countsByTheme[t.id] ?? 0}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Modd / Mode
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <ModeCard
            title="Cardiau Fflach"
            subtitle="Flashcards · SRS"
            description={`${dueCount} due now${selectedTheme ? " (across all themes)" : ""}`}
            onClick={() => onPickMode("flashcards")}
            accent="rose"
          />
          <ModeCard
            title="Brawddegau"
            subtitle="Contextual sentences"
            description={`${filteredCount} phrases in context`}
            onClick={() => onPickMode("sentences")}
            accent="indigo"
          />
          <ModeCard
            title="Cwis"
            subtitle="Multiple-choice quiz"
            description="EN → CY drills"
            onClick={() => onPickMode("quiz")}
            accent="emerald"
          />
          <ModeCard
            title="Ystadegau"
            subtitle="Stats & progress"
            description="Streaks, accuracy, history"
            onClick={() => onPickMode("stats")}
            accent="amber"
          />
        </div>
        <button
          type="button"
          onClick={() => onPickMode("add")}
          className="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600 hover:border-slate-400"
        >
          + Ychwanegu ymadrodd / Add phrase
        </button>
      </section>
    </div>
  );
}

interface ModeCardProps {
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  accent: "rose" | "indigo" | "emerald" | "amber";
}

function ModeCard({ title, subtitle, description, onClick, accent }: ModeCardProps) {
  const accentClasses: Record<ModeCardProps["accent"], string> = {
    rose: "hover:border-rose-300 hover:bg-rose-50",
    indigo: "hover:border-indigo-300 hover:bg-indigo-50",
    emerald: "hover:border-emerald-300 hover:bg-emerald-50",
    amber: "hover:border-amber-300 hover:bg-amber-50",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-4 text-left transition ${accentClasses[accent]}`}
    >
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
      <div className="mt-2 text-xs text-slate-600">{description}</div>
    </button>
  );
}
