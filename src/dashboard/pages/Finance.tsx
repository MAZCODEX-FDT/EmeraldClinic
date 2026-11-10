import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLang } from '@/lib/i18n'
import { useDB, money, todayISO, addDays } from '@/lib/store'
import { PageHeader, Card, useTr, fmtDate } from '../ui'

export default function Finance() {
  const tr = useTr()
  const { lang } = useLang()
  const payments = useDB((d) => d.payments)
  const patients = useDB((d) => d.patients)
  const [range, setRange] = useState(30)
  const since = addDays(todayISO(), -range)
  const data = useMemo(() => {
    const list = payments.filter((p) => p.date >= since).sort((a, b) => b.date.localeCompare(a.date))
    const total = list.reduce((s, p) => s + p.amount, 0)
    const byMethod = (['cash', 'card', 'instapay'] as const).map((m) => ({ m, v: list.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0) }))
    const weeks = Array.from({ length: Math.ceil(range / 7) }, (_, i) => {
      const end = addDays(todayISO(), -i * 7), start = addDays(end, -6)
      return { w: fmtDate(start, lang), v: list.filter((p) => p.date >= start && p.date <= end).reduce((s, p) => s + p.amount, 0) }
    }).reverse()
    const outstanding = patients.map((pt) => {
      return { pt, due: pt.plan.filter((i) => i.status !== 'done').reduce((s, i) => s + i.cost, 0) }
    }).filter((x) => x.due > 0 && x.pt.planApproved).sort((a, b) => b.due - a.due)
    return { list, total, byMethod, weeks, outstanding, outTotal: outstanding.reduce((s, x) => s + x.due, 0) }
  }, [payments, patients, since, range, lang])
  const pName = (id: string) => patients.find((p) => p.id === id)?.name ?? '—'

  return (
    <>
      <PageHeader title={tr('Finance', 'الحسابات')} actions={<div className="flex rounded-full bg-white p-1 text-sm shadow-sm">{[7, 30, 90].map((r) => <button key={r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 ${range === r ? 'bg-deep text-ivory' : 'text-stone'}`}>{r}{tr('d', ' يوم')}</button>)}</div>} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <Card className="col-span-2 !bg-deep !border-deep text-ivory"><p className="text-xs text-jade">{tr('Collected', 'المحصّل')}</p><p className="font-display mt-2 text-4xl font-semibold tabular-nums">{money(data.total, lang)}</p></Card>
        {data.byMethod.map((m) => <Card key={m.m}><p className="text-xs uppercase text-stone">{m.m}</p><p className="font-display mt-2 text-2xl font-semibold tabular-nums text-deep">{money(m.v, lang)}</p></Card>)}
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
          <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-deep">{tr('Open value on approved plans', 'قيمة متبقية على خطط موافق عليها')}</h2><span className="text-sm font-medium tabular-nums text-emerald">{money(data.outTotal, lang)}</span></div>
          <ul className="mt-3 divide-y divide-deep/5">
            {data.outstanding.slice(0, 7).map(({ pt, due }) => <li key={pt.id}><Link to={`/dashboard/patients/${pt.id}`} className="flex justify-between py-2.5 text-sm hover:text-emerald"><span>{pt.name}</span><span className="tabular-nums">{money(due, lang)}</span></Link></li>)}
          </ul>
        </Card>
      </div>
      <Card className="mt-4 !p-0 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Date', 'التاريخ'), tr('Patient', 'المريض'), tr('For', 'مقابل'), tr('Method', 'الطريقة'), tr('Amount', 'المبلغ')].map((h, i) => <th key={h} className={`px-4 py-3 font-medium ${i === 4 ? 'text-end' : 'text-start'}`}>{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-deep/5">
            {data.list.slice(0, 40).map((p) => (
              <tr key={p.id}><td className="px-4 py-3">{fmtDate(p.date, lang)}</td><td className="px-4 py-3"><Link to={`/dashboard/patients/${p.patientId}`} className="text-deep hover:text-emerald">{pName(p.patientId)}</Link></td><td className="px-4 py-3 text-stone">{p.note}</td><td className="px-4 py-3 text-xs uppercase text-stone">{p.method}</td><td className="px-4 py-3 text-end tabular-nums">{money(p.amount, lang)}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
