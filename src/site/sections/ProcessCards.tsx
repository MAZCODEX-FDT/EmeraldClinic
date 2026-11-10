import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useLang, useL } from '@/lib/i18n'
import { gsap, useGSAP } from '@/lib/gsap'

/** 2×2 technology cards with large renders (after the DENTAX reference). */
export function ProcessCards() {
  const { lang } = useLang()
  const L = useL()
  const root = useRef<HTMLElement>(null)
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('[data-pcard]').forEach((c, i) => {
      gsap.from(c, { y: 80, opacity: 0, duration: 1.2, delay: (i % 2) * 0.12, scrollTrigger: { trigger: c, start: 'top 88%' } })
      gsap.fromTo(c.querySelector('img'), { scale: 1.15, yPercent: 6 }, { scale: 1, yPercent: -4, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  }, { scope: root, dependencies: [lang], revertOnUpdate: true })

  const cards = [
    { img: '/img/scan.webp', t: L('Digital Scan', 'Scan ديجيتال'), b: L('High-resolution intraoral scanning captures teeth, bite and gum line — no messy impressions.', 'Scan عالي الدقة للسنان والـbite واللثة — من غير طبعات مزعجة.'), to: '/treatments/checkup-cleaning' },
    { img: '/img/plan.webp', t: L('Written Plan', 'خطة مكتوبة'), b: L('Every tooth, step, visit and cost is mapped and handed to you before treatment begins.', 'كل سنة وخطوة وزيارة وتكلفة مكتوبة في إيدك قبل ما العلاج يبدأ.'), to: '/book' },
    { img: '/img/crown.webp', t: L('Precision Restorations', 'تركيبات دقيقة'), b: L('Zirconia and E-max crowns designed digitally and tried in before anything is final.', 'كراون زيركون وE-max متصممة ديجيتال وبتتجرب قبل أي تثبيت.'), to: '/treatments/crowns-bridges' },
    { img: '/img/implant-jaw.webp', t: L('Guided Implants', 'زراعة بدليل جراحي'), b: L('3D-planned, guided placement — only when saving the natural tooth is truly not possible.', 'تخطيط 3D وزراعة بدليل — بس لما الحفاظ على السنة يبقى مش ممكن فعلًا.'), to: '/treatments/dental-implants' },
  ]

  return (
    <section ref={root} className="bg-white px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className={lang === 'ar' ? 'font-ar-display text-5xl leading-tight text-charcoal md:text-6xl' : 'font-display text-5xl leading-[0.95] tracking-[-0.02em] text-charcoal md:text-6xl'}>
            <span className="thin block">{L('Technology that', 'تكنولوجيا')}</span><span className="block font-semibold">{L('explains itself', 'بتشرح نفسها')}</span>
          </h2>
          <p className="max-w-sm text-sm text-charcoal/60">{L('You see what we see. Every scan and plan is on screen with you before we touch a tooth.', 'هتشوف اللي إحنا شايفينه. كل Scan وكل خطة قدامك على الشاشة قبل ما نلمس أي سنة.')}</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {cards.map((c) => (
            <Link data-pcard key={c.t} to={c.to} className="group relative block h-[30rem] overflow-hidden rounded-[2rem] bg-cloud md:h-[38rem]">
              <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/10 to-transparent" />
              <div className="relative max-w-[17rem] p-8 md:p-10">
                <h3 className="font-display text-2xl font-medium text-charcoal">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{c.b}</p>
                <span className="mt-8 grid size-14 place-items-center rounded-full bg-white text-emerald shadow-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-deep group-hover:text-ivory"><ArrowUpRight className="size-5 rtl:-scale-x-100" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
