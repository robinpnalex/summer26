"use client";

import { useState } from "react";
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

  const question = questions[current];
  const isLast = current === questions.length - 1;
  const progress = ((current) / questions.length) * 100;

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
