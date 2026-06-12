"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * On-this-page navigation. Scans the rendered article for h2/h3 anchors
 * after mount (so it always matches the actual content), and highlights
 * the section currently in view.
 */
export default function Toc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let els: HTMLElement[] = [];

    const onScroll = () => {
      let current = "";
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 110) current = el.id;
        else break;
      }
      setActive(current || (els[0]?.id ?? ""));
    };

    // scan after paint so the article content is in the DOM
    const raf = requestAnimationFrame(() => {
      els = Array.from(
        document.querySelectorAll<HTMLElement>(
          "article h2[id], article h3[id]"
        )
      );
      setHeadings(
        els.map((el) => ({
          id: el.id,
          text: el.textContent ?? "",
          level: el.tagName === "H2" ? 2 : 3,
        }))
      );
      onScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="hidden xl:block fixed right-6 top-14 w-56 max-h-[calc(100vh-7rem)] overflow-y-auto"
    >
      <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        On this page
      </p>
      <ul className="space-y-1 border-l border-neutral-800">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-1 text-[13px] leading-5 transition-colors ${
                h.level === 3 ? "pl-6" : "pl-3"
              } ${
                active === h.id
                  ? "-ml-px border-emerald-400 text-emerald-300"
                  : "-ml-px border-transparent text-neutral-500 hover:text-neutral-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
