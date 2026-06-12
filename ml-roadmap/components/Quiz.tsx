"use client";

import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import { useProgress } from "./ProgressProvider";
import { useModuleSlug } from "./ModuleContext";

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
}

function Question({
  q,
  index,
  slug,
}: {
  q: QuizQuestion;
  index: number;
  slug: string;
}) {
  const { quizAnswer, setQuizAnswer, hydrated } = useProgress();
  const selected = hydrated ? quizAnswer(slug, index) : undefined;
  const answered = selected !== undefined;
  const correct = selected === q.answer;

  return (
    <div className="border-b border-neutral-800 py-5 last:border-b-0 last:pb-0 first:pt-0">
      <p className="mb-3 text-sm font-medium text-white">
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let style =
            "border-neutral-700 text-neutral-300 hover:border-neutral-500";
          if (answered) {
            if (i === q.answer)
              style = "border-emerald-500/60 bg-emerald-500/10 text-emerald-200";
            else if (i === selected)
              style = "border-red-500/60 bg-red-500/10 text-red-300";
            else style = "border-neutral-800 text-neutral-500";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setQuizAnswer(slug, index, i)}
              className={`block w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <>
          <div
            className={`mt-3 flex gap-2 rounded-lg px-4 py-3 text-sm leading-6 ${
              correct
                ? "bg-emerald-500/10 text-emerald-200"
                : "bg-red-500/10 text-red-200"
            }`}
          >
            {correct ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>
              {correct ? "Correct! " : "Not quite. "}
              <span className="text-neutral-300">{q.explanation}</span>
            </span>
          </div>
          <button
            onClick={() => setQuizAnswer(slug, index, null)}
            className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" /> Try again
          </button>
        </>
      )}
    </div>
  );
}

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const slug = useModuleSlug();
  const { quizAnswer, hydrated } = useProgress();

  if (!slug) return null;

  const answeredCount = hydrated
    ? questions.filter((_, i) => quizAnswer(slug, i) !== undefined).length
    : 0;
  const correctCount = hydrated
    ? questions.filter((q, i) => quizAnswer(slug, i) === q.answer).length
    : 0;

  return (
    <section className="my-10 rounded-xl border border-neutral-800 bg-neutral-900/40 p-6">
      <h2
        id="knowledge-check"
        className="mb-4 flex items-center justify-between scroll-mt-20 text-lg font-semibold text-white"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-400" /> Knowledge Check
        </span>
        <span
          suppressHydrationWarning
          className={`font-mono text-xs font-normal ${
            answeredCount === questions.length &&
            correctCount === questions.length
              ? "text-emerald-400"
              : "text-neutral-500"
          }`}
        >
          {answeredCount === 0
            ? `${questions.length} questions`
            : `${correctCount}/${questions.length} correct`}
        </span>
      </h2>
      {questions.map((q, i) => (
        <Question key={i} q={q} index={i} slug={slug} />
      ))}
    </section>
  );
}
