import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, CalendarDays } from 'lucide-react'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { useLang } from '@/lib/i18n'
import { useDB, type Category } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'
import { Cta } from '../sections/Cta'

export default function Services() {
  const { t, pick } = useLang()
  const all = useDB((d) => d.services)
  const [cat, setCat] = useState<Category | 'all'>('all')
  const list = useMemo(() => all.filter((s) => s.visible && (cat === 'all' || s.category === cat)), [all, cat])
  const cats = ['all', ...Array.from(new Set(all.filter((s) => s.visible).map((s) => s.category)))] as (Category | 'all')[]
  const grid = useRef<HTMLDivElement>(null)
  useGSAP(() => { gsap.from('[data-card]', { y: 40, opacity: 0, stagger: 0.06, duration: 0.9 }) }, { scope: grid, dependencies: [cat], revertOnUpdate: true })

  return (
    <>
      <PageHero eyebrow={t.services.eyebrow} title={t.services.title}>
        <div className="mt-10 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-5 py-2.5 text-sm transition-all ${cat === c ? 'border-deep bg-deep text-ivory' : 'border-deep/15 bg-white/60 text-deep hover:border-deep/40'}`}>{t.categories[c]}</button>
          ))}
        </div>
      </PageHero>
      <section className="bg-ivory px-6 pb-28">
        <div ref={grid} className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s, i) => (
            <Link data-card key={s.id} to={`/services/${s.slug}`} className="block">
              <SpotlightCard theme="light" spotlightColor="rgba(31,122,92,0.18)" className="group flex h-full min-h-[22rem] flex-col !rounded-[1.75rem] !border-deep/10 !bg-white p-7">
                <div className="flex items-start justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-jade/40 text-deep transition-colors group-hover:bg-deep group-hover:text-jade"><DentalIcon name={s.icon} size={30} /></span>
                  <span className="font-display text-sm text-stone">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-8 text-xs text-emerald">{t.categories[s.category]}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-deep">{pick(s.name)}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal/65">{pick(s.short)}</p>
                <div className="mt-6 flex items-center justify-between border-t border-deep/10 pt-5 text-xs text-charcoal/60">
                  <span className="flex items-center gap-4"><span className="flex items-center gap-1.5"><Clock className="size-3.5" />{s.duration} {t.services.min}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{pick(s.sessions)}</span></span>
                  <ArrowUpRight className="size-4 text-deep transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </section>
      <Cta />
    </>
  )
}
