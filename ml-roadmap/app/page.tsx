"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { useProgress } from "@/components/ProgressProvider";

export default function Home() {
  const { isComplete, completed, percent, hydrated } = useProgress();

  const nextModule =
    MODULES.find((m) => !isComplete(m.slug)) ?? MODULES[0];

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-400">
        An interactive course
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
        Machine Learning,
        <br />
        from scratch to Transformers.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-neutral-400">
        Not a list of links. Every module is a full written lesson — the
        intuition, the math (rendered properly), runnable code, interactive
        playgrounds, and a knowledge check — with the best external resources
        attached as further reading. Your progress is saved in your browser.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href={`/modules/${nextModule.slug}`}
          className="flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-5 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25 transition-colors"
        >
          {hydrated && completed.size > 0 ? "Continue learning" : "Start Module 0"}
          <ArrowRight className="h-4 w-4" />
        </Link>
        {hydrated && (
          <span className="text-sm text-neutral-500">
            {completed.size} of {MODULES.length} modules complete ({percent}%)
          </span>
        )}
      </div>

      <div className="mt-12 space-y-3">
        {MODULES.map((m, i) => {
          const done = hydrated && isComplete(m.slug);
          return (
            <Link
              key={m.slug}
              href={`/modules/${m.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 transition-colors hover:border-neutral-600"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold ${
                  done
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-neutral-700 text-neutral-400"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : i < MODULES.length - 1 ? (
                  i
                ) : (
                  "★"
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {m.title.replace(/^(Module \d+: |Advanced )/, "")}
                  </h2>
                  <span className="text-xs text-neutral-500">{m.est}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  {m.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-sm leading-6 text-neutral-500">
        Suggested rhythm: one module at a time, in order — each builds
        directly on the last. Do the implementation tasks; reading about
        backprop is not the same as writing it.
      </p>
    </div>
  );
}
