"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";

type Props = { xp: number };

export default function LessonComplete({ xp }: Props) {
  const { progress } = useProgress();

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Lesson complete!</h1>
        <p className="text-amber-700 mb-8">Keep practising to speak like a local.</p>

        <div className="flex justify-center gap-6 mb-10">
          <StatBox label="XP earned" value={`+${xp}`} color="text-amber-600" />
          <StatBox label="Total XP" value={String(progress.xp)} color="text-amber-600" />
          <StatBox label="Streak" value={`${progress.streak} 🔥`} color="text-orange-500" />
        </div>

        <Link
          href="/"
          className="block w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-2xl transition-colors"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}
