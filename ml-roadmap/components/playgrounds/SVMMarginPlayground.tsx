"use client";

import { useMemo, useState } from "react";

/**
 * 2D linear SVM intuition: two fixed point clouds, the user rotates and
 * shifts a decision boundary and widens the margin. Points inside the
 * margin or misclassified light up, and total hinge loss is reported.
 */

interface Pt {
  x: number;
  y: number;
  label: 1 | -1;
}

const POINTS: Pt[] = [
  { x: -2.6, y: 1.8, label: -1 },
  { x: -2.0, y: 0.6, label: -1 },
  { x: -1.4, y: 2.4, label: -1 },
  { x: -1.1, y: 1.0, label: -1 },
  { x: -2.4, y: -0.4, label: -1 },
  { x: -0.6, y: 1.9, label: -1 },
  { x: -0.4, y: 0.2, label: -1 },
  { x: 0.9, y: -1.4, label: 1 },
  { x: 1.6, y: -0.4, label: 1 },
  { x: 2.2, y: -1.9, label: 1 },
  { x: 1.1, y: -2.5, label: 1 },
  { x: 2.6, y: -0.9, label: 1 },
  { x: 0.4, y: -2.1, label: 1 },
  { x: 2.0, y: 0.3, label: 1 },
];

const SIZE = 420;
const SCALE = SIZE / 7; // world coords roughly [-3.5, 3.5]
const toPx = (v: number) => SIZE / 2 + v * SCALE;
const toPy = (v: number) => SIZE / 2 - v * SCALE;

export default function SVMMarginPlayground() {
  const [angle, setAngle] = useState(45); // degrees of the normal vector w
  const [offset, setOffset] = useState(0); // b
  const [margin, setMargin] = useState(0.8); // 1/||w||

  const { lines, decorated, totalHinge } = useMemo(() => {
    const rad = (angle * Math.PI) / 180;
    // unit normal vector w
    const wx = Math.cos(rad);
    const wy = Math.sin(rad);

    // signed distance of each point from the boundary w·x + b = 0
    const decorated = POINTS.map((p) => {
      const dist = wx * p.x + wy * p.y + offset;
      const functionalMargin = (p.label * dist) / margin; // y(w·x+b) with ||w|| = 1/margin
      const hinge = Math.max(0, 1 - functionalMargin);
      return { ...p, dist, hinge };
    });

    const totalHinge = decorated.reduce((s, p) => s + p.hinge, 0);

    // a line w·x + b = c is drawn by taking a point on it and the tangent dir
    const lineFor = (c: number) => {
      const px = wx * (c - offset);
      const py = wy * (c - offset);
      const tx = -wy;
      const ty = wx;
      const L = 6;
      return {
        x1: toPx(px - tx * L),
        y1: toPy(py - ty * L),
        x2: toPx(px + tx * L),
        y2: toPy(py + ty * L),
      };
    };

    return {
      lines: {
        boundary: lineFor(0),
        upper: lineFor(margin),
        lower: lineFor(-margin),
      },
      decorated,
      totalHinge,
    };
  }, [angle, offset, margin]);

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Find the Maximum Margin
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        Rotate and shift the boundary, then widen the margin as far as you can
        before points fall inside it (shown with a red ring). The hinge loss is
        zero only when every point is outside the margin on the correct side.
        Can you get hinge loss = 0 with margin ≥ 0.9?
      </p>

      <div className="flex flex-col gap-5 sm:flex-row">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full max-w-sm rounded-lg border border-neutral-800 bg-[#0d0d0d]"
        >
          {/* margin band */}
          <line {...lines.upper} stroke="#34d39955" strokeWidth="1.5" strokeDasharray="5 4" />
          <line {...lines.lower} stroke="#34d39955" strokeWidth="1.5" strokeDasharray="5 4" />
          <line {...lines.boundary} stroke="#e5e5e5" strokeWidth="2" />

          {decorated.map((p, i) => (
            <g key={i}>
              {p.hinge > 0 && (
                <circle
                  cx={toPx(p.x)}
                  cy={toPy(p.y)}
                  r="10"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              )}
              <circle
                cx={toPx(p.x)}
                cy={toPy(p.y)}
                r="6"
                fill={p.label === 1 ? "#34d399" : "#60a5fa"}
              />
            </g>
          ))}
        </svg>

        <div className="flex flex-1 flex-col justify-center gap-4 text-xs text-neutral-300">
          <label className="flex flex-col gap-1.5">
            Boundary angle: <span className="font-mono text-emerald-300">{angle}°</span>
            <input
              type="range"
              min="0"
              max="180"
              step="1"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="accent-emerald-400"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Offset b: <span className="font-mono text-emerald-300">{offset.toFixed(2)}</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={offset}
              onChange={(e) => setOffset(parseFloat(e.target.value))}
              className="accent-emerald-400"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            Margin width: <span className="font-mono text-emerald-300">{margin.toFixed(2)}</span>
            <input
              type="range"
              min="0.1"
              max="1.6"
              step="0.05"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="accent-emerald-400"
            />
          </label>
          <p
            className={`rounded-lg border px-3 py-2 font-mono ${
              totalHinge === 0
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            total hinge loss = {totalHinge.toFixed(3)}
            {totalHinge === 0 && " 🎉 perfectly separated"}
          </p>
        </div>
      </div>
    </div>
  );
}
