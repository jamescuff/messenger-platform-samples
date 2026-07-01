import { useMemo, useState } from "react";
import type { Mode, Phrase, ThemeId } from "./types";
import { SEED_PHRASES } from "./data/phrases";
import { useStorage } from "./hooks/useStorage";
import { useSRS } from "./hooks/useSRS";
import { useStats } from "./hooks/useStats";
import { Home } from "./components/Home";
import { Flashcards } from "./components/Flashcards";
import { Sentences } from "./components/Sentences";
import { Quiz } from "./components/Quiz";
import { Stats } from "./components/Stats";
import { AddPhrase } from "./components/AddPhrase";

const MODE_TITLES: Record<Mode, { welsh: string; english: string }> = {
  home: { welsh: "Cartref", english: "Home" },
  flashcards: { welsh: "Cardiau Fflach", english: "Flashcards" },
  sentences: { welsh: "Brawddegau", english: "Sentences" },
  quiz: { welsh: "Cwis", english: "Quiz" },
  stats: { welsh: "Ystadegau", english: "Stats" },
  add: { welsh: "Ychwanegu", english: "Add phrase" },
};

function App() {
  const [userPhrases, setUserPhrases] = useStorage<Phrase[]>("phrases.user.v1", []);
  const [theme, setTheme] = useStorage<ThemeId | null>("theme.selected.v1", null);
  const [mode, setMode] = useState<Mode>("home");

  const allPhrases = useMemo(() => [...SEED_PHRASES, ...userPhrases], [userPhrases]);

  const { review, dueCount, dueQueue, cards, resetAll: resetCards } = useSRS(allPhrases);
  const { stats, record, reset: resetStats } = useStats();

  const resetAll = () => {
    resetCards();
    resetStats();
  };

  const addPhrase = (p: Phrase) => {
    setUserPhrases((prev) => [...prev, p]);
    setMode("home");
  };

  const title = MODE_TITLES[mode];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setMode("home")}
            className="flex items-center gap-2 text-left"
          >
            <span className="text-xl" aria-hidden>🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
            <div>
              <div className="text-sm font-semibold leading-tight">Ymadroddion S4C</div>
              <div className="text-[10px] text-slate-500 leading-tight">
                Welsh phrases for work
              </div>
            </div>
          </button>
          {mode !== "home" && (
            <button
              type="button"
              onClick={() => setMode("home")}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              ← Cartref
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-24">
        {mode !== "home" && (
          <h1 className="mb-4 text-xl font-semibold">
            {title.welsh}{" "}
            <span className="text-sm font-normal text-slate-500">/ {title.english}</span>
          </h1>
        )}

        {mode === "home" && (
          <Home
            phrases={allPhrases}
            selectedTheme={theme}
            onSelectTheme={setTheme}
            onPickMode={setMode}
            dueCount={dueCount}
          />
        )}
        {mode === "flashcards" && (
          <Flashcards
            phrases={allPhrases}
            themeFilter={theme}
            dueQueue={dueQueue}
            onReview={review}
            onRecordStat={record}
          />
        )}
        {mode === "sentences" && <Sentences phrases={allPhrases} themeFilter={theme} />}
        {mode === "quiz" && (
          <Quiz phrases={allPhrases} themeFilter={theme} onRecordStat={record} />
        )}
        {mode === "stats" && (
          <Stats
            stats={stats}
            cards={cards}
            totalPhrases={allPhrases.length}
            onReset={resetAll}
          />
        )}
        {mode === "add" && <AddPhrase onAdd={addPhrase} onCancel={() => setMode("home")} />}
      </main>
    </div>
  );
}

export default App;
