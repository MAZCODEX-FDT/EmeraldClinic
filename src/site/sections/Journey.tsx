import { useRef } from 'react'
import { MessageCircleHeart, ScanLine, FileSignature, HeartHandshake, PhoneCall } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsap'

const icons = [MessageCircleHeart, ScanLine, FileSignature, HeartHandshake, PhoneCall]

export function Journey() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!
      const dist = () => el.scrollWidth - window.innerWidth + 96
      const sign = lang === 'ar' ? 1 : -1
      const tween = gsap.to(el, {
        x: () => sign * dist(), ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      })
      gsap.to('[data-progress]', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => '+=' + dist(), scrub: true } })
      gsap.utils.toArray<HTMLElement>('[data-step]').forEach((card) => {
        gsap.from(card.querySelector('[data-step-num]'), { yPercent: 60, opacity: 0, scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%', toggleActions: 'play none none reverse' } })
      })
      return () => ScrollTrigger.refresh()
    })
    mm.add('(max-width: 1023px)', () => {
      gsap.from('[data-step]', { y: 50, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: track.current, start: 'top 80%' } })
    })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  return (
    <section id="journey" ref={root} className="glow-bg grain relative overflow-hidden text-ivory lg:h-screen">
      <div className="flex h-full flex-col justify-center py-24 lg:py-0">
        <div className="mx-auto w-full max-w-7xl px-6">
          <p className="eyebrow text-jade">{t.journey.eyebrow}</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.02em] md:text-6xl">{t.journey.title}</h2>
          <div className="mt-8 hidden h-px w-full bg-ivory/10 lg:block"><div data-progress className="h-full origin-left scale-x-0 bg-jade rtl:origin-right" /></div>
        </div>
        <div ref={track} className="mt-12 flex flex-col gap-5 px-6 lg:w-max lg:flex-row lg:gap-6 lg:ps-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {t.journey.steps.map((s, i) => {
            const Icon = icons[i]
            return (
              <article data-step key={i} className="relative flex min-h-[18rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ivory/[0.04] p-8 backdrop-blur-sm lg:h-[24rem] lg:w-[24rem]">
                <div className="flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl bg-jade text-deep"><Icon className="size-6" /></span>
                  <span data-step-num className="font-display text-7xl font-bold text-ivory/10">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-display text-3xl font-semibold">{s.t}</h3>
                  <p className="mt-3 leading-relaxed text-ivory/70">{s.b}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
