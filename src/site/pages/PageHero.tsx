import type { ReactNode } from 'react'
import BlurText from '@/components/reactbits/BlurText'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'

export function PageHero({ eyebrow, title, sub, children, image }: { eyebrow: string; title: string; sub?: string; children?: ReactNode; image?: string }) {
  const { lang } = useLang()
  return (
    <section className="bg-[#FBFBFA] px-2 pt-2 pb-10 md:px-4 md:pt-4 md:pb-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#F1F5F2_0%,#E6EEE9_100%)] px-6 pt-36 pb-14 md:rounded-[2.75rem] md:px-10 md:pt-44 md:pb-20">
        {image ? (
          <div className="arch pointer-events-none absolute end-[5%] bottom-[7%] hidden h-[78%] w-[22rem] items-end justify-center overflow-hidden bg-white shadow-[0_30px_60px_-30px_rgba(14,77,60,.35)] lg:flex"><img src={image} alt="" className={image.includes('-cut') ? 'fade-b h-[88%] w-full object-contain object-bottom' : 'h-full w-full object-cover'} /></div>
        ) : (
          <Mark size={420} tooth="rgba(31,122,92,.06)" smile="rgba(14,77,60,.05)" className="pointer-events-none absolute -end-20 -bottom-24" />
        )}
        <div className="relative mx-auto max-w-[88rem]">
          <p className="eyebrow text-emerald">{eyebrow}</p>
          <h1 className={`${lang === 'ar' ? 'font-ar-display leading-[1.15]' : 'font-display leading-[1] tracking-[-0.03em]'} thin mt-5 max-w-4xl text-5xl text-charcoal md:text-7xl`}>
            <BlurText key={lang + title} text={title} animateBy="words" delay={70} trigger="load" className="justify-start" />
          </h1>
          {sub && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/65">{sub}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}
