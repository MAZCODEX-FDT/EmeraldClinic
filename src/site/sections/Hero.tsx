import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, Microscope, Armchair } from 'lucide-react'
import Silk from '@/components/reactbits/Silk'
import BlurText from '@/components/reactbits/BlurText'
import ShinyText from '@/components/reactbits/ShinyText'
import Magnet from '@/components/reactbits/Magnet'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

export function Hero() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= 768)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  useGSAP(() => {
    const reduce = prefersReducedMotion()
    const paths = gsap.utils.toArray<SVGPathElement>('[data-draw]')
    paths.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: reduce ? 0 : l }) })
    if (reduce) return
    const tl = gsap.timeline({ delay: 0.2 })
    tl.from('[data-hero-ring]', { scale: 0.6, opacity: 0, duration: 1.6, stagger: 0.12 })
      .to(paths, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', stagger: 0.35 }, 0.3)
      .from('[data-chip]', { y: 24, opacity: 0, stagger: 0.12, duration: 1 }, 1.2)
      .from('[data-hero-fade]', { y: 30, opacity: 0, stagger: 0.1 }, 0.9)
    gsap.to('[data-chip]', { y: '+=10', duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.6 } })
    // Parallax out on scroll
    gsap.to('[data-hero-content]', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('[data-hero-mark]', { yPercent: 14, rotate: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const chips = [
    { icon: <FileText className="size-4" />, label: lang === 'ar' ? 'خطة مكتوبة' : 'Written plan', cls: 'top-[8%] -start-4 md:-start-10' },
    { icon: <Microscope className="size-4" />, label: lang === 'ar' ? 'علاج عصب بالميكروسكوب' : 'Microscope endo', cls: 'top-[46%] -end-6 md:-end-14' },
    { icon: <Armchair className="size-4" />, label: t.hero.badge, cls: 'bottom-[6%] start-[8%]' },
  ]

  return (
    <section ref={root} className="glow-bg grain relative isolate min-h-[100svh] overflow-hidden text-ivory">
      {wide && !prefersReducedMotion() && (
        <div className="absolute inset-0 -z-10 opacity-70">
          <Silk color="#125A47" sheenColor="#BFE3D3" speed={2.4} scale={1.1} noiseIntensity={1.2} rotation={0.2} />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_20%_80%,rgba(9,54,41,.85),transparent_70%)]" />

      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-6 pt-32 pb-24 lg:grid-cols-[1.25fr_1fr]">
        <div data-hero-content>
          <p data-hero-fade className="eyebrow text-jade">{t.hero.eyebrow}</p>
          <h1 className="font-display mt-6 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.02em] sm:text-6xl lg:text-[5.2rem]">
            <BlurText key={lang + 't'} text={t.hero.title} animateBy="words" delay={90} trigger="load" className="justify-start" />
          </h1>
          <div className="font-display mt-3 text-2xl font-light sm:text-3xl lg:text-[2.6rem] lg:leading-tight">
            <ShinyText key={lang + 's'} text={t.hero.titleAccent} color="#BFE3D3" shineColor="#F7F4EE" speed={4} />
          </div>
          <p data-hero-fade className="mt-8 max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">{t.hero.sub}</p>
          <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
            <Magnet padding={60} magnetStrength={3}>
              <Link to="/book" className="group inline-flex items-center gap-3 rounded-full bg-ivory py-4 ps-7 pe-4 font-medium text-deep transition-colors hover:bg-jade">
                {t.hero.cta}
                <span className="grid size-9 place-items-center rounded-full bg-deep text-ivory transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
              </Link>
            </Magnet>
            <Link to="/services" className="rounded-full border border-ivory/25 px-7 py-4 font-medium text-ivory transition-colors hover:border-jade hover:text-jade">{t.hero.cta2}</Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[460px]" data-hero-mark>
          <div data-hero-ring className="absolute inset-0 rounded-full border border-jade/20" />
          <div data-hero-ring className="absolute inset-[9%] rounded-full border border-jade/15 bg-ivory/[0.03] backdrop-blur-[2px]" />
          <div data-hero-ring className="absolute inset-[20%] rounded-full bg-gradient-to-b from-ivory/[0.10] to-ivory/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,.15),0_40px_80px_-30px_rgba(0,0,0,.5)]" />
          <div className="absolute inset-[28%] grid place-items-center">
            <Mark size={220} tooth="#BFE3D3" smile="#F7F4EE" draw className="h-full w-full drop-shadow-[0_0_30px_rgba(191,227,211,.35)]" />
          </div>
          {chips.map((c) => (
            <div key={c.label} data-chip className={`absolute ${c.cls} flex items-center gap-2 rounded-full border border-ivory/15 bg-deeper/60 px-4 py-2.5 text-sm text-ivory shadow-xl backdrop-blur-md`}>
              <span className="grid size-7 place-items-center rounded-full bg-jade text-deep">{c.icon}</span>{c.label}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        <div className="flex flex-col items-center gap-2 text-[0.65rem] tracking-[0.3em] text-jade/70 uppercase">
          {t.hero.scroll}<span className="h-10 w-px animate-pulse bg-gradient-to-b from-jade to-transparent" />
        </div>
      </div>
    </section>
  )
}
