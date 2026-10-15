import type { ReactNode } from "react";
import { KEYCAP } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className={cn(KEYCAP, "mx-0.5 inline-flex min-w-6 justify-center px-1.5 py-0.5 font-mono text-[0.85em] leading-none")}>
    {children}
  </kbd>
);
