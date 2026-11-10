import { useRef, useState } from 'react'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap'

const IMAGES = ['/img/consult.webp', '/img/scan.webp', '/img/plan.webp', '/img/interior.webp', '/img/crown.webp']

/** Pinned step-by-step journey (after the "Our Journey · Step 04" reference). */
export function JourneySteps() {
  const { t, lang } = useLang()
  const steps = t.journey.steps
  const [active, setActive] = useState(0)
  const root = useRef<HTMLElement>(null)
  const pad = (n: number) => (lang === 'ar' ? `٠${'٠١٢٣٤٥٦٧٨٩'[n]}` : `0${n}`)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      ScrollTrigger.create({
        trigger: root.current, start: 'top top', end: () => '+=' + window.innerHeight * steps.length * 0.8, pin: true, scrub: true, anticipatePin: 1,
        onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
      })
    })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  useGSAP(() => {
    gsap.fromTo('[data-jimg]', { clipPath: 'inset(12% 12% 12% 12% round 2rem)', scale: 1.08 }, { clipPath: 'inset(0% 0% 0% 0% round 2rem)', scale: 1, duration: 1, ease: 'expo.out' })
    gsap.fromTo('[data-jdesc]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.1 })
    gsap.fromTo('[data-jnum]', { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7 })
  }, { scope: root, dependencies: [active] })

  return (
    <section id="journey" ref={root} className="relative overflow-hidden bg-white px-5 py-24 md:px-10 lg:flex lg:h-screen lg:items-center lg:py-0">
      <div className="mx-auto grid w-full max-w-[88rem] gap-10 lg:grid-cols-[1fr_1.1fr_0.6fr] lg:items-center">
        <div>
          <h2 className={lang === 'ar' ? 'font-ar-display text-4xl text-charcoal md:text-5xl' : 'font-display text-4xl tracking-[-0.02em] text-charcoal md:text-5xl'}>{lang === 'ar' ? 'رحلتك' : 'Your Journey'}</h2>
          <div className="mt-16 hidden items-center gap-10 lg:flex">
            <p className="eyebrow text-stone">{lang === 'ar' ? 'المراحل' : 'Stages'}</p>
            <div className="flex-1 text-end">
              {steps.map((_, i) => i < active && <p key={i} className="text-xs leading-6 text-stone/70">{lang === 'ar' ? 'خطوة' : 'Step'} {pad(i + 1)}</p>)}
              <p data-jnum className={`${lang === 'ar' ? 'font-ar-display' : 'font-display'} my-2 text-6xl text-charcoal xl:text-7xl`}>{lang === 'ar' ? 'خطوة' : 'Step'} {pad(active + 1)}</p>
              {steps.map((_, i) => i > active && <p key={i} className="text-xs leading-6 text-stone/70">{lang === 'ar' ? 'خطوة' : 'Step'} {pad(i + 1)}</p>)}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <p className="eyebrow mb-4 text-stone">{lang === 'ar' ? 'المرحلة' : 'Process'}</p>
          <h3 className="font-display mb-6 text-xl font-medium text-charcoal">{steps[active].t}</h3>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-cloud">
            <img data-jimg key={active} src={IMAGES[active]} alt="" className="h-full w-full object-cover" />
          </div>
          <p data-jdesc key={'d' + active} className="mt-6 max-w-md text-sm leading-relaxed text-charcoal/70">{steps[active].b}</p>
        </div>

        <ul className="hidden self-start text-end lg:block">
          {steps.map((s, i) => (
            <li key={i} className={`text-sm leading-7 transition-colors duration-500 ${i === active ? 'font-medium text-emerald' : 'text-stone'}`}>{s.t}</li>
          ))}
        </ul>

        {/* mobile / tablet: stacked */}
        <div className="space-y-10 lg:hidden">
          {steps.map((s, i) => (
            <article key={i}>
              <p className="font-display text-sm text-emerald">{lang === 'ar' ? 'خطوة' : 'Step'} {pad(i + 1)}</p>
              <h3 className="font-display mt-1 text-2xl font-medium text-charcoal">{s.t}</h3>
              <img src={IMAGES[i]} alt="" loading="lazy" className="mt-4 aspect-[4/3] w-full rounded-[1.5rem] object-cover" />
              <p className="mt-4 text-sm leading-relaxed text-charcoal/70">{s.b}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
