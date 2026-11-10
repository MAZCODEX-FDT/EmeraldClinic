import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Silk from '@/components/reactbits/Silk'
import CountUp from '@/components/reactbits/CountUp'
import Magnet from '@/components/reactbits/Magnet'
import { Mark } from '@/components/brand/Logo'
import { useLang, useL } from '@/lib/i18n'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

export function PillCta({ to, children, dark = false, className = '' }: { to: string; children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <Link to={to} className={`group inline-flex items-center justify-between gap-6 rounded-full py-2 ps-7 pe-2 text-sm font-medium shadow-[0_10px_30px_-12px_rgba(14,77,60,.35)] transition-colors ${dark ? 'bg-deep text-ivory hover:bg-emerald' : 'bg-white text-charcoal hover:bg-ivory'} ${className}`}>
      {children}
      <span className={`grid size-11 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-45 ${dark ? 'bg-ivory text-deep' : 'bg-deep text-ivory'}`}><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
    </Link>
  )
}

export function HeroLight() {
  const { lang } = useLang()
  const L = useL()
  const root = useRef<HTMLElement>(null)
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024)
  useEffect(() => { const on = () => setWide(window.innerWidth >= 1024); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on) }, [])

  useGSAP(() => {
    if (prefersReducedMotion()) return
    const tl = gsap.timeline({ delay: 0.15 })
    tl.from('[data-line] > span', { yPercent: 110, duration: 1.3, stagger: 0.12, ease: 'expo.out' })
      .from('[data-portrait]', { scale: 1.08, opacity: 0, duration: 1.8, ease: 'expo.out' }, 0)
      .fromTo('[data-arch]', { y: 120, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 1.2 }, 0.45)
      .from('[data-fade]', { y: 20, opacity: 0, stagger: 0.08 }, 0.6)
    gsap.to('[data-portrait]', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('[data-arch-img]', { y: -14, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const lines = lang === 'ar'
    ? [{ t: 'بنحاول', c: 'text-emerald' }, { t: 'نحافظ على', c: 'text-charcoal' }, { t: 'سنتك.', c: 'text-charcoal' }]
    : [{ t: 'WE TRY TO', c: 'text-emerald' }, { t: 'SAVE YOUR', c: 'text-charcoal' }, { t: 'TOOTH.', c: 'text-charcoal' }]

  const arches: { img?: string; title?: string; sub: string; stat?: number; suffix?: string; to?: string }[] = [
    { img: '/img/aligner-cut.webp', title: L('Clear Aligners', 'التقويم الشفاف'), sub: L('Straighter, quietly', 'تقويم مش باين'), to: '/services/clear-aligners' },
    { stat: 4, title: '', sub: L('Specialist doctors', 'دكاترة متخصصين') },
    { img: '/img/implant-cut.webp', title: L('Dental Implants', 'زراعة الأسنان'), sub: L('Only when needed', 'بس لما يكون لازم'), to: '/services/dental-implants' },
    { stat: 100, suffix: '%', title: '', sub: L('Plans written first', 'خطط مكتوبة الأول') },
    { img: '/img/tooth-cut.webp', title: L('Root Canal', 'علاج العصب'), sub: L('Keep your own tooth', 'حافظ على سنتك'), to: '/services/root-canal' },
  ]

  return (
    <section ref={root} className="px-2 pt-2 md:px-4 md:pt-4">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#F1F5F2_0%,#E6EEE9_100%)] md:rounded-[2.75rem] lg:min-h-[calc(100svh-2rem)]">
        {wide && !prefersReducedMotion() && (
          <div className="absolute inset-0 -z-10 opacity-60 mix-blend-multiply">
            <Silk lightMode color="#CFE4D9" sheenColor="#FFFFFF" speed={1.6} scale={1.25} noiseIntensity={0.6} rotation={0.4} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-white/70 to-transparent" />

        {/* portrait */}
        <div data-portrait className="pointer-events-none relative mx-auto mt-[19rem] h-[24rem] w-[19rem] sm:mt-[21rem] lg:absolute lg:inset-x-0 lg:top-[7%] lg:mt-0 lg:h-[78%] lg:w-[34rem]">
          <img src="/img/hero-cut.webp" alt="" className="fade-b h-full w-full object-contain object-bottom" />
        </div>

        <div className="absolute inset-x-0 top-0 mx-auto max-w-[88rem] px-5 pt-28 md:px-10 lg:pt-[18vh]">
          <div className="flex items-start justify-between gap-8">
            <h1 className={`${lang === 'ar' ? 'font-ar-display text-[3.4rem] leading-[1.1] md:text-[5.6rem]' : 'font-display text-[3.3rem] leading-[0.95] tracking-[-0.03em] md:text-[5rem] xl:text-[5.4rem]'} font-bold`}>
              {lines.map((l, i) => (
                <span key={i} data-line className="block overflow-hidden pb-1"><span className={`block ${l.c}`}>{l.t}</span></span>
              ))}
            </h1>
            <div className="hidden max-w-[17rem] pt-4 lg:block">
              <div data-fade className="flex flex-wrap gap-2">
                {[L('Microscope endo', 'عصب بالميكروسكوب'), L('Written plans', 'خطط مكتوبة')].map((p) => (
                  <span key={p} className="rounded-full bg-white px-4 py-2 text-xs text-charcoal shadow-sm">{p}</span>
                ))}
              </div>
              <p data-fade className="mt-5 text-[0.82rem] leading-relaxed text-charcoal/60">
                {L('Calm, honest dentistry in Nasr City. We explain before we treat, keep what can be kept, and write your plan before we begin.', 'طب أسنان هادي وصريح في مدينة نصر. بنشرح قبل ما نعالج، بنحافظ على اللي ينفع يتحافظ عليه، وبنكتب خطتك قبل ما نبدأ.')}
              </p>
            </div>
          </div>
          <div data-fade className="mt-8 hidden lg:block">
            <Magnet padding={50} magnetStrength={4}><PillCta to="/services">{L('Explore our treatments', 'اكتشف العلاجات')}</PillCta></Magnet>
          </div>
        </div>

        {/* arch cards */}
        <div className="relative z-10 mx-auto -mt-24 grid max-w-[88rem] grid-cols-2 gap-3 px-3 pb-3 md:px-6 md:pb-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:grid-cols-5 lg:gap-4">
          {arches.map((a, i) => {
            const inner = (
              <div data-arch className={`h-full ${i > 1 ? 'hidden lg:block' : ''}`}><div className="arch relative flex h-full min-h-[11.5rem] flex-col items-center justify-end bg-white px-4 pb-6 pt-16 text-center shadow-[0_20px_40px_-25px_rgba(14,77,60,.4)] transition-transform duration-500 hover:-translate-y-1.5 lg:min-h-[13.5rem]">
                {a.img ? (
                  <img data-arch-img src={a.img} alt="" className="absolute -top-10 h-32 w-auto lg:-top-14 lg:h-40" />
                ) : (
                  <span className="absolute top-12 flex items-center gap-1.5 text-start text-[0.65rem] leading-tight text-stone"><Mark size={16} />{L('Emerald', 'إميرالد')}<br />{L('dental care', 'لطب الأسنان')}</span>
                )}
                {a.stat !== undefined ? (
                  <p className="font-display thin text-6xl text-charcoal" dir="ltr"><CountUp to={a.stat} duration={2} />{a.suffix}</p>
                ) : (
                  <p className="font-display text-xl leading-tight text-charcoal lg:text-2xl">{a.title}</p>
                )}
                <p className="mt-1.5 text-[0.7rem] text-stone">{a.sub}</p>
              </div></div>
            )
            return a.to ? <Link key={i} to={a.to} className="contents">{inner}</Link> : <div key={i} className="contents">{inner}</div>
          })}
        </div>
        <div className="px-3 pb-4 lg:hidden"><PillCta dark to="/book" className="w-full !py-2.5">{L('Book a visit', 'احجز زيارة')}</PillCta></div>
      </div>
    </section>
  )
}
