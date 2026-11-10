import { Navigate, useParams } from 'react-router-dom'
import { Printer, Phone, MapPin, Globe } from 'lucide-react'
import { Logo, Mark } from '@/components/brand/Logo'
import { DentalArch } from '@/components/dental/DentalArch'
import { useLang } from '@/lib/i18n'
import { useDB, money, todayISO } from '@/lib/store'
import { auth } from '../auth'
import { useTr, fmtDate } from '../ui'
import { TOOTH_STATES } from './PatientDetail'

/** Branded A4 "written plan" — letterhead per Emerald stationery (ghost-mark corners, emerald corner triangles, footer line). */
export default function PlanPrint() {
  const { id } = useParams()
  const tr = useTr()
  const { lang, pick } = useLang()
  const p = useDB((d) => d.patients).find((x) => x.id === id)
  const services = useDB((d) => d.services)
  const s = useDB((d) => d.settings)
  if (!auth.isIn()) return <Navigate to="/dashboard/login" replace />
  if (!p) return <Navigate to="/dashboard/patients" replace />
  const total = p.plan.reduce((a, i) => a + i.cost, 0)
  const marked = new Set(p.plan.filter((i) => i.status !== 'done').map((i) => i.tooth))
  const st = (fdi: number) => TOOTH_STATES.find((x) => x.k === (p.teeth[fdi] ?? 'healthy'))!

  return (
    <div className="min-h-screen bg-stone/20 py-10 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] justify-end">
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-deep px-5 py-2.5 text-sm font-medium text-ivory"><Printer className="size-4" />{tr('Print / Save PDF', 'اطبع / احفظ PDF')}</button>
      </div>
      <article className="relative mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col overflow-hidden bg-white p-[16mm] shadow-xl print:shadow-none">
        <Mark size={260} tooth="rgba(31,122,92,.05)" smile="rgba(14,77,60,.04)" className="absolute -top-16 -start-16" />
        <Mark size={260} tooth="rgba(31,122,92,.05)" smile="rgba(14,77,60,.04)" className="absolute -end-16 -bottom-16" />
        <div className="absolute end-0 top-0 size-28 bg-emerald [clip-path:polygon(100%_0,0_0,100%_100%)] rtl:[clip-path:polygon(0_0,100%_0,0_100%)]" />
        <div className="absolute start-0 bottom-0 size-16 bg-deep [clip-path:polygon(0_100%,0_0,100%_100%)] rtl:[clip-path:polygon(100%_100%,100%_0,0_100%)]" />

        <header className="relative flex items-start justify-between">
          <Logo size={44} />
          <div className="me-20 text-end text-xs text-stone">
            <p className="eyebrow text-emerald">{tr('Written treatment plan', 'خطة علاج مكتوبة')}</p>
            <p className="mt-1">{fmtDate(todayISO(), lang, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </header>

        <section className="relative mt-12 grid grid-cols-[1fr_auto] gap-8">
          <div>
            <p className="text-xs text-stone">{tr('Prepared for', 'مكتوبة لـ')}</p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-deep">{p.name}</h1>
            <p className="mt-1 text-sm text-stone" dir="ltr">{p.phone}</p>
            <p className="font-display mt-6 max-w-sm text-lg leading-snug text-deep">{tr('Your plan, written first. Take it home and decide calmly.', 'خطتك مكتوبة قبل ما نبدأ. خدها البيت وقرر براحتك.')}</p>
          </div>
          <DentalArch width={260} className="w-[52mm]" showNumbers={false}
            fill={(g) => (marked.has(g.fdi) ? '#1F7A5C' : st(g.fdi).k === 'missing' ? 'transparent' : '#FFFFFF')}
            stroke={(g) => (marked.has(g.fdi) ? '#0E4D3C' : '#BFE3D3')} />
        </section>

        <table className="relative mt-10 w-full text-sm">
          <thead><tr className="border-b-2 border-deep text-xs text-deep">
            <th className="py-2 text-start">#</th><th className="py-2 text-start">{tr('Tooth', 'السنة')}</th><th className="py-2 text-start">{tr('Treatment', 'العلاج')}</th><th className="py-2 text-start">{tr('Visits', 'الزيارات')}</th><th className="py-2 text-end">{tr('Estimate', 'التكلفة')}</th>
          </tr></thead>
          <tbody>
            {p.plan.map((i, n) => {
              const sv = services.find((x) => x.id === i.serviceId)
              return (
                <tr key={i.id} className="border-b border-deep/10">
                  <td className="py-3 text-stone">{n + 1}</td>
                  <td className="font-display py-3 font-semibold text-deep">{i.tooth ?? '—'}</td>
                  <td className="py-3">{sv ? pick(sv.name) : '—'}{i.note && <span className="block text-xs text-stone">{i.note}</span>}</td>
                  <td className="py-3 text-stone">{sv ? pick(sv.sessions) : ''}</td>
                  <td className="py-3 text-end tabular-nums">{money(i.cost, lang)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="relative mt-4 flex items-center justify-between rounded-xl bg-deep px-5 py-4 text-ivory">
          <span className="text-sm text-jade">{tr('Estimated total', 'التكلفة التقديرية')}</span>
          <span className="font-display text-2xl font-semibold tabular-nums">{money(total, lang)}</span>
        </div>
        <p className="relative mt-4 text-xs leading-relaxed text-stone">{tr('Estimates do not change without your agreement. We always try to save your tooth first; alternatives were explained during your visit.', 'التكلفة التقديرية مبتتغيرش غير بموافقتك. دايمًا بنحاول نحافظ على سنتك الأول، والبدائل اتشرحت في زيارتك.')}</p>

        <div className="relative mt-auto grid grid-cols-2 gap-10 pt-16 text-xs text-stone">
          <div className="border-t border-deep/30 pt-2">{tr('Treating doctor', 'الطبيب المعالج')}</div>
          <div className="border-t border-deep/30 pt-2">{tr('Patient signature', 'توقيع المريض')}</div>
        </div>
        <footer className="relative mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-emerald pt-4 text-[0.7rem] text-charcoal/70">
          <span className="flex items-center gap-1.5"><Phone className="size-3 text-emerald" /><span dir="ltr">{s.phone}</span></span>
          <span className="flex items-center gap-1.5"><MapPin className="size-3 text-emerald" />{pick(s.address)}</span>
          <span className="flex items-center gap-1.5"><Globe className="size-3 text-emerald" />{s.email}</span>
        </footer>
      </article>
    </div>
  )
}
