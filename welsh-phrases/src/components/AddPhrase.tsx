import { useState } from "react";
import type { Phrase, ThemeId } from "../types";
import { THEMES } from "../data/themes";

interface Props {
  onAdd: (phrase: Phrase) => void;
  onCancel: () => void;
}

export function AddPhrase({ onAdd, onCancel }: Props) {
  const [welsh, setWelsh] = useState("");
  const [english, setEnglish] = useState("");
  const [exampleWelsh, setExampleWelsh] = useState("");
  const [exampleEnglish, setExampleEnglish] = useState("");
  const [theme, setTheme] = useState<ThemeId>("sgyrsiau");
  const [notes, setNotes] = useState("");

  const canSave = welsh.trim().length > 0 && english.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    const phrase: Phrase = {
      id: `usr-${Date.now()}`,
      welsh: welsh.trim(),
      english: english.trim(),
      theme,
      ...(exampleWelsh.trim() && exampleEnglish.trim()
        ? { example: { welsh: exampleWelsh.trim(), english: exampleEnglish.trim() } }
        : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };
    onAdd(phrase);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Cymraeg" required>
        <input
          type="text"
          value={welsh}
          onChange={(e) => setWelsh(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.e. dyddiad cau"
          required
        />
      </Field>
      <Field label="English" required>
        <input
          type="text"
          value={english}
          onChange={(e) => setEnglish(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="e.g. deadline"
          required
        />
      </Field>
      <Field label="Pwnc / Theme">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeId)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji} {t.welsh} ({t.english})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Enghraifft (Cymraeg) / Example">
        <input
          type="text"
          value={exampleWelsh}
          onChange={(e) => setExampleWelsh(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </Field>
      <Field label="Enghraifft (English) / Example">
        <input
          type="text"
          value={exampleEnglish}
          onChange={(e) => setExampleEnglish(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </Field>
      <Field label="Nodiadau / Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Canslo
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40"
        >
          Cadw / Save
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
