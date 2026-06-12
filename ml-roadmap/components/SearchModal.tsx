"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { search, type SearchItem } from "@/lib/searchIndex";

export const OPEN_SEARCH_EVENT = "ml-open-search";

/** Dispatch this from anywhere (e.g. the sidebar button) to open the modal. */
export function openSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = search(query);

  useEffect(() => {
    // reset state on every open so the modal starts fresh
    const show = () => {
      setQuery("");
      setSelected(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (o) return false;
          setQuery("");
          setSelected(0);
          return true;
        });
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, show);
    };
  }, []);

  const go = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label="Search the course"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-700 bg-[#111111] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-neutral-500" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && results[selected]) {
                go(results[selected]);
              }
            }}
            placeholder="Search lessons… (backprop, kernel trick, adam)"
            className="w-full bg-transparent py-3.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />
          <kbd className="rounded border border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-500">
            esc
          </kbd>
        </div>

        {query.trim() !== "" && (
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-neutral-500">
                No matches for “{query}”
              </li>
            )}
            {results.map((r, i) => (
              <li key={r.href}>
                <button
                  onClick={() => go(r)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left ${
                    i === selected ? "bg-neutral-800" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-neutral-200">
                      {r.title}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {r.context}
                    </span>
                  </span>
                  {i === selected && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
