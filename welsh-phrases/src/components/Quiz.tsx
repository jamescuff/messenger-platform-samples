import { useMemo, useState } from "react";
import type { Phrase, ThemeId } from "../types";
import { useTTS } from "../hooks/useTTS";
import { SpeakButton } from "./SpeakButton";

interface Props {
  phrases: Phrase[];
  themeFilter: ThemeId | null;
  onRecordStat: (correct: boolean) => void;
}

interface Question {
  prompt: Phrase;
  choices: Phrase[];
  correctIndex: number;
  direction: "en-to-cy" | "cy-to-en";
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(pool: Phrase[], distractorPool: Phrase[], count: number): Question[] {
  const picks = shuffle(pool).slice(0, count);
  return picks.map((prompt): Question => {
    const direction: Question["direction"] = Math.random() < 0.5 ? "en-to-cy" : "cy-to-en";
    const distractors = shuffle(distractorPool.filter((p) => p.id !== prompt.id)).slice(0, 3);
    const choices = shuffle([prompt, ...distractors]);
    return {
      prompt,
      choices,
      correctIndex: choices.indexOf(prompt),
      direction,
    };
  });
}

export function Quiz({ phrases, themeFilter, onRecordStat }: Props) {
  const pool = useMemo(
    () => (themeFilter ? phrases.filter((p) => p.theme === themeFilter) : phrases),
    [phrases, themeFilter],
  );

  const questions = useMemo(
    () => buildQuestions(pool, phrases, Math.min(10, pool.length)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const { speak, supported } = useTTS();

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
        Dim digon o ymadroddion / Not enough phrases to build a quiz.
      </div>
    );
  }

  if (index >= questions.length) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <div className="text-4xl">🎉</div>
        <h3 className="mt-2 text-xl font-semibold">Da iawn!</h3>
        <p className="mt-1 text-slate-600">
          {score} / {questions.length} ({accuracy}%)
        </p>
      </div>
    );
  }

  const q = questions[index];
  const prompt = q.direction === "en-to-cy" ? q.prompt.english : q.prompt.welsh;
  const promptLang = q.direction === "en-to-cy" ? "English" : "Cymraeg";
  const choiceField = (p: Phrase) => (q.direction === "en-to-cy" ? p.welsh : p.english);

  const onPick = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === q.correctIndex;
    if (correct) setScore((s) => s + 1);
    onRecordStat(correct);
  };

  const onNext = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Cwestiwn {index + 1} / {questions.length}
        </span>
        <span>Sgôr: {score}</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Cyfieithwch ({promptLang} →{" "}
          {q.direction === "en-to-cy" ? "Cymraeg" : "English"})
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-xl font-semibold text-slate-900">{prompt}</div>
          {q.direction === "cy-to-en" && supported && (
            <SpeakButton onClick={() => speak(q.prompt.welsh, q.prompt.id)} />
          )}
        </div>
      </div>

      <div className="grid gap-2">
        {q.choices.map((choice, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === selected;
          let style = "border-slate-200 bg-white hover:border-slate-300";
          if (selected !== null) {
            if (isCorrect) style = "border-emerald-400 bg-emerald-50 text-emerald-900";
            else if (isSelected) style = "border-rose-400 bg-rose-50 text-rose-900";
            else style = "border-slate-200 bg-white opacity-60";
          }
          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => onPick(i)}
              disabled={selected !== null}
              className={`rounded-xl border p-3 text-left text-sm transition ${style}`}
            >
              {choiceField(choice)}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          {index + 1 === questions.length ? "Gweld y canlyniad" : "Nesaf →"}
        </button>
      )}
    </div>
  );
}
