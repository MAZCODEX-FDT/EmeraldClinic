import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLang } from '@/lib/i18n'
import { useDB, money, todayISO, addDays, PAYMENT_METHODS } from '@/lib/store'
import { PageHeader, Card, useTr, fmtDate, methodLabel } from '../ui'
import { invoiceTotal, invoicePaid } from './PatientDetail'

export default function Finance() {
  const tr = useTr()
  const { lang } = useLang()
  const invoices = useDB((d) => d.invoices)
  const patients = useDB((d) => d.patients)
  const [range, setRange] = useState(30)
  const since = addDays(todayISO(), -range)
  const data = useMemo(() => {
    const all = invoices.flatMap((inv) => inv.payments.map((p) => ({ ...p, key: `${inv.id}-${p.id}`, patient_id: inv.patient_id, number: inv.number, note: inv.lines.map((l) => l.description).join(' + ') })))
    const list = all.filter((p) => p.paid_at >= since).sort((a, b) => b.paid_at.localeCompare(a.paid_at))
    const total = list.reduce((s, p) => s + p.amount, 0)
    const byMethod = PAYMENT_METHODS.map((m) => ({ m, v: list.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0) }))
    const weeks = Array.from({ length: Math.ceil(range / 7) }, (_, i) => {
      const end = addDays(todayISO(), -i * 7), start = addDays(end, -6)
      return { w: fmtDate(start, lang), v: list.filter((p) => p.paid_at >= start && p.paid_at <= end).reduce((s, p) => s + p.amount, 0) }
    }).reverse()
    const outstanding = invoices.map((inv) => ({ inv, due: invoiceTotal(inv) - invoicePaid(inv) })).filter((x) => x.due > 0).sort((a, b) => b.due - a.due)
    return { list, total, byMethod, weeks, outstanding, outTotal: outstanding.reduce((s, x) => s + x.due, 0) }
  }, [invoices, since, range, lang])
  const pName = (id: number) => patients.find((p) => p.id === id)?.name ?? '—'

  return (
    <>
      <PageHeader title={tr('Finance', 'الحسابات')} actions={<div className="flex rounded-full bg-white p-1 text-sm shadow-sm">{[7, 30, 90].map((r) => <button key={r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 ${range === r ? 'bg-deep text-ivory' : 'text-stone'}`}>{r}{tr('d', ' يوم')}</button>)}</div>} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
        <Card className="col-span-2 !bg-deep !border-deep text-ivory"><p className="text-xs text-jade">{tr('Collected', 'المحصّل')}</p><p className="font-display mt-2 text-4xl font-semibold tabular-nums">{money(data.total, lang)}</p></Card>
        {data.byMethod.map((m) => <Card key={m.m}><p className="text-xs text-stone">{methodLabel(m.m, lang === 'ar')}</p><p className="font-display mt-2 text-xl font-semibold tabular-nums text-deep">{money(m.v, lang)}</p></Card>)}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <h2 className="font-display text-lg font-semibold text-deep">{tr('Weekly collections', 'التحصيل الأسبوعي')}</h2>
          <div className="mt-4 h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeks} margin={{ left: -10 }}>
                <CartesianGrid stroke="#0E4D3C" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="w" tick={{ fontSize: 11, fill: '#8C8F8D' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8C8F8D' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                <Tooltip formatter={(v) => money(Number(v), lang)} contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgba(191,227,211,.3)' }} />
                <Bar dataKey="v" fill="#0E4D3C" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-deep">{tr('Unpaid invoices', 'فواتير غير مدفوعة')}</h2><span className="text-sm font-medium tabular-nums text-emerald">{money(data.outTotal, lang)}</span></div>
          <ul className="mt-3 divide-y divide-deep/5">
            {data.outstanding.slice(0, 7).map(({ inv, due }) => <li key={inv.id}><Link to={`/dashboard/patients/${inv.patient_id}`} className="flex justify-between py-2.5 text-sm hover:text-emerald"><span>{pName(inv.patient_id)} <span className="text-xs text-stone">{inv.number}</span></span><span className="tabular-nums">{money(due, lang)}</span></Link></li>)}
            {data.outstanding.length === 0 && <li className="py-6 text-center text-sm text-stone">{tr('Everything is paid.', 'كله مدفوع.')}</li>}
          </ul>
        </Card>
      </div>
      <Card className="mt-4 !p-0 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Date', 'التاريخ'), tr('Patient', 'المريض'), tr('For', 'مقابل'), tr('Method', 'الطريقة'), tr('Amount', 'المبلغ')].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i === 4 ? 'text-end' : 'text-start'}`}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-deep/5">
            {data.list.slice(0, 40).map((p) => (
              <tr key={p.key}><td className="px-4 py-3">{fmtDate(p.paid_at, lang)}</td><td className="px-4 py-3"><Link to={`/dashboard/patients/${p.patient_id}`} className="text-deep hover:text-emerald">{pName(p.patient_id)}</Link></td><td className="px-4 py-3 text-stone">{p.number} · {p.note}</td><td className="px-4 py-3 text-xs text-stone">{methodLabel(p.method, lang === 'ar')}</td><td className="px-4 py-3 text-end tabular-nums">{money(p.amount, lang)}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
