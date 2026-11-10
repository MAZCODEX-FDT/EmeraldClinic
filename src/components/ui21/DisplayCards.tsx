// Adapted from "Display Cards" by @Codehagen (21st.dev) — stacked, skewed cards that lift on hover.
import type { ReactNode } from 'react'

export type DisplayCardItem = { icon?: ReactNode; title: ReactNode; description: ReactNode; date?: ReactNode }

export function DisplayCards({ cards }: { cards: DisplayCardItem[] }) {
  const pos = [
    '[grid-area:stack] hover:-translate-y-10 before:absolute before:inset-0 before:rounded-2xl before:bg-ivory/60 before:content-[""] before:transition-opacity before:duration-700 hover:before:opacity-0 grayscale-[60%] hover:grayscale-0',
    '[grid-area:stack] translate-x-10 md:translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:inset-0 before:rounded-2xl before:bg-ivory/50 before:content-[""] before:transition-opacity before:duration-700 hover:before:opacity-0 grayscale-[40%] hover:grayscale-0',
    '[grid-area:stack] translate-x-20 md:translate-x-32 translate-y-20 hover:translate-y-10',
  ]
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center" dir="ltr">
      {cards.slice(0, 3).map((c, i) => (
        <div
          key={i}
          className={`relative flex h-44 w-[19rem] md:w-[24rem] -skew-y-[6deg] select-none flex-col justify-between rounded-2xl border border-deep/10 bg-white/90 px-5 py-4 shadow-[0_30px_60px_-30px_rgba(14,77,60,.45)] backdrop-blur-sm transition-all duration-700 ease-premium hover:border-jade ${pos[i]}`}
        >
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-deep text-jade">{c.icon}</span>
            <p className="font-display text-base font-semibold text-deep">{c.title}</p>
          </div>
          <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-charcoal/80">{c.description}</p>
          <p className="text-xs text-stone">{c.date}</p>
        </div>
      ))}
    </div>
  )
}
