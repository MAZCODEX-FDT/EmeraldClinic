import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Mark } from '@/components/brand/Logo'
import { useLang, useL } from '@/lib/i18n'
import { useDB, type Doctor } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'

function Photo({ d, className = '' }: { d: Doctor; className?: string }) {
  return d.photo ? (
    <img src={d.photo} alt={d.name.en} className={`h-full w-full object-cover object-top fade-b ${className}`} />
  ) : (
    <div className={`grid h-full w-full place-items-center bg-mist ${className}`}><span className="font-display text-6xl text-deep/40">{d.initials}</span></div>
  )
}

/** Specialists carousel: colour centre, grayscale neighbours (after the "Meet Our Specialists" reference). */
export function Specialists({ compact = false }: { compact?: boolean }) {
  const { pick, lang } = useLang()
  const L = useL()
  const all = useDB((d) => d.doctors)
  const docs = useMemo(() => all.filter((d) => d.visible), [all])
  const [i, setI] = useState(0)
  const root = useRef<HTMLElement>(null)
  const n = docs.length
  const at = (k: number) => docs[((k % n) + n) % n]

  useGSAP(() => {
    gsap.fromTo('[data-center]', { y: 30, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' })
    gsap.fromTo('[data-side]', { opacity: 0 }, { opacity: 1, duration: 0.9, stagger: 0.08 })
    gsap.fromTo('[data-name]', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.15 })
  }, { scope: root, dependencies: [i] })

  if (!n) return null
  const cur = at(i), prev = at(i - 1), next = at(i + 1)
  const go = (d: number) => setI((v) => v + d)

  return (
    <section ref={root} className={`bg-white px-5 md:px-10 ${compact ? 'py-10' : 'py-24 md:py-32'}`}>
      <div className="relative mx-auto max-w-[80rem] overflow-hidden rounded-[2.5rem] bg-[#FBFBFA] px-6 pt-10 pb-10 md:px-14 md:pt-14">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow flex items-center gap-2 text-charcoal"><Plus className="size-3.5" />{L('Our specialists', 'أطباؤنا')}</p>
            <h2 className={`${lang === 'ar' ? 'font-ar-display' : 'font-display tracking-[-0.02em]'} mt-3 text-4xl text-charcoal md:text-6xl`}>{L('Meet Our Specialists', 'تعرّف على أطبائنا')}</h2>
          </div>
          <div className="hidden flex-col items-center text-[0.65rem] text-stone tabular-nums md:flex" dir="ltr">
            <span>{String((((i % n) + n) % n) + 1).padStart(2, '0')}</span><span className="my-1 h-8 w-px bg-stone/40" /><span>{String(n).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-[1fr_1.6fr_1fr] items-end gap-4 md:gap-10">
          {[prev, cur, next].map((d, k) => {
            const center = k === 1
            return (
              <button key={d.id + k} onClick={() => !center && go(k === 0 ? -1 : 1)} data-center={center || undefined} data-side={!center || undefined}
                className={`relative flex flex-col ${center ? 'cursor-default' : 'cursor-pointer'}`} aria-label={pick(d.name)}>
                {!center && <p className="mb-4 hidden border-s-2 border-charcoal ps-3 text-start text-xs font-semibold tracking-wide text-charcoal uppercase md:block">{pick(d.name)}</p>}
                <div className={`relative ${center ? 'aspect-[3/4]' : 'aspect-[3/4] scale-[0.86] grayscale transition-all duration-700 hover:grayscale-0'}`}>
                  {center && <div className="absolute inset-[8%] -z-0 rounded-full bg-jade/70 blur-3xl" />}
                  <div className="relative h-full"><Photo d={d} /></div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="relative mt-2 flex items-center justify-center gap-4 md:gap-8">
          <button onClick={() => go(-1)} aria-label="Previous" className="grid size-10 place-items-center rounded-lg border border-charcoal/20 bg-white text-charcoal [clip-path:polygon(25%_0,100%_0,100%_100%,0_100%,0_25%)] hover:bg-deep hover:text-ivory"><ChevronLeft className="size-4 rtl:-scale-x-100" /></button>
          <Link data-name to={`/book?doctor=${cur.id}`} className="group relative flex min-w-[16rem] items-center justify-between gap-6 px-6 py-3 md:min-w-[22rem]">
            <span className="absolute inset-y-0 start-0 w-3 rounded-s-md border-y-[3px] border-s-[3px] border-emerald" />
            <span className="absolute inset-y-0 end-0 w-3 rounded-e-md border-y-[3px] border-e-[3px] border-emerald" />
            <span className="text-start">
              <span className="block text-sm font-semibold tracking-wide text-charcoal uppercase">{pick(cur.name)}</span>
              <span className="block font-mono text-[0.7rem] text-stone">{pick(cur.role)}</span>
              <span className="block font-mono text-[0.7rem] text-stone">{cur.years}+ {L('years experience', 'سنة خبرة')}</span>
            </span>
            <ArrowUpRight className="size-6 text-charcoal transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
          </Link>
          <button onClick={() => go(1)} aria-label="Next" className="grid size-10 place-items-center rounded-lg border border-charcoal/20 bg-white text-charcoal [clip-path:polygon(0_0,75%_0,100%_25%,100%_100%,0_100%)] hover:bg-deep hover:text-ivory"><ChevronRight className="size-4 rtl:-scale-x-100" /></button>
        </div>
        <Mark size={260} tooth="rgba(31,122,92,.04)" smile="rgba(14,77,60,.03)" className="pointer-events-none absolute -end-16 -bottom-20" />
      </div>
    </section>
  )
}

/** Grid card used on /doctors and treatment pages. */
export function DoctorPhotoCard({ d }: { d: Doctor }) {
  const { pick } = useLang()
  const L = useL()
  return (
    <Link to={`/book?doctor=${d.id}`} className="group block overflow-hidden rounded-[2rem] bg-[#FBFBFA] transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(14,77,60,.35)]">
      <div className="relative aspect-[3/4] overflow-hidden">
        <div className="absolute inset-[15%] rounded-full bg-jade/0 blur-3xl transition-colors duration-700 group-hover:bg-jade/70" />
        <div className="relative h-full grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"><Photo d={d} /></div>
      </div>
      <div className="flex items-end justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-semibold tracking-wide text-charcoal uppercase">{pick(d.name)}</p>
          <p className="mt-1 text-xs text-stone">{pick(d.role)}</p>
          <p className="mt-0.5 text-xs text-stone">{d.years}+ {L('years experience', 'سنة خبرة')}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-deep text-ivory transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
      </div>
    </Link>
  )
}
