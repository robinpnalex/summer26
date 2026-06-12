"use client";

import { createContext, useContext, type ReactNode } from "react";

const ModuleSlugContext = createContext<string | null>(null);

export function ModuleSlugProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <ModuleSlugContext.Provider value={slug}>
      {children}
    </ModuleSlugContext.Provider>
  );
}

/** The slug of the module page we're rendering inside, or null on other pages. */
export function useModuleSlug(): string | null {
  return useContext(ModuleSlugContext);
}
