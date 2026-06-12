"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MODULES } from "@/lib/modules";

const STORAGE_KEY = "ml-course-state-v2";
const LEGACY_KEY = "ml-course-progress-v1";

interface CourseState {
  completed: string[]; // module slugs marked complete
  tasks: Record<string, number[]>; // slug -> checked task indices
  quiz: Record<string, Record<number, number>>; // slug -> question index -> chosen option
}

const EMPTY_STATE: CourseState = { completed: [], tasks: {}, quiz: {} };

/* A tiny external store backed by localStorage, so progress survives
   sessions and stays in sync across components (and browser tabs). */

let cache: CourseState | null = null;
const listeners = new Set<() => void>();

function read(): CourseState {
  if (cache === null) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        cache = { ...EMPTY_STATE, ...(JSON.parse(raw) as CourseState) };
      } else {
        // migrate the v1 completed-modules list if present
        const legacy = localStorage.getItem(LEGACY_KEY);
        cache = {
          ...EMPTY_STATE,
          completed: legacy ? (JSON.parse(legacy) as string[]) : [],
        };
      }
    } catch {
      cache = EMPTY_STATE;
    }
  }
  return cache;
}

function write(next: CourseState) {
  cache = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null; // another tab changed it; re-read
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY_STATE;

/* ---------- mutations ---------- */

function toggleComplete(slug: string) {
  const s = read();
  const completed = s.completed.includes(slug)
    ? s.completed.filter((c) => c !== slug)
    : [...s.completed, slug];
  write({ ...s, completed });
}

function toggleTask(slug: string, index: number) {
  const s = read();
  const cur = s.tasks[slug] ?? [];
  const next = cur.includes(index)
    ? cur.filter((i) => i !== index)
    : [...cur, index];
  write({ ...s, tasks: { ...s.tasks, [slug]: next } });
}

function setQuizAnswer(slug: string, question: number, option: number | null) {
  const s = read();
  const forSlug = { ...(s.quiz[slug] ?? {}) };
  if (option === null) delete forSlug[question];
  else forSlug[question] = option;
  write({ ...s, quiz: { ...s.quiz, [slug]: forSlug } });
}

/* ---------- context ---------- */

interface ProgressContextValue {
  hydrated: boolean;
  // module completion
  completed: Set<string>;
  isComplete: (slug: string) => boolean;
  toggleComplete: (slug: string) => void;
  percent: number;
  // implementation tasks
  isTaskChecked: (slug: string, index: number) => boolean;
  checkedTaskCount: (slug: string) => number;
  toggleTask: (slug: string, index: number) => void;
  // quiz answers
  quizAnswer: (slug: string, question: number) => number | undefined;
  setQuizAnswer: (slug: string, question: number, option: number | null) => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, read, getServerSnapshot);
  // During SSR/first paint the server snapshot is used; afterwards we are live.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const completed = new Set(state.completed);

  const value: ProgressContextValue = {
    hydrated,
    completed,
    isComplete: (slug) => completed.has(slug),
    toggleComplete,
    percent: Math.round((completed.size / MODULES.length) * 100),
    isTaskChecked: (slug, i) => (state.tasks[slug] ?? []).includes(i),
    checkedTaskCount: (slug) => (state.tasks[slug] ?? []).length,
    toggleTask,
    quizAnswer: (slug, q) => state.quiz[slug]?.[q],
    setQuizAnswer,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
