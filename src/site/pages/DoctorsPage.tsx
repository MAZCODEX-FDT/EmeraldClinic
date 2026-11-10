import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { PageHero } from './PageHero'
import { DoctorPhotoCard, Specialists } from '../sections/Specialists'
import { Cta } from '../sections/Cta'

export default function DoctorsPage() {
  const { t, lang } = useLang()
  const doctors = useDB((d) => d.doctors)
  return (
    <>
      <PageHero image="/img/dr-nour-cut.webp" eyebrow={t.doctors.eyebrow} title={t.doctors.title} sub={lang === 'ar' ? 'دوس على أي دكتور علشان تحجز معاه.' : 'Tap a doctor to book a visit with them.'} />
      <section className="bg-[#FBFBFA] px-6 pb-28">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {doctors.filter((d) => d.show_on_website).map((d) => <DoctorPhotoCard key={d.id} d={d} />)}
        </div>
      </section>
      <Specialists compact />
      <Cta />
    </>
  )
}
