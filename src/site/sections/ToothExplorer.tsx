import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { DentalArch, type ToothGeo, type ToothType } from '@/components/dental/DentalArch'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionHead } from './ServicesBento'

const toService: Record<ToothType, string> = { front: 'smile-design-veneers', premolar: 'tooth-coloured-fillings', molar: 'root-canal', wisdom: 'wisdom-tooth' }

export function ToothExplorer() {
  const { t, lang } = useLang()
  const [sel, setSel] = useState<ToothGeo | null>(null)
  const [hover, setHover] = useState<ToothGeo | null>(null)
  const panel = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLElement>(null)
  const active = sel?.type ?? hover?.type ?? null

  useGSAP(() => {
    gsap.from('.tooth', { scale: 0, transformOrigin: 'center', opacity: 0, stagger: { each: 0.025, from: 'center' }, duration: 0.8, ease: 'back.out(2)', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
  }, { scope: root })

  useGSAP(() => {
    if (!panel.current) return
    gsap.fromTo(panel.current.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7 })
  }, { dependencies: [sel?.fdi], scope: panel })

  const info = sel ? t.toothInfo[sel.type] : null
  const legend: { k: ToothType; l: string }[] = [
    { k: 'front', l: t.explorer.front }, { k: 'premolar', l: t.explorer.premolar }, { k: 'molar', l: t.explorer.molar }, { k: 'wisdom', l: t.explorer.wisdom },
  ]

  return (
    <section ref={root} className="relative overflow-hidden bg-cloud px-6 py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={t.explorer.eyebrow} title={t.explorer.title} />
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-charcoal/70">{t.explorer.sub}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {legend.map((l) => (
              <span key={l.k} className={`rounded-full border px-4 py-2 text-sm transition-colors ${active === l.k ? 'border-deep bg-deep text-ivory' : 'border-deep/15 text-deep'}`}>{l.l}</span>
            ))}
          </div>
          <div ref={panel} className="mt-10 min-h-[200px] rounded-3xl border border-deep/10 bg-white/80 p-7 backdrop-blur" aria-live="polite">
            {info && sel ? (
              <>
                <p className="eyebrow text-emerald">{lang === 'ar' ? 'سنة رقم' : 'Tooth'} {sel.fdi}</p>
                <h3 className="font-display mt-3 text-2xl font-semibold text-deep">{info.t}</h3>
                <p className="mt-3 leading-relaxed text-charcoal/70">{info.b}</p>
                <Link to={`/services/${toService[sel.type]}`} className="group mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald hover:text-deep">
                  {t.services.more}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
                </Link>
              </>
            ) : (
              <p className="font-display text-xl text-stone">{t.explorer.hint} →</p>
            )}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="absolute inset-[12%] rounded-full bg-jade/40 blur-3xl" />
          <DentalArch
            width={420}
            className="relative w-full"
            selected={sel?.fdi ?? null}
            onSelect={setSel}
            onHover={setHover}
            fill={(g) => (sel?.fdi === g.fdi ? '#1F7A5C' : active === g.type ? '#BFE3D3' : '#F7F4EE')}
            stroke={(g) => (active === g.type ? '#1F7A5C' : '#BFE3D3')}
          />
        </div>
      </div>
    </section>
  )
}
