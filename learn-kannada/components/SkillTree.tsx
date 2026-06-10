"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import type { Unit } from "@/types/curriculum";

export default function SkillTree({ curriculum }: { curriculum: Unit[] }) {
  const { progress, isLessonCompleted, isUnitUnlocked } = useProgress(curriculum);

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-amber-500 text-white">
        <h1 className="text-xl font-bold">Kannada — Live Local</h1>
        <div className="flex items-center gap-4 text-sm font-semibold">
          <span>⚡ {progress.xp} XP</span>
          <span>🔥 {progress.streak}</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {curriculum.map((unit, ui) => {
          const unlocked = isUnitUnlocked(unit.id);
          return (
            <div key={unit.id}>
              <div
                className={`rounded-2xl border-2 p-5 transition-all ${
                  unlocked
                    ? "bg-white border-amber-200 shadow-sm"
                    : "bg-gray-100 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{unit.icon}</span>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg leading-tight">
                      {unit.title}
                    </h2>
                    <p className="text-gray-500 text-sm">{unit.description}</p>
                  </div>
                  {!unlocked && (
                    <span className="ml-auto text-gray-400 text-2xl">🔒</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {unit.lessons.map((lesson, li) => {
                    const done = isLessonCompleted(lesson.id);
                    const isFirst = li === 0;
                    const prevDone =
                      li === 0 || isLessonCompleted(unit.lessons[li - 1].id);
                    const available = unlocked && (isFirst || prevDone);

                    if (!unlocked) {
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1.5 text-sm text-gray-400"
                        >
                          <span className="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" />
                          {lesson.title}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={lesson.id}
                        href={
                          available
                            ? `/learn/${unit.id}/${lesson.id}`
                            : "#"
                        }
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                          done
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : available
                            ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                            : "bg-gray-100 text-gray-400 border border-gray-200 pointer-events-none"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 inline-flex items-center justify-center text-xs ${
                            done
                              ? "bg-green-500 border-green-500 text-white"
                              : available
                              ? "border-amber-400"
                              : "border-gray-300"
                          }`}
                        >
                          {done ? "✓" : ""}
                        </span>
                        {lesson.title}
                      </Link>
                    );
                  })}
                </div>

                {unlocked && (
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      {unit.lessons.filter((l) => isLessonCompleted(l.id)).length} /{" "}
                      {unit.lessons.length} lessons done
                    </p>
                    <Link
                      href={`/roleplay/${unit.id}`}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-800 border border-amber-300 rounded-full px-3 py-1 hover:bg-amber-50 transition-colors"
                    >
                      🎭 Practice
                    </Link>
                  </div>
                )}
              </div>

              {ui < curriculum.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-6 bg-amber-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
