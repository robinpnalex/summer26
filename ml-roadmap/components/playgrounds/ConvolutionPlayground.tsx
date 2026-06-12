"use client";

import { useMemo, useState } from "react";

/**
 * Slide a 3×3 kernel over a tiny 8×8 grayscale "image" and watch the
 * feature map get computed cell by cell. Hovering an output cell
 * highlights the input patch it came from.
 */

// 8×8 image: a bright diagonal stripe on a dark background
const IMAGE: number[][] = [
  [0, 0, 0, 0, 0, 0, 2, 9],
  [0, 0, 0, 0, 0, 2, 9, 2],
  [0, 0, 0, 0, 2, 9, 2, 0],
  [0, 0, 0, 2, 9, 2, 0, 0],
  [0, 0, 2, 9, 2, 0, 0, 0],
  [0, 2, 9, 2, 0, 0, 0, 0],
  [2, 9, 2, 0, 0, 0, 0, 0],
  [9, 2, 0, 0, 0, 0, 0, 0],
];

type KernelName = "Vertical edges" | "Horizontal edges" | "Blur" | "Sharpen";

const KERNELS: Record<KernelName, { k: number[][]; desc: string }> = {
  "Vertical edges": {
    k: [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1],
    ],
    desc: "Sobel-style: responds where brightness changes left-to-right.",
  },
  "Horizontal edges": {
    k: [
      [1, 1, 1],
      [0, 0, 0],
      [-1, -1, -1],
    ],
    desc: "Responds where brightness changes top-to-bottom.",
  },
  Blur: {
    k: [
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ],
    desc: "Averages each 3×3 patch — smooths the image out.",
  },
  Sharpen: {
    k: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
    desc: "Boosts each pixel relative to its neighbors.",
  },
};

function convolve(img: number[][], k: number[][]): number[][] {
  const out: number[][] = [];
  for (let i = 0; i <= img.length - 3; i++) {
    const row: number[] = [];
    for (let j = 0; j <= img[0].length - 3; j++) {
      let s = 0;
      for (let di = 0; di < 3; di++)
        for (let dj = 0; dj < 3; dj++) s += img[i + di][j + dj] * k[di][dj];
      row.push(s);
    }
    out.push(row);
  }
  return out;
}

function shade(v: number, max: number) {
  const t = Math.min(Math.abs(v) / max, 1);
  return v >= 0
    ? `rgba(52, 211, 153, ${0.08 + 0.85 * t})`
    : `rgba(96, 165, 250, ${0.08 + 0.85 * t})`;
}

export default function ConvolutionPlayground() {
  const [kernel, setKernel] = useState<KernelName>("Vertical edges");
  const [hover, setHover] = useState<[number, number] | null>(null);

  const output = useMemo(() => convolve(IMAGE, KERNELS[kernel].k), [kernel]);
  const maxOut = useMemo(
    () => Math.max(...output.flat().map(Math.abs), 1),
    [output]
  );

  const inPatch = (i: number, j: number) =>
    hover !== null &&
    i >= hover[0] &&
    i < hover[0] + 3 &&
    j >= hover[1] &&
    j < hover[1] + 3;

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Convolution by Hand
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        The input is an 8×8 image with a bright diagonal stripe. Pick a 3×3
        kernel, then hover over the 6×6 feature map to see exactly which input
        patch produced each output value. {KERNELS[kernel].desc}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(KERNELS) as KernelName[]).map((name) => (
          <button
            key={name}
            onClick={() => setKernel(name)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              kernel === name
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {/* input */}
        <div>
          <p className="mb-1.5 text-[11px] text-neutral-500">Input 8×8</p>
          <div className="grid grid-cols-8 gap-px rounded border border-neutral-800 bg-neutral-800 p-px">
            {IMAGE.map((row, i) =>
              row.map((v, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`flex h-7 w-7 items-center justify-center font-mono text-[10px] ${
                    inPatch(i, j) ? "ring-1 ring-amber-400 z-10" : ""
                  }`}
                  style={{
                    background: `rgba(229, 229, 229, ${0.05 + (v / 9) * 0.9})`,
                    color: v > 4 ? "#111" : "#777",
                  }}
                >
                  {v}
                </div>
              ))
            )}
          </div>
        </div>

        {/* kernel */}
        <div>
          <p className="mb-1.5 text-[11px] text-neutral-500">Kernel 3×3</p>
          <div className="grid grid-cols-3 gap-px rounded border border-amber-500/40 bg-neutral-800 p-px">
            {KERNELS[kernel].k.map((row, i) =>
              row.map((v, j) => (
                <div
                  key={`${i}-${j}`}
                  className="flex h-9 w-9 items-center justify-center bg-[#161310] font-mono text-[10px] text-amber-300"
                >
                  {Number.isInteger(v) ? v : v.toFixed(2)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* output */}
        <div>
          <p className="mb-1.5 text-[11px] text-neutral-500">
            Feature map 6×6 (hover me)
          </p>
          <div
            className="grid grid-cols-6 gap-px rounded border border-neutral-800 bg-neutral-800 p-px"
            onMouseLeave={() => setHover(null)}
          >
            {output.map((row, i) =>
              row.map((v, j) => (
                <div
                  key={`${i}-${j}`}
                  onMouseEnter={() => setHover([i, j])}
                  className="flex h-8 w-8 cursor-crosshair items-center justify-center font-mono text-[9px] text-white/90"
                  style={{ background: shade(v, maxOut) }}
                >
                  {Math.round(v)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
