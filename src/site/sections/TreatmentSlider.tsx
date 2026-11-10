import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { useLang, useL } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PillCta } from './HeroLight'

// Photos by kind of treatment (MazMed's own service ids differ per clinic).
const PHOTO: Record<string, { img: string; tags: { en: string; ar: string }[] }> = {
  aligner: { img: '/img/aligner-life.webp', tags: [{ en: 'Invisible', ar: 'مش باين' }, { en: 'Removable', ar: 'بيتشال' }, { en: 'Comfort fit', ar: 'مريح' }] },
  kids: { img: '/img/kids.webp', tags: [{ en: 'Gentle', ar: 'هادي' }, { en: 'No fear', ar: 'من غير خوف' }] },
  veneer: { img: '/img/smile.webp', tags: [{ en: 'Mock-up first', ar: 'Mock-up الأول' }, { en: 'Natural', ar: 'طبيعي' }] },
  implant: { img: '/img/implant-jaw.webp', tags: [{ en: '3D planned', ar: 'متخطط 3D' }, { en: 'Guided', ar: 'بدليل جراحي' }] },
}

export function TreatmentSlider() {
  const { pick, lang, l } = useLang()
  const L = useL()
  const services = useDB((d) => d.services)
  const list = useMemo(() => services.filter((s) => s.status && s.show_on_website).sort((a, b) => a.sort_order - b.sort_order), [services])
  const track = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.from('[data-tcard]', { x: lang === 'ar' ? -80 : 80, opacity: 0, stagger: 0.07, duration: 1.1, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
  }, { scope: root, dependencies: [lang, list.length], revertOnUpdate: true })

  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: dir * (lang === 'ar' ? -1 : 1) * 340, behavior: 'smooth' })
  }

  return (
    <section ref={root} className="bg-[#FBFBFA] py-24 md:py-32">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <h2 className={lang === 'ar' ? 'font-ar-display text-5xl leading-tight text-charcoal md:text-6xl' : 'font-display text-5xl leading-[0.95] tracking-[-0.02em] text-charcoal md:text-6xl'}>
          <span className="thin block">{L('Our', 'علاجات')}</span><span className="block font-semibold">{L('Treatments', 'إميرالد')}</span>
        </h2>
        <p className="max-w-xs text-sm text-charcoal/60">{L('A complete range of dental care, planned with digital diagnostics and explained before anything begins.', 'كل خدمات الأسنان في مكان واحد، متخططة بتشخيص ديجيتال ومشروحة قبل أي خطوة.')}</p>
        <PillCta to="/book" className="self-start !py-1.5 !ps-5 md:self-auto">{L('Consultation', 'استشارة')}</PillCta>
      </div>

      <div ref={track} className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:px-10 [&::-webkit-scrollbar]:hidden">
        {list.map((s) => {
          const ph = PHOTO[s.icon]
          return (
            <Link data-tcard key={s.id} to={`/treatments/${s.slug}`} className="group relative flex h-[26rem] w-[19rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] bg-mist transition-colors hover:bg-jade/50 md:w-[21rem]">
              {ph ? (
                <>
                  <img src={ph.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-premium group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-deep/40" />
                  <p className="font-display relative p-6 text-lg font-medium text-charcoal">{l(s, 'name')}</p>
                  <div className="relative mt-auto flex flex-wrap gap-2 p-5">
                    {ph.tags.map((t) => <span key={t.en} className="rounded-full bg-white/90 px-4 py-2 text-[0.65rem] tracking-[0.15em] text-charcoal uppercase backdrop-blur">{pick(t)}</span>)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between p-6">
                    <p className="font-display text-lg font-medium text-charcoal">{l(s, 'name')}</p>
                    <DentalIcon name={s.icon} size={30} className="text-emerald/60 transition-colors group-hover:text-deep" />
                  </div>
                  <div className="mt-auto border-t border-deep/10 p-6">
                    <p className="text-xs leading-relaxed text-charcoal/65">{l(s, 'short_description')}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-charcoal"><Clock className="size-3.5" />{s.service_time} {L('min', 'دقيقة')}</span>
                      <span className="flex items-center gap-1 text-[0.65rem] tracking-[0.2em] text-charcoal underline-offset-4 group-hover:underline">{L('LEARN MORE', 'اعرف أكتر')}<ArrowUpRight className="size-3 rtl:-scale-x-100" /></span>
                    </div>
                  </div>
                </>
              )}
            </Link>
          )
        })}
      </div>
      <div className="mx-auto mt-4 flex max-w-[88rem] justify-end gap-3 px-5 md:px-10">
        <button onClick={() => scroll(-1)} aria-label="Previous" className="grid size-11 place-items-center rounded-full text-stone transition-colors hover:bg-white hover:text-deep"><ArrowLeft className="size-5 rtl:-scale-x-100" /></button>
        <button onClick={() => scroll(1)} aria-label="Next" className="grid size-11 place-items-center rounded-full text-charcoal transition-colors hover:bg-white hover:text-deep"><ArrowRight className="size-5 rtl:-scale-x-100" /></button>
      </div>
    </section>
  )
}
