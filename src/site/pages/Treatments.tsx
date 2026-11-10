import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { useLang, useL } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'
import { Cta } from '../sections/Cta'

/** All treatments (MazMed services shown on the website), filterable by MazMed service category. */
export default function Treatments() {
  const { l } = useLang()
  const L = useL()
  const all = useDB((d) => d.services)
  const cats = useDB((d) => d.categories)
  const [cat, setCat] = useState<number | 0>(0)
  const visible = useMemo(() => all.filter((s) => s.status && s.show_on_website).sort((a, b) => a.sort_order - b.sort_order), [all])
  const usedCats = useMemo(() => cats.filter((c) => c.is_active && c.show_on_website && visible.some((s) => s.category_id === c.id)).sort((a, b) => a.sort_order - b.sort_order), [cats, visible])
  const list = visible.filter((s) => !cat || s.category_id === cat)
  const grid = useRef<HTMLDivElement>(null)
  useGSAP(() => { gsap.fromTo('[data-card]', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.9 }) }, { scope: grid, dependencies: [cat, list.length] })

  return (
    <>
      <PageHero image="/img/tooth-cut.webp" eyebrow={L('Treatments', 'العلاجات')} title={L('Every treatment, explained before it begins.', 'كل علاج، متشرح قبل ما يبدأ.')}
        sub={L('Choose a treatment to see how it works, how to prepare and what to expect after — then book it in under a minute.', 'اختار العلاج وشوف بيتعمل إزاي، تجهز له إزاي، وتتوقع إيه بعده — واحجزه في أقل من دقيقة.')}>
        <div className="mt-10 flex flex-wrap gap-2">
          {[{ id: 0, label: L('All', 'الكل') }, ...usedCats.map((c) => ({ id: c.id, label: l(c, 'name') }))].map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full border px-5 py-2.5 text-sm transition-all ${cat === c.id ? 'border-deep bg-deep text-ivory' : 'border-deep/15 bg-white/70 text-deep hover:border-deep/40'}`}>{c.label}</button>
          ))}
        </div>
      </PageHero>
      <section className="bg-[#FBFBFA] px-5 pb-28 md:px-10">
        <div ref={grid} className="mx-auto grid max-w-[88rem] gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const c = cats.find((x) => x.id === s.category_id)
            return (
              <Link data-card key={s.id} to={`/treatments/${s.slug}`} className="group relative flex min-h-[24rem] flex-col overflow-hidden rounded-[2rem] bg-white transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(14,77,60,.35)]">
                <div className="relative h-44 overflow-hidden bg-mist">
                  {s.image
                    ? <img src={s.image} alt="" loading="lazy" className={`h-full w-full transition-transform duration-700 group-hover:scale-105 ${s.image.includes('-cut') ? 'object-contain p-4' : 'object-cover'}`} />
                    : <div className="grid h-full place-items-center text-deep/60"><DentalIcon name={s.icon} size={72} strokeWidth={1.1} /></div>}
                  {c && <span className="absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] text-deep backdrop-blur">{l(c, 'name')}</span>}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-2xl font-semibold text-charcoal">{l(s, 'name')}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/65">{l(s, 'short_description')}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-deep/10 pt-4 text-xs text-charcoal/60">
                    <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{s.service_time} {L('min', 'دقيقة')}</span>
                    <span className="flex items-center gap-1 font-medium text-deep">{L('Details', 'التفاصيل')}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" /></span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
      <Cta />
    </>
  )
}
