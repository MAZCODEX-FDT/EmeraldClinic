import { ContainerScroll } from '@/components/ui21/ContainerScroll'
import { Mark } from '@/components/brand/Logo'
import { DentalArch } from '@/components/dental/DentalArch'
import { useLang } from '@/lib/i18n'
import { useDB, money } from '@/lib/store'

export function WrittenPlan() {
  const { t, lang, l } = useLang()
  const services = useDB((d) => d.services)
  const row = (id: number) => services.find((s) => s.id === id)!
  const rows = [
    { tooth: 36, s: row(3), visits: lang === 'ar' ? '٢' : '2' },
    { tooth: 36, s: row(4), visits: lang === 'ar' ? '٢' : '2' },
    { tooth: 25, s: row(2), visits: lang === 'ar' ? '١' : '1' },
    { tooth: 0, s: row(1), visits: lang === 'ar' ? '١' : '1' },
  ]
  const total = rows.reduce((a, r) => a + r.s.charges, 0)
  const marked: Record<number, string> = { 36: '#1F7A5C', 25: '#BFE3D3' }

  return (
    <section className="bg-white">
      <ContainerScroll
        title={
          <>
            <p className="eyebrow text-emerald">{t.plan.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.02em] text-deep md:text-6xl">{t.plan.title}</h2>
            <p className="mx-auto mt-6 mb-20 max-w-2xl text-lg leading-relaxed text-charcoal/70">{t.plan.sub}</p>
          </>
        }
      >
        <div className="relative grid min-h-[30rem] gap-8 overflow-hidden p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
          <Mark size={180} tooth="rgba(31,122,92,.06)" smile="rgba(14,77,60,.05)" className="pointer-events-none absolute -top-10 -start-10" />
          <div className="absolute end-0 top-0 size-24 bg-emerald [clip-path:polygon(100%_0,0_0,100%_100%)] rtl:[clip-path:polygon(0_0,100%_0,0_100%)]" />
          <div className="relative flex flex-col">
            <p className="eyebrow text-emerald">{t.plan.sample}</p>
            <p className="font-display mt-2 text-2xl font-semibold text-deep">{t.plan.patient}: {lang === 'ar' ? 'أ. م.' : 'A. M.'}</p>
            <div className="mt-4 flex-1"><DentalArch width={300} className="mx-auto w-full max-w-[260px]" showNumbers={false} fill={(g) => marked[g.fdi] ?? '#FFFFFF'} stroke={(g) => (marked[g.fdi] ? '#0E4D3C' : '#BFE3D3')} /></div>
          </div>
          <div className="relative flex flex-col">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-deep/15 text-start text-xs text-stone">
                <th className="py-3 text-start font-medium">{t.plan.tooth}</th><th className="py-3 text-start font-medium">{t.plan.treatment}</th><th className="py-3 text-start font-medium">{t.plan.visits}</th><th className="py-3 text-end font-medium">EGP</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-deep/5">
                    <td className="py-4 font-display font-semibold text-deep">{r.tooth || '—'}</td>
                    <td className="py-4 text-charcoal">{l(r.s, 'name')}</td>
                    <td className="py-4 text-charcoal/70">{r.visits}</td>
                    <td className="py-4 text-end tabular-nums text-charcoal">{money(r.s.charges, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-deep px-5 py-4 text-ivory">
              <span className="text-sm text-jade">{t.plan.total}</span>
              <span className="font-display text-2xl font-semibold tabular-nums">{money(total, lang)}</span>
            </div>
            <p className="mt-auto pt-6 text-sm text-emerald">✓ {t.plan.approved}</p>
          </div>
        </div>
      </ContainerScroll>
    </section>
  )
}
