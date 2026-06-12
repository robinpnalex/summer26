"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import { useProgress } from "@/hooks/useProgress";
import type { Question } from "@/types/curriculum";

type Props = {
  unitId: string;
  lessonId: string;
  questions: Question[];
};

const XP_PER_CORRECT = 10;

export default function LessonFlow({ unitId, lessonId, questions }: Props) {
  const router = useRouter();
  const { completeLesson } = useProgress();
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showAutoIntro, setShowAutoIntro] = useState(unitId === "auto");

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const progress = ((current) / questions.length) * 100;

  useEffect(() => {
    if (unitId !== "auto") return;

    const timeout = window.setTimeout(() => setShowAutoIntro(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [unitId]);

  const handleAnswer = (wasCorrect: boolean) => {
    setAnswered(true);
    setCorrect(wasCorrect);
    if (wasCorrect) setXpEarned((x) => x + XP_PER_CORRECT);
  };

  const handleContinue = () => {
    if (isLast) {
      const total = xpEarned + (correct ? 0 : 0);
      completeLesson(lessonId, total);
      router.push(`/learn/${unitId}/${lessonId}/complete?xp=${total}`);
      return;
    }
    setCurrent((c) => c + 1);
    setAnswered(false);
    setCorrect(false);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {showAutoIntro && (
        <div className="auto-intro fixed inset-0 z-50 flex items-center justify-center bg-amber-50/95 px-6">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/photos/auto2.webp"
              alt="Yellow auto rickshaw"
              width={720}
              height={668}
              priority
              className="auto-intro-image w-full min-w-0 max-w-[78vw] sm:max-w-sm object-contain drop-shadow-2xl"
            />
            <p className="auto-intro-caption rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm ring-1 ring-amber-200">
              Meter ready, anna.
            </p>
          </div>
        </div>
      )}

      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-amber-500 h-2 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full px-6 py-8">
        <p className="text-xs text-gray-400 mb-6 text-right">
          {current + 1} / {questions.length}
        </p>

        <div className="flex-1">
          <QuestionCard
            key={current}
            question={question}
            onAnswer={handleAnswer}
          />
        </div>

        {answered && (
          <button
            onClick={handleContinue}
            className="mt-6 w-full py-4 rounded-2xl font-bold text-lg text-white transition-colors"
            style={{ backgroundColor: correct ? "#22c55e" : "#f59e0b" }}
          >
            {isLast ? "Finish lesson" : "Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
