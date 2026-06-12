"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Compares SGD, Momentum, and Adam minimizing the same ill-conditioned
 * quadratic f(x, y) = 0.5 * (x^2 + 20 y^2) — a long narrow valley where
 * vanilla SGD zig-zags. Loss curves are simulated live as the user
 * changes the learning rate.
 */

const gradF = ([x, y]: number[]) => [x, 20 * y];
const lossF = ([x, y]: number[]) => 0.5 * (x * x + 20 * y * y);

const START = [-8, 1.5];
const STEPS = 60;

function simulate(lr: number) {
  // SGD
  let p = [...START];
  const sgd: number[] = [];
  for (let t = 0; t < STEPS; t++) {
    const g = gradF(p);
    p = [p[0] - lr * g[0], p[1] - lr * g[1]];
    sgd.push(lossF(p));
  }

  // Momentum
  p = [...START];
  let v = [0, 0];
  const mom: number[] = [];
  for (let t = 0; t < STEPS; t++) {
    const g = gradF(p);
    v = [0.9 * v[0] - lr * g[0], 0.9 * v[1] - lr * g[1]];
    p = [p[0] + v[0], p[1] + v[1]];
    mom.push(lossF(p));
  }

  // Adam
  p = [...START];
  let m = [0, 0];
  let s = [0, 0];
  const adam: number[] = [];
  const b1 = 0.9,
    b2 = 0.999,
    eps = 1e-8;
  for (let t = 1; t <= STEPS; t++) {
    const g = gradF(p);
    m = [b1 * m[0] + (1 - b1) * g[0], b1 * m[1] + (1 - b1) * g[1]];
    s = [b2 * s[0] + (1 - b2) * g[0] ** 2, b2 * s[1] + (1 - b2) * g[1] ** 2];
    const mh = [m[0] / (1 - b1 ** t), m[1] / (1 - b1 ** t)];
    const sh = [s[0] / (1 - b2 ** t), s[1] / (1 - b2 ** t)];
    p = [
      p[0] - (lr * 5 * mh[0]) / (Math.sqrt(sh[0]) + eps),
      p[1] - (lr * 5 * mh[1]) / (Math.sqrt(sh[1]) + eps),
    ];
    adam.push(lossF(p));
  }

  const clip = (v: number) => Math.min(v, 200);
  return Array.from({ length: STEPS }, (_, i) => ({
    step: i + 1,
    SGD: clip(sgd[i]),
    Momentum: clip(mom[i]),
    Adam: clip(adam[i]),
  }));
}

export default function OptimizerPlayground() {
  const [lr, setLr] = useState(0.04);
  const data = useMemo(() => simulate(lr), [lr]);

  return (
    <div className="my-8 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-1 text-sm font-semibold text-white">
        Playground: Optimizer Race
      </p>
      <p className="mb-4 text-xs text-neutral-400">
        All three optimizers minimize the same narrow valley,
        f(x, y) = ½(x² + 20y²), from the same start. Notice how SGD needs a tiny
        learning rate to avoid oscillating in the steep direction, while Adam
        adapts per-parameter. (Loss is clipped at 200 when things explode.)
      </p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="step"
              tick={{ fill: "#737373", fontSize: 11 }}
              stroke="#404040"
              label={{ value: "step", position: "insideBottomRight", fill: "#737373", fontSize: 11 }}
            />
            <YAxis tick={{ fill: "#737373", fontSize: 11 }} stroke="#404040" />
            <Tooltip
              contentStyle={{
                background: "#171717",
                border: "1px solid #333",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#a3a3a3" }}
              formatter={(v) => Number(v).toFixed(2)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="SGD" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Momentum" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Adam" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <label className="mt-3 flex items-center gap-3 text-xs text-neutral-300">
        Learning rate η
        <input
          type="range"
          min="0.005"
          max="0.1"
          step="0.005"
          value={lr}
          onChange={(e) => setLr(parseFloat(e.target.value))}
          className="w-48 accent-emerald-400"
        />
        <span className="font-mono text-emerald-300">{lr.toFixed(3)}</span>
      </label>
    </div>
  );
}
