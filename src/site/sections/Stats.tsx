import CountUp from '@/components/reactbits/CountUp'
import { useLang } from '@/lib/i18n'

export function Stats() {
  const { t, lang } = useLang()
  return (
    <section className="bg-ivory px-6 pb-28">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-deep/10 bg-deep/10 md:grid-cols-4">
        {t.stats.map((s, i) => (
          <div key={i} className="bg-ivory p-8 md:p-10">
            <p className="font-display text-5xl font-semibold text-deep md:text-6xl">
              <span dir="ltr" className="inline-flex"><CountUp key={lang} to={s.v} duration={2.2} />{s.s}</span>
            </p>
            <p className="mt-3 max-w-[14rem] text-sm leading-relaxed text-charcoal/65">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
