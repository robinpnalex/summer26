"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActName = "ReLU" | "Sigmoid" | "Tanh" | "Leaky ReLU";

const ACTS: Record<ActName, { fn: (z: number) => number; desc: string }> = {
  ReLU: {
    fn: (z) => Math.max(0, z),
    desc: "Dead simple: pass positives through, zero out negatives. The default choice in modern networks.",
  },
  Sigmoid: {
    fn: (z) => 1 / (1 + Math.exp(-z)),
    desc: "Squashes anything into (0, 1) — great for probabilities, but it saturates: gradients vanish for large |z|.",
  },
  Tanh: {
    fn: (z) => Math.tanh(z),
    desc: "Like sigmoid, but zero-centered (−1 to 1). Still saturates at the extremes.",
  },
  "Leaky ReLU": {
    fn: (z) => (z > 0 ? z : 0.1 * z),
    desc: "ReLU, but negatives keep a small slope (0.1z) so neurons can never fully 'die'.",
  },
};

export default function ActivationPlayground() {
  const [act, setAct] = useState<ActName>("ReLU");
  const [z, setZ] = useState(1.0);

  const data = useMemo(() => {
    const fn = ACTS[act].fn;
    const pts: { z: number; out: number }[] = [];
    for (let x = -5; x <= 5.001; x += 0.1) {
      pts.push({ z: Math.round(x * 10) / 10, out: fn(x) });
    }
    return pts;
  }, [act]);

  const out = ACTS[act].fn(z);

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Activation Functions
      </p>
      <p className="mb-4 text-xs text-neutral-400">{ACTS[act].desc}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(ACTS) as ActName[]).map((name) => (
          <button
            key={name}
            onClick={() => setAct(name)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              act === name
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="z"
              type="number"
              domain={[-5, 5]}
              tick={{ fill: "#737373", fontSize: 11 }}
              stroke="#404040"
            />
            <YAxis
              domain={[-2, 5]}
              tick={{ fill: "#737373", fontSize: 11 }}
              stroke="#404040"
            />
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(v) => [Number(v).toFixed(3), "output"]}
            />
            <Line
              type="monotone"
              dataKey="out"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot x={Math.round(z * 10) / 10} y={out} r={6} fill="#fbbf24" stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-3 flex items-center gap-3 text-xs text-neutral-300">
        Input z
        <input
          type="range"
          min="-5"
          max="5"
          step="0.1"
          value={z}
          onChange={(e) => setZ(parseFloat(e.target.value))}
          className="w-48 accent-emerald-400"
        />
        <span className="font-mono text-emerald-300">
          {act}({z.toFixed(1)}) = {out.toFixed(3)}
        </span>
      </label>
    </div>
  );
}
