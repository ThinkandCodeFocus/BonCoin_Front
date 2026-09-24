"use client"

import { useReveal } from "@/hooks/use-reveal"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: React.ReactNode
  className?: string
}

/** Fait apparaître son contenu (fondu + légère montée) quand il entre dans le viewport. */
export function Reveal({ children, className }: RevealProps) {
  const { ref, isVisible } = useReveal()

  return (
    <div ref={ref} className={cn("reveal", isVisible && "is-visible", className)}>
      {children}
    </div>
  )
}
