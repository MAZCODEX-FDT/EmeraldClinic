import { useRef } from 'react'
import ScrollReveal from '@/components/reactbits/ScrollReveal'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP } from '@/lib/gsap'

export function Pillars() {
  const { t, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.from('[data-pillar]', { y: 80, opacity: 0, stagger: 0.15, scrollTrigger: { trigger: '[data-pillars]', start: 'top 80%' } })
    gsap.fromTo('[data-line]', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-pillars]', start: 'top 85%', end: 'bottom 60%', scrub: true } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  // marquee of key messages
  const msgs = lang === 'ar'
    ? ['بنحاول نحافظ على سنتك', 'خطتك مكتوبة قبل ما نبدأ', 'راحتك أولًا']
    : ['We try to save your tooth', 'Your plan, written first', 'Your comfort comes first']

  return (
    <section ref={root} className="relative bg-ivory">
      <div className="overflow-hidden border-b border-deep/10 bg-beige/40 py-5" dir="ltr">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 whitespace-nowrap">
          {[...msgs, ...msgs, ...msgs, ...msgs].map((m, i) => (
            <span key={i} className="font-display flex items-center gap-10 text-xl text-deep/80 md:text-2xl">
              {m}<Mark size={22} />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-28 md:py-40">
        <ScrollReveal key={lang} baseOpacity={0.12} enableBlur blurStrength={6} baseRotation={0} splitBy="words" textClassName="font-display text-3xl leading-[1.2] font-medium text-deep md:text-[3.4rem] md:leading-[1.12]">
          {t.manifesto}
        </ScrollReveal>

        <div data-pillars className="relative mt-24 grid gap-10 md:grid-cols-3 md:gap-8">
          <div data-line className="absolute -top-8 hidden h-px w-full origin-left bg-deep/20 md:block rtl:origin-right" />
          {t.pillars.map((p) => (
            <article data-pillar key={p.k} className="group">
              <p className="font-display text-sm text-emerald">{p.k}</p>
              <h3 className="font-display mt-4 text-2xl font-semibold text-deep">{p.title}</h3>
              <p className="mt-3 leading-relaxed text-charcoal/70">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
