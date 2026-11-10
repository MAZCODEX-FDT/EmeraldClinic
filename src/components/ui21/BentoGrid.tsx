// Adapted from "Bento Grid" by @manuarora700 (21st.dev).
import type { ReactNode } from 'react'

export function BentoGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-6 ${className}`}>{children}</div>
}
