import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Ear, FileText, Hand, Check, MapPin, Clock, Phone, Plus, Star } from 'lucide-react'
import { useLang, useL } from '@/lib/i18n'
import { useDB, mainBranch, money } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'
import { PillCta } from '../sections/HeroLight'

/**
 * "Your visit" — answers the worries people have before a dental visit, one by one,
 * and turns that reassurance into a booking.
 */
export default function Visit() {
  const { t, lang, l } = useLang()
  const L = useL()
  const branch = useDB(mainBranch)
  const services = useDB((d) => d.services)
  const reviews = useDB((d) => d.reviews)
  const faqs = useDB((d) => d.faqs)
  const checkup = services.find((s) => s.icon === 'checkup') ?? services[0]
  const quote = useMemo(() => reviews.find((r) => r.is_published && /[؀-ۿ]/.test(r.review) === (lang === 'ar') && r.rating === 5), [reviews, lang])
  const [open, setOpen] = useState(0)
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('[data-step]').forEach((el) => {
      gsap.from(el, { y: 60, opacity: 0, duration: 1.1, scrollTrigger: { trigger: el, start: 'top 85%' } })
    })
    gsap.fromTo('[data-rail]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 70%', end: 'bottom 70%', scrub: true } })
    gsap.from('[data-promise]', { y: 40, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: '[data-promises]', start: 'top 85%' } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const reasons = [
    { label: L('I’m in pain', 'عندي وجع'), service: 3 },
    { label: L('A check-up', 'كشف وتنظيف'), service: 1 },
    { label: L('A nicer smile', 'ابتسامة أحلى'), service: 7 },
    { label: L('Straighter teeth', 'تقويم'), service: 8 },
    { label: L('My child', 'لطفلي'), service: 9 },
    { label: L('A second opinion', 'رأي تاني'), service: 1 },
  ]
  const images = ['/img/consult.webp', '/img/scan.webp', '/img/plan.webp', '/img/interior.webp', '/img/crown.webp']

  return (
    <div ref={root}>
      <PageHero image="/img/hero-cut.webp" eyebrow={L('Your visit', 'زيارتك')} title={L('Your first visit, without the worry.', 'أول زيارة، من غير قلق.')}
        sub={L('Here is exactly what happens, what it costs and how we keep you comfortable — so the only thing left is choosing a time.', 'ده بالظبط اللي بيحصل، وبيتكلف قد إيه، وإزاي بنخليك مرتاح — علشان مايبقاش فاضل غير إنك تختار ميعاد.')}>
        <div className="mt-8 flex flex-wrap gap-3">
          <PillCta dark to="/book">{L('Book your first visit', 'احجز أول زيارة')}</PillCta>
          <a href={`tel:${branch.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 rounded-full border border-deep/15 bg-white/70 px-6 py-3 text-sm font-medium text-deep"><Phone className="size-4" /><span dir="ltr">{branch.phone}</span></a>
        </div>
      </PageHero>

      {/* promises */}
      <section className="bg-[#FBFBFA] px-5 pb-20 md:px-10">
        <div data-promises className="mx-auto grid max-w-[88rem] gap-4 md:grid-cols-3">
          {[
            { icon: Ear, t: L('We listen first', 'بنسمعك الأول'), b: L('The first minutes are yours: what hurts, what worries you, what you hope for.', 'أول دقايق بتاعتك: إيه اللي بيوجعك، إيه اللي مقلقك، وإيه اللي نفسك فيه.') },
            { icon: FileText, t: L('Nothing without a written plan', 'مفيش حاجة من غير خطة مكتوبة'), b: L('Options, visits and costs are written and handed to you. You decide at home, calmly.', 'الاختيارات والزيارات والتكاليف مكتوبة في إيدك. وتقرر في البيت براحتك.') },
            { icon: Hand, t: L('Raise your hand, we stop', 'ارفع إيدك، بنوقف'), b: L('Anxious? Tell us. Longer appointments, gentle anaesthesia and a pause whenever you need it.', 'قلقان؟ قولنا. ميعاد أطول، بنج هادي، ووقفة وقت ما تحتاج.') },
          ].map((p) => (
            <div data-promise key={p.t} className="rounded-[2rem] bg-white p-8">
              <span className="grid size-14 place-items-center rounded-2xl bg-mist text-deep"><p.icon className="size-6" /></span>
              <h2 className="font-display mt-6 text-2xl font-semibold text-charcoal">{p.t}</h2>
              <p className="mt-3 leading-relaxed text-charcoal/70">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the visit, step by step */}
      <section className="bg-white px-5 py-24 md:px-10">
        <div className="mx-auto max-w-[72rem]">
          <p className="eyebrow text-emerald">{t.journey.eyebrow}</p>
          <h2 className={`${lang === 'ar' ? 'font-ar-display leading-tight' : 'font-display tracking-[-0.02em]'} mt-4 max-w-3xl text-4xl font-bold text-charcoal md:text-6xl`}>{t.journey.title}</h2>
          <ol data-steps className="relative mt-16 space-y-16 ps-10 md:ps-16">
            <span data-rail className="absolute start-[0.95rem] top-2 bottom-2 w-px origin-top bg-emerald/40 md:start-[1.45rem]" />
            {t.journey.steps.map((s, i) => (
              <li data-step key={i} className="relative grid items-center gap-8 md:grid-cols-2">
                <span className="font-display absolute -start-10 top-0 grid size-8 place-items-center rounded-full bg-deep text-sm text-ivory md:-start-16 md:size-12 md:text-base">{i + 1}</span>
                <div>
                  <h3 className="font-display text-3xl font-semibold text-charcoal">{s.t}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-charcoal/70">{s.b}</p>
                </div>
                <img src={images[i]} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-[1.75rem] object-cover" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* practical: bring / time / cost */}
      <section className="bg-cloud px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[88rem] gap-4 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8">
            <h2 className="font-display text-2xl font-semibold text-charcoal">{L('What to bring', 'هات معاك إيه')}</h2>
            <ul className="mt-5 space-y-3 text-charcoal/75">
              {[L('Your national ID', 'البطاقة الشخصية'), L('Any old X-rays or reports', 'أي أشعة أو تقارير قديمة'), L('A list of medicines you take', 'قائمة الأدوية اللي بتاخدها'), L('Questions — write them down', 'أسئلتك — اكتبها')].map((x) => (
                <li key={x} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-emerald" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white p-8">
            <h2 className="font-display text-2xl font-semibold text-charcoal">{L('How long it takes', 'بتاخد وقت قد إيه')}</h2>
            <p className="font-display mt-5 text-6xl font-bold text-deep">{checkup?.service_time ?? 45}<span className="ms-2 text-xl font-medium text-stone">{L('min', 'دقيقة')}</span></p>
            <p className="mt-3 text-charcoal/70">{L('For the first visit: conversation, digital exam, cleaning and your written findings. We never overbook the chair.', 'لأول زيارة: كلام، كشف ديجيتال، تنظيف، وتقرير مكتوب. ومبنزحمش المواعيد.')}</p>
          </div>
          <div className="rounded-[2rem] bg-deep p-8 text-ivory">
            <h2 className="font-display text-2xl font-semibold">{L('What it costs', 'بتتكلف قد إيه')}</h2>
            {checkup && <p className="font-display mt-5 text-5xl font-bold">{money(checkup.charges, lang)}</p>}
            <p className="mt-3 text-ivory/75">{L('The first visit is a check-up and cleaning. Any treatment after that is quoted in writing first — the price never changes without your agreement.', 'أول زيارة كشف وتنظيف. وأي علاج بعدها بيتكتب سعره الأول — والسعر مبيتغيرش غير بموافقتك.')}</p>
          </div>
        </div>
      </section>

      {/* reassurance quote */}
      {quote && (
        <section className="bg-white px-5 py-24 text-center md:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="flex justify-center gap-1 text-emerald">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5 fill-current" />)}</div>
            <blockquote className={`${lang === 'ar' ? 'font-ar-display' : 'font-display'} mt-6 text-3xl leading-snug text-charcoal md:text-4xl`}>“{quote.review}”</blockquote>
            <p className="mt-5 text-stone">{quote.name}</p>
          </div>
        </section>
      )}

      {/* conversion: why are you coming? */}
      <section className="px-2 pb-2 md:px-4 md:pb-4">
        <div className="glow-bg grain relative overflow-hidden rounded-[2rem] px-6 py-20 text-ivory md:rounded-[2.75rem] md:px-12">
          <div className="relative mx-auto max-w-[72rem]">
            <h2 className={`${lang === 'ar' ? 'font-ar-display leading-tight' : 'font-display tracking-[-0.02em]'} max-w-2xl text-4xl font-bold md:text-6xl`}>{L('What brings you in?', 'جاي ليه؟')}</h2>
            <p className="mt-4 max-w-xl text-ivory/75">{L('Pick one and we will take you straight to the right doctor and the free times.', 'اختار واحدة وهنوصلك على طول للدكتور المناسب والمواعيد المتاحة.')}</p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((r) => (
                <Link key={r.label} to={`/book?service=${r.service}`} className="group flex items-center justify-between rounded-2xl border border-ivory/15 bg-ivory/5 px-6 py-5 text-lg backdrop-blur transition-colors hover:bg-ivory hover:text-deep">
                  {r.label}<ArrowUpRight className="size-5 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* where & when + FAQ */}
      <section className="bg-[#FBFBFA] px-5 py-24 md:px-10">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-semibold text-charcoal">{L('Finding us', 'مكاننا')}</h2>
            <div className="mt-6 space-y-3 text-charcoal/80">
              <p className="flex gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-emerald" />{l(branch, 'address')}</p>
              <p className="flex gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-emerald" />{l(branch, 'hours')}</p>
            </div>
            <iframe title="Map" loading="lazy" className="mt-6 aspect-[4/3] w-full rounded-[1.75rem] border-0 grayscale-[30%]" src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-charcoal">{L('Before you come', 'قبل ما تيجي')}</h2>
            <div className="mt-6 divide-y divide-deep/10 rounded-[1.75rem] bg-white px-6">
              {faqs.map((f, i) => (
                <div key={f.id}>
                  <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-5 text-start">
                    <span className="font-medium text-charcoal">{l(f, 'question')}</span><Plus className={`size-4 shrink-0 text-deep transition-transform ${open === i ? 'rotate-45' : ''}`} />
                  </button>
                  {open === i && <p className="pb-5 text-sm leading-relaxed text-charcoal/70">{l(f, 'answer')}</p>}
                </div>
              ))}
            </div>
            <PillCta dark to="/book" className="mt-8">{L('Choose a time', 'اختار ميعاد')}</PillCta>
          </div>
        </div>
      </section>

      {/* sticky mobile CTA */}
      <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden"><PillCta dark to="/book" className="w-full !py-2">{L('Book your first visit', 'احجز أول زيارة')}</PillCta></div>
    </div>
  )
}
