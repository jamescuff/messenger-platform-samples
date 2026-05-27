import type { CardState, Stats as StatsType } from "../types";

interface Props {
  stats: StatsType;
  cards: Record<string, CardState>;
  totalPhrases: number;
  onReset: () => void;
}

export function Stats({ stats, cards, totalPhrases, onReset }: Props) {
  const accuracy =
    stats.totalReviews === 0 ? 0 : Math.round((stats.correctReviews / stats.totalReviews) * 100);

  const cardValues = Object.values(cards);
  const learned = cardValues.filter((c) => c.repetitions >= 2 && c.intervalDays >= 3).length;
  const mastered = cardValues.filter((c) => c.intervalDays >= 21).length;

  const last14 = lastNDays(14);
  const max = Math.max(1, ...last14.map((d) => stats.reviewsByDay[d] ?? 0));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Streak" value={`${stats.streakDays} 🔥`} sub="diwrnodau / days" />
        <Stat label="Cywirdeb" value={`${accuracy}%`} sub={`${stats.correctReviews}/${stats.totalReviews}`} />
        <Stat label="Wedi'u dysgu" value={`${learned}`} sub={`o ${totalPhrases} phrases`} />
        <Stat label="Wedi'u meistroli" value={`${mastered} ⭐`} sub="≥ 21 diwrnod / days" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          14 diwrnod diwethaf / Last 14 days
        </div>
        <div className="flex h-24 items-end gap-1">
          {last14.map((d) => {
            const count = stats.reviewsByDay[d] ?? 0;
            const height = count === 0 ? 4 : Math.round((count / max) * 100);
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${count === 0 ? "bg-slate-100" : "bg-rose-400"}`}
                  style={{ height: `${height}%` }}
                  title={`${d}: ${count}`}
                />
                <div className="text-[9px] text-slate-400">{d.slice(8)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm("Ailosod pob ystadegyn a chynnydd? / Reset all stats and progress?")) {
            onReset();
          }
        }}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 hover:bg-slate-50"
      >
        Ailosod cynnydd / Reset progress
      </button>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
