import type { ReactNode } from 'react'
import BlurText from '@/components/reactbits/BlurText'
import { BackgroundPaths } from '@/components/ui21/BackgroundPaths'
import { useLang } from '@/lib/i18n'

export function PageHero({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children?: ReactNode }) {
  const { lang } = useLang()
  return (
    <section className="relative overflow-hidden bg-ivory px-6 pt-40 pb-16 md:pt-48 md:pb-20">
      <BackgroundPaths color="#1F7A5C" className="opacity-40" />
      <div className="relative mx-auto max-w-7xl">
        <p className="eyebrow text-emerald">{eyebrow}</p>
        <h1 className="font-display mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.02em] text-deep md:text-7xl">
          <BlurText key={lang + title} text={title} animateBy="words" delay={70} trigger="load" className="justify-start" />
        </h1>
        {sub && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/70">{sub}</p>}
        {children}
      </div>
    </section>
  )
}
