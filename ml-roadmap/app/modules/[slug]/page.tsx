import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { MODULES, getModule } from "@/lib/modules";
import {
  ModuleHeader,
  ModuleFooter,
  FurtherReading,
  type Reading,
} from "@/components/Lesson";
import { ModuleSlugProvider } from "@/components/ModuleContext";
import Toc from "@/components/Toc";

import Module0, {
  furtherReading as reading0,
} from "@/content/linear-logistic-regression";
import Module1, {
  furtherReading as reading1,
} from "@/content/support-vector-machines";
import Module2, {
  furtherReading as reading2,
} from "@/content/pytorch-fundamentals";
import Module3, {
  furtherReading as reading3,
} from "@/content/multi-layer-perceptrons";
import Module4, {
  furtherReading as reading4,
} from "@/content/optimization-and-regularization";
import Module5, {
  furtherReading as reading5,
} from "@/content/convolutional-neural-networks";
import Module6, { furtherReading as reading6 } from "@/content/transformers";
import ModuleAdv, {
  furtherReading as readingAdv,
} from "@/content/advanced-challenges";

const CONTENT: Record<
  string,
  { Component: ComponentType; reading: Reading[] }
> = {
  "linear-logistic-regression": { Component: Module0, reading: reading0 },
  "support-vector-machines": { Component: Module1, reading: reading1 },
  "pytorch-fundamentals": { Component: Module2, reading: reading2 },
  "multi-layer-perceptrons": { Component: Module3, reading: reading3 },
  "optimization-and-regularization": { Component: Module4, reading: reading4 },
  "convolutional-neural-networks": { Component: Module5, reading: reading5 },
  transformers: { Component: Module6, reading: reading6 },
  "advanced-challenges": { Component: ModuleAdv, reading: readingAdv },
};

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = getModule(slug);
  return meta ? { title: meta.title, description: meta.description } : {};
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getModule(slug);
  const entry = CONTENT[slug];
  if (!meta || !entry) notFound();

  const { Component, reading } = entry;

  return (
    <ModuleSlugProvider slug={slug}>
      <article>
        <ModuleHeader meta={meta} />
        <Component />
        <FurtherReading items={reading} />
        <ModuleFooter slug={slug} />
      </article>
      <Toc key={slug} />
    </ModuleSlugProvider>
  );
}
