import { Link } from 'react-router-dom'
import { ArrowUpRight, RotateCw } from 'lucide-react'
import TiltedCard from '@/components/reactbits/TiltedCard'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import type { Doctor } from '@/lib/store'
import { useDB } from '@/lib/store'
import { SectionHead } from './ServicesBento'

export function DoctorCard({ d }: { d: Doctor }) {
  const { t, pick, lang } = useLang()
  const services = useDB((x) => x.services)
  return (
    <TiltedCard
      containerHeight="27rem" imageHeight="27rem" imageWidth="100%" radius={28}
      rotateAmplitude={9} scaleOnHover={1.03} showTooltip={false} glare={0.35} intro={false} gyroscope={false}
      backContent={
        <div className="flex h-full flex-col justify-between bg-deep p-7 text-ivory">
          <div>
            <p className="eyebrow text-jade">{pick(d.role)}</p>
            <p className="font-display mt-3 text-2xl font-semibold">{pick(d.name)}</p>
            <p className="mt-4 leading-relaxed text-ivory/75">{pick(d.bio)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {d.services.map((id) => services.find((s) => s.id === id)).filter(Boolean).map((s) => (
                <span key={s!.id} className="rounded-full border border-ivory/15 px-3 py-1 text-xs text-jade">{pick(s!.name)}</span>
              ))}
            </div>
          </div>
          <Link to={`/book?doctor=${d.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-between rounded-full bg-ivory px-5 py-3 text-sm font-medium text-deep">
            {t.doctors.book} {pick(d.name).split(' ').slice(0, 2).join(' ')}<ArrowUpRight className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
      }
    >
      <div className="absolute inset-0 flex flex-col justify-between overflow-hidden p-7" style={{ background: `linear-gradient(165deg, ${d.color} 0%, #093629 100%)` }}>
        <Mark size={300} tooth="rgba(191,227,211,.10)" smile="rgba(247,244,238,.08)" className="pointer-events-none absolute -end-20 top-10" />
        <div className="flex items-start justify-between text-ivory">
          <span className="font-display text-xs tracking-[0.3em] text-jade/80">{lang === 'ar' ? `${d.years} ${t.doctors.years}` : `${d.years} ${t.doctors.years.toUpperCase()}`}</span>
          <RotateCw className="size-4 text-jade/60" />
        </div>
        <div className="relative grid flex-1 place-items-center">
          <div className="grid size-36 place-items-center rounded-full border border-ivory/15 bg-ivory/5 backdrop-blur">
            <span className="font-display text-5xl font-light tracking-wider text-ivory">{d.initials}</span>
          </div>
          <span className="absolute bottom-2 text-[0.65rem] tracking-[0.25em] text-ivory/35 uppercase">{t.doctors.placeholder}</span>
        </div>
        <div className="text-ivory">
          <p className="font-display text-2xl font-semibold">{pick(d.name)}</p>
          <p className="mt-1 text-sm text-jade">{pick(d.role)}</p>
        </div>
      </div>
    </TiltedCard>
  )
}

export function Doctors() {
  const { t } = useLang()
  const doctors = useDB((d) => d.doctors)
  return (
    <section className="bg-ivory px-6 py-28 md:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHead eyebrow={t.doctors.eyebrow} title={t.doctors.title}>
          <Link to="/doctors" className="self-start rounded-full border border-deep/15 px-5 py-3 text-sm font-medium text-deep transition-colors hover:bg-deep hover:text-ivory md:self-auto">{t.nav.doctors}</Link>
        </SectionHead>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.filter((d) => d.visible).map((d) => <DoctorCard key={d.id} d={d} />)}
        </div>
      </div>
    </section>
  )
}
