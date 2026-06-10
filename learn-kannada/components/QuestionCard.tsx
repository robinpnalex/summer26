"use client";

import { useState } from "react";
import type { Question } from "@/types/curriculum";

type GradeResult = { correct: boolean; feedback: string };

type Props = {
  question: Question;
  onAnswer: (correct: boolean) => void;
};

export default function QuestionCard({ question, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);
  const [aiGrade, setAiGrade] = useState<GradeResult | null>(null);

  const handleSelect = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (question.type !== "fill-blank") {
      onAnswer(question.options[i].correct);
    }
  };

  const handleCheck = async () => {
    if (!input.trim() || revealed || grading) return;
    setGrading(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: (question as { prompt: string }).prompt,
          correctAnswer: (question as { answer: string }).answer,
          userAnswer: input.trim(),
        }),
      });
      const grade = await res.json() as GradeResult;
      setAiGrade(grade);
      setRevealed(true);
      onAnswer(grade.correct);
    } catch {
      // Fallback to exact match
      const correct = input.trim().toLowerCase() === (question as { answer: string }).answer.toLowerCase();
      setAiGrade({ correct, feedback: correct ? "Correct!" : `Answer: ${(question as { answer: string }).answer}` });
      setRevealed(true);
      onAnswer(correct);
    } finally {
      setGrading(false);
    }
  };

  const typeLabel: Record<string, string> = {
    translate: "Translate",
    meaning: "What does this mean?",
    context: "Choose the right phrase",
    "fill-blank": "Fill in the blank",
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
          {typeLabel[question.type]}
        </span>
        <p className="text-xl font-semibold text-gray-800 mt-2 leading-snug">
          {question.prompt}
        </p>
      </div>

      {question.type === "fill-blank" ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            disabled={revealed}
            placeholder="Type your answer..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-lg focus:outline-none focus:border-amber-400 disabled:bg-gray-50 transition-colors"
            autoFocus
          />
          {!revealed && (
            <button
              onClick={handleCheck}
              disabled={!input.trim() || grading}
              className="self-start px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {grading ? "Checking…" : "Check"}
            </button>
          )}
          {revealed && aiGrade && (
            <FeedbackBox
              correct={aiGrade.correct}
              explanation={aiGrade.feedback}
              hint={(question as { hint: string }).hint}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = opt.correct;
            let cls =
              "text-left rounded-xl border-2 px-5 py-4 transition-all text-base font-medium";
            if (!revealed) {
              cls += " border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50 cursor-pointer";
            } else if (isCorrect) {
              cls += " border-green-400 bg-green-50 text-green-800";
            } else if (isSelected) {
              cls += " border-red-300 bg-red-50 text-red-700";
            } else {
              cls += " border-gray-100 bg-gray-50 text-gray-400 opacity-50";
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} className={cls} disabled={revealed}>
                {opt.text}
              </button>
            );
          })}
          {revealed && (
            <FeedbackBox
              correct={selected !== null && question.options[selected].correct}
              explanation={question.explanation}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FeedbackBox({
  correct,
  explanation,
  hint,
}: {
  correct: boolean;
  explanation: string;
  hint?: string;
}) {
  return (
    <div
      className={`mt-1 p-4 rounded-xl border ${
        correct
          ? "bg-green-50 border-green-300 text-green-900"
          : "bg-red-50 border-red-200 text-red-900"
      }`}
    >
      <p className="font-semibold mb-1">{correct ? "Correct!" : "Not quite"}</p>
      <p className="text-sm">{explanation}</p>
      {hint && <p className="text-xs mt-1 opacity-60">{hint}</p>}
    </div>
  );
}
