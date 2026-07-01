import { useCallback } from "react";
import type { Stats } from "../types";
import { useStorage } from "./useStorage";

const INITIAL: Stats = {
  totalReviews: 0,
  correctReviews: 0,
  streakDays: 0,
  reviewsByDay: {},
};

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const ad = new Date(a + "T00:00:00Z").getTime();
  const bd = new Date(b + "T00:00:00Z").getTime();
  return Math.round((bd - ad) / (24 * 60 * 60 * 1000));
}

export function useStats() {
  const [stats, setStats, reset] = useStorage<Stats>("stats.v1", INITIAL);

  const record = useCallback(
    (correct: boolean) => {
      setStats((prev) => {
        const today = todayKey();
        const last = prev.lastReviewDate;
        let streak = prev.streakDays;
        if (!last) {
          streak = 1;
        } else {
          const diff = daysBetween(last, today);
          if (diff === 0) streak = Math.max(1, streak);
          else if (diff === 1) streak = streak + 1;
          else streak = 1;
        }
        return {
          totalReviews: prev.totalReviews + 1,
          correctReviews: prev.correctReviews + (correct ? 1 : 0),
          streakDays: streak,
          lastReviewDate: today,
          reviewsByDay: {
            ...prev.reviewsByDay,
            [today]: (prev.reviewsByDay[today] ?? 0) + 1,
          },
        };
      });
    },
    [setStats],
  );

  return { stats, record, reset };
}
