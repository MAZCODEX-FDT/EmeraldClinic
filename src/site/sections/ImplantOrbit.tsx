import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useLang, useL } from '@/lib/i18n'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/** Implant render with concentric rings and orbiting labels (after the implant-technology reference). */
export function ImplantOrbit() {
  const { lang } = useLang()
  const L = useL()
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 65%' } })
    tl.from('[data-ring]', { scale: 0.4, opacity: 0, stagger: 0.12, duration: 1.6, ease: 'expo.out' })
      .from('[data-jaw]', { y: 60, scale: 0.9, opacity: 0, duration: 1.4 }, 0.2)
      .from('[data-label]', { y: 24, opacity: 0, stagger: 0.12, duration: 1 }, 0.6)
    gsap.to('[data-jaw]', { y: -12, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
    gsap.fromTo('[data-ghost]', { xPercent: lang === 'ar' ? -10 : 10 }, { xPercent: lang === 'ar' ? 10 : -10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const labels = [
    { t: L('3D CBCT planning', 'تخطيط بأشعة 3D'), b: L('We measure bone and nerves in 3D before deciding anything.', 'بنقيس العظم والأعصاب 3D قبل أي قرار.'), cls: 'lg:start-[6%] lg:top-[30%]' },
    { t: L('Guided placement', 'زراعة بدليل جراحي'), b: L('A printed surgical guide places the implant exactly as planned.', 'دليل جراحي مطبوع بيحط الزرعة بالظبط زي الخطة.'), cls: 'lg:end-[4%] lg:top-[18%]' },
    { t: L('Healing period', 'فترة الالتئام'), b: L('Written timeline and check-ins while the bone integrates.', 'مدة مكتوبة ومتابعة لحد ما العظم يلتحم.'), cls: 'lg:end-[8%] lg:top-[64%]' },
    { t: L('Crown on implant', 'الكراون على الزرعة'), b: L('A natural-looking crown, tried in before it is fixed.', 'كراون شكله طبيعي، بيتجرب قبل التثبيت.'), cls: 'lg:start-[14%] lg:top-[78%]' },
  ]

  return (
    <section ref={root} className="relative overflow-hidden bg-white px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[88rem]">
        <span className="rounded-full bg-cloud px-3 py-1 text-xs text-stone">{L('Technology', 'التكنولوجيا')}</span>
        <h2 className={`${lang === 'ar' ? 'font-ar-display leading-tight' : 'font-display leading-[1.02] tracking-[-0.02em]'} mt-5 max-w-3xl text-4xl text-charcoal md:text-6xl`}>
          {L('Implants, only when', 'الزراعة، بس لما')} <span className="thin text-emerald">{L('a tooth truly can’t be saved', 'السنة فعلًا مينفعش تتنقذ')}</span>
        </h2>

        <div className="relative mt-10 lg:h-[44rem]">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[46, 34, 22].map((s, i) => (
              <div key={s} data-ring className="absolute rounded-full border border-deep/[0.07]" style={{ width: `${s}rem`, height: `${s}rem`, background: i === 2 ? 'radial-gradient(circle, rgba(191,227,211,.7), rgba(191,227,211,0) 70%)' : undefined }} />
            ))}
          </div>
          <div className="relative mx-auto w-full max-w-[34rem] lg:absolute lg:inset-0 lg:m-auto lg:h-fit"><img data-jaw src="/img/implant-jaw.webp" alt={L('Implant in jaw model', 'زرعة في نموذج فك')} className="w-full rounded-[2rem] [mask-image:radial-gradient(closest-side,#000_70%,transparent)]" /></div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:contents">
            {labels.map((l) => (
              <div data-label key={l.t} className={`max-w-[15rem] lg:absolute ${l.cls}`}>
                <p className="flex items-center gap-2 font-medium text-charcoal"><span className="size-2 rounded-full bg-emerald shadow-[0_0_0_4px_rgba(31,122,92,.15)]" />{l.t}</p>
                <p className="mt-1.5 ps-4 text-xs leading-relaxed text-stone">{l.b}</p>
                <Link to="/services/dental-implants" className="mt-2 inline-flex items-center gap-1 ps-4 text-xs text-charcoal hover:text-emerald">{L('More', 'المزيد')}<Plus className="size-3" /></Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p data-ghost aria-hidden className="font-display thin pointer-events-none mt-6 text-center text-[22vw] leading-none whitespace-nowrap text-deep/[0.05] select-none md:text-[16vw]">{L('IMPLANTS', 'IMPLANTS')}</p>
    </section>
  )
}
