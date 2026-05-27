import { useCallback, useMemo } from "react";
import type { CardState, Phrase, ReviewGrade } from "../types";
import { useStorage } from "./useStorage";

const DAY_MS = 24 * 60 * 60 * 1000;

function initialCard(phraseId: string): CardState {
  return {
    phraseId,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: Date.now(),
    lapses: 0,
  };
}

// SM-2 variant adapted for 4-button input (again / hard / good / easy)
function applyGrade(card: CardState, grade: ReviewGrade): CardState {
  const now = Date.now();
  let { ease, intervalDays, repetitions, lapses } = card;

  if (grade === "again") {
    repetitions = 0;
    intervalDays = 0;
    ease = Math.max(1.3, ease - 0.2);
    lapses += 1;
    return {
      ...card,
      ease,
      intervalDays,
      repetitions,
      lapses,
      lastReviewedAt: now,
      // due in ~10 minutes for relearning
      dueAt: now + 10 * 60 * 1000,
    };
  }

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    intervalDays = repetitions === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
    repetitions += 1;
  } else if (grade === "good") {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * ease);
    repetitions += 1;
  } else if (grade === "easy") {
    ease = ease + 0.15;
    if (repetitions === 0) intervalDays = 3;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease * 1.3);
    repetitions += 1;
  }

  return {
    ...card,
    ease,
    intervalDays,
    repetitions,
    lapses,
    lastReviewedAt: now,
    dueAt: now + intervalDays * DAY_MS,
  };
}

export function useSRS(phrases: Phrase[]) {
  const [cards, setCards] = useStorage<Record<string, CardState>>("srs.cards.v1", {});

  // Ensure every phrase has a card
  const ensured = useMemo(() => {
    const next = { ...cards };
    let mutated = false;
    for (const p of phrases) {
      if (!next[p.id]) {
        next[p.id] = initialCard(p.id);
        mutated = true;
      }
    }
    if (mutated) {
      // sync once, asynchronously
      queueMicrotask(() => setCards(next));
    }
    return next;
  }, [phrases, cards, setCards]);

  const review = useCallback(
    (phraseId: string, grade: ReviewGrade) => {
      setCards((prev) => {
        const existing = prev[phraseId] ?? initialCard(phraseId);
        return { ...prev, [phraseId]: applyGrade(existing, grade) };
      });
    },
    [setCards],
  );

  const dueCount = useMemo(() => {
    const now = Date.now();
    return Object.values(ensured).filter((c) => c.dueAt <= now).length;
  }, [ensured]);

  const dueQueue = useCallback(
    (themeFilter?: string | null) => {
      const now = Date.now();
      const phraseById = new Map(phrases.map((p) => [p.id, p]));
      return Object.values(ensured)
        .filter((c) => c.dueAt <= now)
        .filter((c) => {
          if (!themeFilter) return true;
          const p = phraseById.get(c.phraseId);
          return p?.theme === themeFilter;
        })
        .sort((a, b) => a.dueAt - b.dueAt)
        .map((c) => phraseById.get(c.phraseId))
        .filter((p): p is Phrase => Boolean(p));
    },
    [ensured, phrases],
  );

  const resetAll = useCallback(() => {
    setCards({});
  }, [setCards]);

  return { cards: ensured, review, dueCount, dueQueue, resetAll };
}
