import { useRef } from 'react'
import CountUp from '@/components/reactbits/CountUp'
import { useLang, useL } from '@/lib/i18n'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/** Giant mixed-weight statement with a floating 3D tooth (after the "Advanced clear aligner" reference). */
export function Statement() {
  const { lang } = useLang()
  const L = useL()
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo('[data-tooth3d]', { yPercent: 18, rotate: -8, scale: 0.9 }, { yPercent: -12, rotate: 6, scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } })
    gsap.from('[data-st] > span', { yPercent: 110, stagger: 0.1, duration: 1.2, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    gsap.fromTo('[data-st-left]', { x: lang === 'ar' ? 60 : -60 }, { x: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } })
    gsap.fromTo('[data-st-right]', { x: lang === 'ar' ? -60 : 60 }, { x: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } })
    gsap.from('[data-mini]', { y: 30, opacity: 0, stagger: 0.15, scrollTrigger: { trigger: root.current, start: 'top 60%' } })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const ar = lang === 'ar'
  const big = ar ? 'font-ar-display text-[2.6rem] leading-[1.15] md:text-7xl' : 'font-display text-[2.7rem] leading-[0.95] tracking-[-0.03em] md:text-[5.6rem]'

  return (
    <section ref={root} className="relative overflow-hidden bg-white px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex items-start justify-between text-xs text-charcoal/60">
          <p className="max-w-[14rem]">{L('Dentistry built on diagnosis first, treatment second.', 'طب أسنان بيبدأ بالتشخيص، وبعدين العلاج.')}</p>
          <p className="hidden max-w-[14rem] text-end md:block">{L('A calm approach that keeps more of your natural teeth.', 'طريقة هادية بتحافظ على أكبر قدر من سنانك الطبيعية.')}</p>
        </div>

        <div className="relative mt-16 min-h-[30rem] md:min-h-[36rem]">
          <img data-tooth3d src="/img/tooth-cut.webp" alt="" className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[22rem] w-auto -translate-x-1/2 -translate-y-1/2 md:h-[36rem]" />

          <h2 data-st-left className={`${big} relative z-10 max-w-[60rem]`}>
            <span data-st className="block overflow-hidden"><span className="block thin text-emerald">{L('WE SAVE', 'بنحافظ على')}</span></span>
            <span data-st className="block overflow-hidden"><span className="block font-semibold text-charcoal">{L('NATURAL TEETH', 'سنانك الطبيعية')}</span></span>
          </h2>
          <h2 data-st-right className={`${big} relative z-10 mt-24 text-end md:mt-40`}>
            <span data-st className="block overflow-hidden"><span className="block thin text-emerald">{L('BEFORE', 'قبل')}</span></span>
            <span data-st className="block overflow-hidden"><span className="block font-semibold text-charcoal">{L('ANYTHING ELSE +', 'أي حاجة تانية +')}</span></span>
          </h2>

          <div className="absolute start-0 top-[42%] z-10 hidden space-y-6 md:block">
            {[
              { v: 100, s: '%', l: L('Plans written first', 'خطط مكتوبة الأول'), img: '/img/plan.webp' },
              { v: 3, s: '', l: L('Calm treatment chairs', 'كراسي علاج هادية'), img: '/img/crown.webp' },
            ].map((m) => (
              <div data-mini key={m.l}>
                <p className="font-display text-3xl font-semibold text-deep" dir="ltr"><CountUp to={m.v} duration={2} />{m.s}</p>
                <p className="text-[0.7rem] text-stone">{m.l}</p>
                <img src={m.img} alt="" className="mt-2 h-10 w-24 rounded-full object-cover" />
              </div>
            ))}
          </div>
          <p className="absolute bottom-0 start-0 z-10 hidden max-w-[16rem] text-xs leading-relaxed text-charcoal/60 md:block">
            {L('Microscope-guided root canals, minimal fillings and honest second opinions — extraction is always the last option.', 'علاج عصب بالميكروسكوب، حشو بأقل حفر، ورأي تاني صريح — الخلع دايمًا آخر اختيار.')}
          </p>
          <p className="eyebrow absolute bottom-0 end-0 z-10 text-emerald">{L('Restorative dentistry', 'طب الأسنان الترميمي')}</p>
        </div>
      </div>
    </section>
  )
}
