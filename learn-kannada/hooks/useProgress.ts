"use client";

import { useCallback, useEffect, useState } from "react";
import type { Unit } from "@/types/curriculum";

type Progress = {
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
};

const STORAGE_KEY = "kannada_progress";

function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as Progress;
  } catch {
    return defaultProgress();
  }
}

function defaultProgress(): Progress {
  return { xp: 0, streak: 0, lastActiveDate: "", completedLessons: [] };
}

function saveProgress(p: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useProgress(curriculum?: Unit[]) {
  const [progress, setProgress] = useState<Progress>(defaultProgress);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const completeLesson = useCallback((lessonId: string, xpEarned: number) => {
    setProgress((prev) => {
      const today = new Date().toISOString().slice(0, 10);
      const alreadyDone = prev.completedLessons.includes(lessonId);
      const streak = calcStreak(prev.lastActiveDate, prev.streak, today);
      const next: Progress = {
        xp: prev.xp + xpEarned,
        streak,
        lastActiveDate: today,
        completedLessons: alreadyDone
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons]
  );

  const isUnitUnlocked = useCallback(
    (unitId: string): boolean => {
      if (!curriculum) return true;
      const idx = curriculum.findIndex((u) => u.id === unitId);
      if (idx === 0) return true;
      const prev = curriculum[idx - 1];
      const threshold = Math.ceil(0.8 * prev.lessons.length);
      const done = prev.lessons.filter((l) =>
        progress.completedLessons.includes(l.id)
      ).length;
      return done >= threshold;
    },
    [curriculum, progress.completedLessons]
  );

  return { progress, completeLesson, isLessonCompleted, isUnitUnlocked };
}

function calcStreak(lastDate: string, current: number, today: string): number {
  if (!lastDate) return 1;
  const diff =
    (new Date(today).getTime() - new Date(lastDate).getTime()) /
    (1000 * 60 * 60 * 24);
  if (diff < 1) return current;
  if (diff <= 1) return current + 1;
  return 1;
}
