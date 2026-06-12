"use client";

import { InlineMath, BlockMath } from "react-katex";

export function M({ tex }: { tex: string }) {
  return <InlineMath math={tex} />;
}

export function MathBlock({ tex }: { tex: string }) {
  return <BlockMath math={tex} />;
}
