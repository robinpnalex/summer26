"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrainCircuit, CheckCircle2, Circle, Menu, Search, X } from "lucide-react";
import { MODULES } from "@/lib/modules";
import { useProgress } from "./ProgressProvider";
import { openSearch } from "./SearchModal";

const REPO_URL = "https://github.com/robinpnalex/summer26/tree/main/ml-roadmap";

function GithubLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View source on GitHub"
      title="View source on GitHub"
      className={`text-neutral-600 hover:text-neutral-300 transition-colors ${className}`}
    >
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
      </svg>
    </a>
  );
}

function SearchButton() {
  return (
    <button
      onClick={openSearch}
      className="mx-2 mt-3 flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-600 hover:text-neutral-300 transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">Search…</span>
      <kbd className="rounded border border-neutral-700 px-1.5 py-0.5 text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}

function GlobalProgress() {
  const { completed, percent, hydrated } = useProgress();
  return (
    <div className="px-4 py-4 border-t border-neutral-800">
      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
        <span>Course progress</span>
        <span suppressHydrationWarning>
          {hydrated ? `${completed.size}/${MODULES.length}` : "–"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-500"
          style={{ width: hydrated ? `${percent}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isComplete, hydrated } = useProgress();

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
      <Link
        href="/"
        onClick={onNavigate}
        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
          pathname === "/"
            ? "bg-neutral-800 text-white"
            : "text-neutral-400 hover:text-white hover:bg-neutral-900"
        }`}
      >
        Overview
      </Link>
      <p className="px-3 pt-4 pb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        Modules
      </p>
      {MODULES.map((m) => {
        const href = `/modules/${m.slug}`;
        const active = pathname === href;
        const done = hydrated && isComplete(m.slug);
        return (
          <Link
            key={m.slug}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            {done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-neutral-600" />
            )}
            <span className="truncate">{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 border-b border-neutral-800 bg-[#0a0a0a]/90 backdrop-blur px-4 py-3">
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          className="text-neutral-400 hover:text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <BrainCircuit className="h-4 w-4 text-emerald-400" />
          ML from Scratch
        </Link>
        <GithubLink className="ml-auto" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 top-[49px] z-30 bg-[#0a0a0a] flex flex-col">
          <SearchButton />
          <NavLinks onNavigate={() => setOpen(false)} />
          <GlobalProgress />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-neutral-800 bg-[#0a0a0a]">
        <div className="px-5 py-5 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrainCircuit className="h-5 w-5 text-emerald-400" />
              ML from Scratch
            </Link>
            <GithubLink />
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            An interactive course, zero to Transformers
          </p>
        </div>
        <SearchButton />
        <NavLinks />
        <GlobalProgress />
      </aside>
    </>
  );
}
