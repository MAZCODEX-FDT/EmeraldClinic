import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Clock, ArrowLeft, ClipboardCheck, HeartPulse, Plus } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { Mark } from '@/components/brand/Logo'
import { useLang, useL } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'
import { DoctorPhotoCard } from '../sections/Specialists'
import { Cta } from '../sections/Cta'

/** One treatment — every field comes from the MazMed service record. */
export default function TreatmentDetail() {
  const { slug } = useParams()
  const { l, lang } = useLang()
  const L = useL()
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const cats = useDB((d) => d.categories)
  const s = services.find((x) => x.slug === slug && x.status && x.show_on_website)
  const [open, setOpen] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => { gsap.from('[data-reveal]', { y: 40, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: '[data-reveal]', start: 'top 85%' } }) }, { scope: root, dependencies: [slug, lang], revertOnUpdate: true })
  if (!s) return <Navigate to="/treatments" replace />
  const docs = doctors.filter((d) => d.show_on_website && (d.service_ids.length === 0 || d.service_ids.includes(s.id)))
  const related = services.filter((x) => s.related_service_ids.includes(x.id) && x.show_on_website)
  const cat = cats.find((c) => c.id === s.category_id)

  return (
    <div ref={root}>
      <PageHero image={s.image} eyebrow={cat ? l(cat, 'name') : L('Treatment', 'علاج')} title={l(s, 'name')} sub={l(s, 'short_description')}>
        <Link to="/treatments" className="mt-8 inline-flex items-center gap-2 text-sm text-emerald hover:text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{L('All treatments', 'كل العلاجات')}</Link>
      </PageHero>
      <section className="bg-[#FBFBFA] px-5 pb-24 md:px-10">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p data-reveal className="font-display text-2xl leading-relaxed text-charcoal md:text-3xl md:leading-relaxed">{l(s, 'description')}</p>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {[{ icon: ClipboardCheck, t: L('Before your visit', 'قبل زيارتك'), b: l(s, 'preparation') }, { icon: HeartPulse, t: L('After treatment', 'بعد العلاج'), b: l(s, 'aftercare') }].filter((x) => x.b).map((x) => (
                <div data-reveal key={x.t} className="rounded-[1.75rem] bg-white p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-mist text-deep"><x.icon className="size-5" /></span>
                  <h2 className="font-display mt-5 text-xl font-semibold text-charcoal">{x.t}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{x.b}</p>
                </div>
              ))}
            </div>
            {s.faqs.length > 0 && (
              <div data-reveal className="mt-12">
                <h2 className="font-display text-2xl font-semibold text-charcoal">{L('Questions about this treatment', 'أسئلة عن العلاج ده')}</h2>
                <div className="mt-4 divide-y divide-deep/10 rounded-[1.75rem] bg-white px-6">
                  {s.faqs.map((f, i) => (
                    <div key={i}>
                      <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-5 text-start">
                        <span className="font-medium text-charcoal">{l(f, 'question')}</span>
                        <Plus className={`size-4 shrink-0 text-deep transition-transform ${open === i ? 'rotate-45' : ''}`} />
                      </button>
                      {open === i && <p className="pb-5 text-sm leading-relaxed text-charcoal/70">{l(f, 'answer')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="glow-bg grain relative overflow-hidden rounded-[2rem] p-8 text-ivory">
              <Mark size={260} tooth="rgba(191,227,211,.08)" smile="rgba(247,244,238,.06)" className="pointer-events-none absolute -end-16 -bottom-16" />
              <span className="grid size-16 place-items-center rounded-2xl bg-jade text-deep"><DentalIcon name={s.icon} size={34} /></span>
              <p className="mt-8 flex items-center gap-2 text-xs text-jade"><Clock className="size-3.5" />{L('Chair time', 'مدة الجلسة')}</p>
              <p className="font-display mt-1 text-3xl">{s.service_time} {L('min', 'دقيقة')}</p>
              <p className="mt-6 text-sm text-ivory/70">{L('Your plan, every visit and its cost are written for you before anything begins.', 'خطتك وكل زيارة وتكلفتها مكتوبين ليك قبل أي حاجة.')}</p>
              <Link to={`/book?service=${s.id}`} className="group mt-8 flex items-center justify-between rounded-full bg-ivory py-2.5 ps-6 pe-2.5 font-medium text-deep transition-colors hover:bg-jade">
                {L('Book this treatment', 'احجز العلاج ده')}<span className="grid size-10 place-items-center rounded-full bg-deep text-ivory transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
              </Link>
            </div>
            {related.length > 0 && (
              <div className="mt-5 space-y-3">
                <p className="eyebrow text-stone">{L('Related treatments', 'علاجات مرتبطة')}</p>
                {related.map((o) => (
                  <Link key={o.id} to={`/treatments/${o.slug}`} className="flex items-center gap-4 rounded-2xl bg-white p-4 transition-colors hover:bg-mist">
                    <span className="grid size-11 place-items-center rounded-xl bg-mist text-deep"><DentalIcon name={o.icon} size={22} /></span>
                    <span className="font-display font-medium text-charcoal">{l(o, 'name')}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
      {docs.length > 0 && (
        <section className="bg-white px-5 py-24 md:px-10">
          <div className="mx-auto max-w-[88rem]">
            <h2 className={`${lang === 'ar' ? 'font-ar-display' : 'font-display'} text-3xl font-semibold text-charcoal md:text-4xl`}>{L('Doctors for this treatment', 'الأطباء المختصين')}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">{docs.map((d) => <DoctorPhotoCard key={d.id} d={d} serviceId={s.id} />)}</div>
          </div>
        </section>
      )}
      <Cta />
    </div>
  )
}
