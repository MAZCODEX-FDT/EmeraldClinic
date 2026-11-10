import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { PageHero } from './PageHero'
import { DoctorCard } from '../sections/Doctors'
import { Cta } from '../sections/Cta'

export default function DoctorsPage() {
  const { t, lang } = useLang()
  const doctors = useDB((d) => d.doctors)
  return (
    <>
      <PageHero eyebrow={t.doctors.eyebrow} title={t.doctors.title} sub={lang === 'ar' ? 'دوس على أي كارت علشان تقلبه وتعرف أكتر.' : 'Tap any card to flip it and read more.'} />
      <section className="bg-ivory px-6 pb-28">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.filter((d) => d.visible).map((d) => <DoctorCard key={d.id} d={d} />)}
        </div>
      </section>
      <Cta />
    </>
  )
}
