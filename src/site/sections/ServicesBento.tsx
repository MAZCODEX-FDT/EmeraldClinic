import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import { BentoGrid } from '@/components/ui21/BentoGrid'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'

const LAYOUT: { id: string; span: string; dark?: boolean }[] = [
  { id: 's-rootcanal', span: 'md:col-span-4', dark: true },
  { id: 's-implant', span: 'md:col-span-2' },
  { id: 's-veneers', span: 'md:col-span-2' },
  { id: 's-aligners', span: 'md:col-span-2' },
  { id: 's-whitening', span: 'md:col-span-2' },
  { id: 's-kids', span: 'md:col-span-3' },
  { id: 's-checkup', span: 'md:col-span-3' },
]

export function SectionHead({ eyebrow, title, light = false, center = false, children }: { eyebrow: string; title: string; light?: boolean; center?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${center ? 'items-center text-center md:flex-col md:items-center' : ''}`}>
      <div className={center ? 'max-w-3xl' : 'max-w-2xl'}>
        <p className={`eyebrow ${light ? 'text-jade' : 'text-emerald'}`}>{eyebrow}</p>
        <h2 data-split className={`font-display mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.02em] md:text-6xl ${light ? 'text-ivory' : 'text-deep'}`}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export function ServicesBento() {
  const { t, pick, lang } = useLang()
  const services = useDB((d) => d.services)
  const items = useMemo(() => LAYOUT.map((l) => ({ ...l, s: services.find((s) => s.id === l.id && s.visible) })).filter((x) => x.s), [services])
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.from('[data-bento] > *', { y: 60, opacity: 0, stagger: 0.08, scrollTrigger: { trigger: '[data-bento]', start: 'top 80%' } })
  }, { scope: root, dependencies: [lang, items.length], revertOnUpdate: true })

  return (
    <section ref={root} className="bg-ivory px-6 pb-28 md:pb-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow={t.services.eyebrow} title={t.services.title}>
          <Link to="/services" className="group inline-flex items-center gap-2 self-start rounded-full border border-deep/15 px-5 py-3 text-sm font-medium text-deep transition-colors hover:bg-deep hover:text-ivory md:self-auto">
            {t.services.all}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
          </Link>
        </SectionHead>
        <div data-bento className="mt-14">
          <BentoGrid>
            {items.map(({ s, span, dark }) => (
              <Link key={s!.id} to={`/services/${s!.slug}`} className={`${span} block`}>
                <SpotlightCard
                  theme={dark ? 'dark' : 'light'}
                  spotlightColor={dark ? 'rgba(191,227,211,0.35)' : 'rgba(31,122,92,0.18)'}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden !rounded-[1.75rem] p-7 transition-transform duration-500 hover:-translate-y-1 ${dark ? '!bg-deep !border-deep text-ivory' : '!bg-white !border-deep/10 text-charcoal'}`}
                >
                  {dark && <Mark size={340} tooth="rgba(191,227,211,.08)" smile="rgba(247,244,238,.06)" className="pointer-events-none absolute -end-16 -bottom-20" />}
                  <div className="flex items-start justify-between">
                    <span className={`grid size-14 place-items-center rounded-2xl ${dark ? 'bg-ivory/10 text-jade' : 'bg-jade/40 text-deep'}`}><DentalIcon name={s!.icon} size={30} /></span>
                    <span className={`grid size-10 place-items-center rounded-full border transition-all group-hover:rotate-45 ${dark ? 'border-ivory/20' : 'border-deep/10 group-hover:bg-deep group-hover:text-ivory'}`}><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
                  </div>
                  <div className="relative">
                    <p className={`text-xs ${dark ? 'text-jade' : 'text-emerald'}`}>{t.categories[s!.category]} · {pick(s!.sessions)}</p>
                    <h3 className={`font-display mt-2 font-semibold ${dark ? 'text-3xl md:text-4xl' : 'text-2xl'} ${dark ? 'text-ivory' : 'text-deep'}`}>{pick(s!.name)}</h3>
                    <p className={`mt-2 max-w-md text-sm leading-relaxed ${dark ? 'text-ivory/70' : 'text-charcoal/65'}`}>{pick(s!.short)}</p>
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  )
}
