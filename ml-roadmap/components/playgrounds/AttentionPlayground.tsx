"use client";

import { useMemo, useState } from "react";

/**
 * Self-attention intuition: click a token in a sentence and see where it
 * "looks". Each token has a small hand-crafted embedding; attention
 * weights are softmax(q·k / sqrt(d)) with a temperature slider so users
 * can see how sharpening/softening works.
 */

const TOKENS = ["The", "cat", "sat", "because", "it", "was", "tired"];

// Tiny 4-d "embeddings" hand-tuned so that "it" attends to "cat",
// "tired" attends to "cat"/"it", function words attend broadly.
const EMB: number[][] = [
  [0.1, 0.0, 0.6, 0.1], // The
  [1.0, 0.2, 0.1, 0.8], // cat (entity)
  [0.2, 1.0, 0.1, 0.1], // sat (action)
  [0.1, 0.1, 0.9, 0.0], // because
  [0.9, 0.1, 0.2, 0.9], // it (refers to entity)
  [0.1, 0.2, 0.7, 0.2], // was
  [0.7, 0.3, 0.0, 1.0], // tired (describes the entity)
];

function softmax(xs: number[]): number[] {
  const m = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - m));
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}

export default function AttentionPlayground() {
  const [query, setQuery] = useState(4); // start on "it"
  const [sharpness, setSharpness] = useState(3);

  const weights = useMemo(() => {
    const q = EMB[query];
    const scores = EMB.map((k) => {
      const dot = q.reduce((s, qi, i) => s + qi * k[i], 0);
      return (dot / Math.sqrt(4)) * sharpness;
    });
    return softmax(scores);
  }, [query, sharpness]);

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Where Does Attention Look?
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        Click a token to make it the <span className="text-amber-300">query</span>.
        The bars show its attention weights over every token (computed as
        softmax of scaled dot products between small embedding vectors). Try
        clicking <em>“it”</em> — notice it attends strongly to <em>“cat”</em>,
        which is exactly how attention resolves pronouns.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {TOKENS.map((t, i) => (
          <button
            key={i}
            onClick={() => setQuery(i)}
            className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${
              i === query
                ? "border-amber-400 bg-amber-400/10 text-amber-300"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {TOKENS.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span
              className={`w-16 text-right font-mono ${
                i === query ? "text-amber-300" : "text-neutral-400"
              }`}
            >
              {t}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-neutral-800">
              <div
                className="h-full rounded bg-emerald-400/80 transition-all duration-300"
                style={{ width: `${weights[i] * 100}%` }}
              />
            </div>
            <span className="w-12 font-mono text-neutral-400">
              {(weights[i] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <label className="mt-5 flex items-center gap-3 text-xs text-neutral-300">
        Score sharpness
        <input
          type="range"
          min="0.5"
          max="8"
          step="0.5"
          value={sharpness}
          onChange={(e) => setSharpness(parseFloat(e.target.value))}
          className="w-48 accent-emerald-400"
        />
        <span className="font-mono text-emerald-300">{sharpness.toFixed(1)}×</span>
        <span className="text-neutral-500">
          (low = spread attention, high = focused)
        </span>
      </label>
    </div>
  );
}
