import { useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Clock, CalendarDays, ArrowLeft } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'
import { DoctorCard } from '../sections/Doctors'
import { Cta } from '../sections/Cta'

export default function ServiceDetail() {
  const { slug } = useParams()
  const { t, pick, lang } = useLang()
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const s = services.find((x) => x.slug === slug && x.visible)
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    gsap.from('[data-step]', { x: lang === 'ar' ? 40 : -40, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: '[data-steps]', start: 'top 80%' } })
    gsap.fromTo('[data-rail]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 75%', end: 'bottom 60%', scrub: true } })
  }, { scope: root, dependencies: [slug, lang], revertOnUpdate: true })
  if (!s) return <Navigate to="/services" replace />
  const docs = doctors.filter((d) => d.visible && d.services.includes(s.id))
  const others = services.filter((x) => x.visible && x.id !== s.id && x.category === s.category).slice(0, 2)

  return (
    <div ref={root}>
      <PageHero eyebrow={t.categories[s.category]} title={pick(s.name)} sub={pick(s.short)}>
        <Link to="/services" className="mt-8 inline-flex items-center gap-2 text-sm text-emerald hover:text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{t.services.all}</Link>
      </PageHero>
      <section className="bg-ivory px-6 pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-display text-2xl leading-relaxed text-deep md:text-3xl md:leading-relaxed">{pick(s.long)}</p>
            <h2 className="eyebrow mt-16 text-emerald">{t.services.steps}</h2>
            <ol data-steps className="relative mt-8 space-y-8 ps-10">
              <span data-rail className="absolute start-[0.95rem] top-2 bottom-2 w-px origin-top bg-emerald/40" />
              {s.steps.map((st, i) => (
                <li data-step key={i} className="relative">
                  <span className="absolute -start-10 top-0 grid size-8 place-items-center rounded-full bg-deep font-display text-sm text-ivory">{i + 1}</span>
                  <p className="font-display text-xl font-medium text-deep">{pick(st)}</p>
                </li>
              ))}
            </ol>
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="glow-bg grain relative overflow-hidden rounded-[2rem] p-8 text-ivory">
              <Mark size={260} tooth="rgba(191,227,211,.08)" smile="rgba(247,244,238,.06)" className="pointer-events-none absolute -end-16 -bottom-16" />
              <span className="grid size-16 place-items-center rounded-2xl bg-jade text-deep"><DentalIcon name={s.icon} size={34} /></span>
              <dl className="mt-8 grid grid-cols-2 gap-6">
                <div><dt className="flex items-center gap-1.5 text-xs text-jade"><Clock className="size-3.5" />{t.services.duration}</dt><dd className="font-display mt-1 text-2xl">{s.duration} {t.services.min}</dd></div>
                <div><dt className="flex items-center gap-1.5 text-xs text-jade"><CalendarDays className="size-3.5" />{t.services.sessions}</dt><dd className="font-display mt-1 text-2xl">{pick(s.sessions)}</dd></div>
              </dl>
              <p className="mt-8 text-sm text-ivory/70">{t.plan.sub}</p>
              <Link to={`/book?service=${s.id}`} className="group mt-8 flex items-center justify-between rounded-full bg-ivory py-3 ps-6 pe-3 font-medium text-deep transition-colors hover:bg-jade">
                {t.services.book}<span className="grid size-9 place-items-center rounded-full bg-deep text-ivory transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
              </Link>
            </div>
            {others.length > 0 && (
              <div className="mt-5 space-y-3">
                {others.map((o) => (
                  <Link key={o.id} to={`/services/${o.slug}`} className="flex items-center gap-4 rounded-2xl border border-deep/10 bg-white p-4 transition-colors hover:border-emerald">
                    <span className="grid size-11 place-items-center rounded-xl bg-jade/40 text-deep"><DentalIcon name={o.icon} size={22} /></span>
                    <span className="font-display font-medium text-deep">{pick(o.name)}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
      {docs.length > 0 && (
        <section className="bg-beige/50 px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-semibold text-deep md:text-4xl">{t.services.related}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{docs.map((d) => <DoctorCard key={d.id} d={d} />)}</div>
          </div>
        </section>
      )}
      <div className="pt-24"><Cta /></div>
    </div>
  )
}
