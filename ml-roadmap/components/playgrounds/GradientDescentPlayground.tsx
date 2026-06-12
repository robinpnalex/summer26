"use client";

import { useMemo, useState } from "react";
import { RotateCcw, StepForward } from "lucide-react";

/**
 * 1D gradient descent on f(w) = (w - 3)^2 + 1, rendered as SVG.
 * The user picks a learning rate and steps downhill, watching the
 * iterates hop along the parabola.
 */

const f = (w: number) => (w - 3) ** 2 + 1;
const grad = (w: number) => 2 * (w - 3);

const W_MIN = -4;
const W_MAX = 10;
const F_MAX = f(W_MIN);
const WIDTH = 600;
const HEIGHT = 300;
const PAD = 30;

const toX = (w: number) =>
  PAD + ((w - W_MIN) / (W_MAX - W_MIN)) * (WIDTH - 2 * PAD);
const toY = (y: number) => HEIGHT - PAD - (y / F_MAX) * (HEIGHT - 2 * PAD);

export default function GradientDescentPlayground() {
  const [lr, setLr] = useState(0.3);
  const [path, setPath] = useState<number[]>([-3.5]);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let w = W_MIN; w <= W_MAX; w += 0.1) {
      pts.push(`${toX(w)},${toY(f(w))}`);
    }
    return pts.join(" ");
  }, []);

  const w = path[path.length - 1];

  const step = () => {
    setPath((p) => {
      const cur = p[p.length - 1];
      const next = cur - lr * grad(cur);
      // keep the view sane if a huge learning rate explodes
      return [...p, Math.max(W_MIN, Math.min(W_MAX, next))];
    });
  };

  const reset = () => setPath([-3.5]);

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Gradient Descent on a Bowl
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        Loss is L(w) = (w − 3)² + 1, so the best weight is w = 3. Try a small
        learning rate (slow crawl), ~0.5 (fast), and ~1.05 (it diverges!).
      </p>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full">
        <polyline
          points={curve}
          fill="none"
          stroke="#525252"
          strokeWidth="2"
        />
        {/* descent path */}
        {path.map((wi, i) => {
          if (i === 0) return null;
          const prev = path[i - 1];
          return (
            <line
              key={i}
              x1={toX(prev)}
              y1={toY(f(prev))}
              x2={toX(wi)}
              y2={toY(f(wi))}
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          );
        })}
        {path.map((wi, i) => (
          <circle
            key={i}
            cx={toX(wi)}
            cy={toY(f(wi))}
            r={i === path.length - 1 ? 6 : 3.5}
            fill={i === path.length - 1 ? "#34d399" : "#10b98188"}
          />
        ))}
        {/* minimum marker */}
        <circle cx={toX(3)} cy={toY(1)} r="4" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
        <text x={toX(3)} y={toY(1) + 20} textAnchor="middle" fill="#fbbf24" fontSize="11">
          minimum
        </text>
      </svg>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-xs text-neutral-300">
          Learning rate η
          <input
            type="range"
            min="0.02"
            max="1.1"
            step="0.01"
            value={lr}
            onChange={(e) => {
              setLr(parseFloat(e.target.value));
            }}
            className="w-40 accent-emerald-400"
          />
          <span className="w-10 font-mono text-emerald-300">{lr.toFixed(2)}</span>
        </label>
        <button
          onClick={step}
          className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
        >
          <StepForward className="h-3.5 w-3.5" /> Take a step
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <span className="font-mono text-xs text-neutral-400">
          step {path.length - 1} · w = {w.toFixed(3)} · loss = {f(w).toFixed(3)}
        </span>
      </div>
    </div>
  );
}
