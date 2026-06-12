"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { getAdjacent, type ModuleMeta } from "@/lib/modules";
import { slugify } from "@/lib/slugify";
import { useProgress } from "./ProgressProvider";
import { useModuleSlug } from "./ModuleContext";

/* ---------- typography ---------- */

function headingId(children: ReactNode): string | undefined {
  return typeof children === "string" ? slugify(children) : undefined;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      id={headingId(children)}
      className="mt-12 mb-4 scroll-mt-20 text-2xl font-semibold tracking-tight text-white border-b border-neutral-800 pb-2"
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      id={headingId(children)}
      className="mt-8 mb-3 scroll-mt-20 text-lg font-semibold text-white"
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="my-4 leading-7 text-neutral-300">{children}</p>;
}

export function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="my-4 ml-5 list-disc space-y-2 leading-7 text-neutral-300 marker:text-neutral-600">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="my-4 ml-5 list-decimal space-y-2 leading-7 text-neutral-300 marker:text-neutral-500">
      {children}
    </ol>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-300">
      {children}
    </code>
  );
}

export function Note({
  title = "Note",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <blockquote className="my-6 rounded-r-lg border-l-2 border-emerald-400 bg-neutral-900/70 px-5 py-4">
      <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-300">
        <Lightbulb className="h-4 w-4" /> {title}
      </p>
      <div className="text-sm leading-6 text-neutral-300">{children}</div>
    </blockquote>
  );
}

/* ---------- page chrome ---------- */

export function ModuleHeader({ meta }: { meta: ModuleMeta }) {
  return (
    <header className="mb-2">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400">
        {meta.est}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
        {meta.title}
      </h1>
      <p className="mt-3 text-lg leading-7 text-neutral-400">
        {meta.description}
      </p>
    </header>
  );
}

export function Tasks({ items }: { items: string[] }) {
  const slug = useModuleSlug();
  const { isTaskChecked, checkedTaskCount, toggleTask, hydrated } =
    useProgress();
  const done = slug && hydrated ? checkedTaskCount(slug) : 0;

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <p className="mb-3 flex items-center justify-between text-sm font-semibold text-white">
        <span className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-emerald-400" /> Implementation Tasks
        </span>
        <span
          suppressHydrationWarning
          className={`font-mono text-xs ${
            done === items.length ? "text-emerald-400" : "text-neutral-500"
          }`}
        >
          {done}/{items.length}
        </span>
      </p>
      <ul className="space-y-1">
        {items.map((t, i) => {
          const checked = slug !== null && hydrated && isTaskChecked(slug, i);
          return (
            <li key={i}>
              <label className="group flex cursor-pointer gap-3 rounded-md px-2 py-1.5 text-sm leading-6 hover:bg-neutral-800/50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => slug && toggleTask(slug, i)}
                  className="mt-1.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-emerald-400"
                />
                <span
                  className={
                    checked
                      ? "text-neutral-500 line-through decoration-neutral-600"
                      : "text-neutral-300"
                  }
                >
                  {t}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface Reading {
  label: string;
  href: string;
  note?: string;
}

export function FurtherReading({ items }: { items: Reading[] }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
        <BookOpen className="h-5 w-5 text-emerald-400" /> Further Reading
      </h2>
      <ul className="space-y-2.5">
        {items.map((r) => (
          <li key={r.href}>
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-sm"
            >
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-emerald-400" />
              <span>
                <span className="text-neutral-200 underline decoration-neutral-700 underline-offset-4 group-hover:text-white group-hover:decoration-emerald-400">
                  {r.label}
                </span>
                {r.note && (
                  <span className="text-neutral-500"> — {r.note}</span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ModuleFooter({ slug }: { slug: string }) {
  const { isComplete, toggleComplete, hydrated } = useProgress();
  const done = hydrated && isComplete(slug);
  const { prev, next } = getAdjacent(slug);

  return (
    <footer className="mt-14 border-t border-neutral-800 pt-8">
      <button
        onClick={() => toggleComplete(slug)}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
          done
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-500"
        }`}
      >
        {done ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Completed — click to undo
          </>
        ) : (
          <>
            <Circle className="h-4 w-4" /> Mark as Complete
          </>
        )}
      </button>

      <div className="mt-8 flex items-stretch justify-between gap-4">
        {prev ? (
          <Link
            href={`/modules/${prev.slug}`}
            className="group flex-1 rounded-lg border border-neutral-800 p-4 hover:border-neutral-600"
          >
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <ArrowLeft className="h-3 w-3" /> Previous
            </span>
            <span className="mt-1 block text-sm font-medium text-neutral-200 group-hover:text-white">
              {prev.label}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            href={`/modules/${next.slug}`}
            className="group flex-1 rounded-lg border border-neutral-800 p-4 text-right hover:border-neutral-600"
          >
            <span className="flex items-center justify-end gap-1 text-xs text-neutral-500">
              Next <ArrowRight className="h-3 w-3" />
            </span>
            <span className="mt-1 block text-sm font-medium text-neutral-200 group-hover:text-white">
              {next.label}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </footer>
  );
}
