import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarCheck, Inbox, Wallet, Armchair, ArrowUpRight, FileClock } from 'lucide-react'
import CountUp from '@/components/reactbits/CountUp'
import { useLang } from '@/lib/i18n'
import { useDB, todayISO, addDays, money, loc, doctorName } from '@/lib/store'
import { startOf, endOf } from './Appointments'
import { optionTotal } from '../plans'
import { PageHeader, Card, ApptBadge, ReqBadge, useTr, fmtDate } from '../ui'

export default function Overview() {
  const tr = useTr()
  const { lang } = useLang()
  const appts = useDB((d) => d.appointments)
  const patients = useDB((d) => d.patients)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const enquiries = useDB((d) => d.enquiries)
  const invoices = useDB((d) => d.invoices)
  const plans = useDB((d) => d.plans)
  const resources = useDB((d) => d.resources)
  const today = todayISO()

  const data = useMemo(() => {
    const live = (s: string) => !['cancelled', 'cancelled_by_doctor', 'rescheduled'].includes(s)
    const todays = appts.filter((a) => a.date === today && live(a.status)).sort((a, b) => startOf(a) - startOf(b))
    const payments = invoices.flatMap((i) => i.payments.map((p) => ({ ...p, inv: i })))
    const monthStart = today.slice(0, 8) + '01'
    const revenue = payments.filter((p) => p.paid_at >= monthStart).reduce((s, p) => s + p.amount, 0)
    const chairMinutes = todays.reduce((s, a) => s + (endOf(a) - startOf(a)), 0)
    const occupancy = Math.min(100, Math.round((chairMinutes / (Math.max(1, resources.length) * 600)) * 100))
    const visits = Array.from({ length: 14 }, (_, i) => {
      const d = addDays(today, i - 13)
      return { d: fmtDate(d, lang), v: appts.filter((a) => a.date === d && a.status === 'completed').length }
    })
    const since = addDays(today, -30)
    const bySvc = new Map<string, number>()
    for (const p of payments.filter((x) => x.paid_at >= since)) {
      const appt = appts.find((a) => a.id === p.inv.appointment_id)
      const s = services.find((x) => x.id === appt?.service_ids[0])
      const n = s ? loc(s, 'name', lang) : p.inv.lines[0]?.description ?? '—'
      bySvc.set(n, (bySvc.get(n) ?? 0) + p.amount)
    }
    const byService = [...bySvc].map(([n, v]) => ({ n, v })).sort((a, b) => b.v - a.v).slice(0, 6)
    const pendingPlans = plans.filter((x) => x.status === 'draft' || x.status === 'quoted')
    return { todays, revenue, occupancy, visits, byService, pendingPlans }
  }, [appts, invoices, services, plans, resources, today, lang])

  const newReq = enquiries.filter((r) => r.status === 'new')
  const pName = (id: number) => patients.find((p) => p.id === id)?.name ?? '—'
  const sName = (id: number | null) => { const s = services.find((x) => x.id === id); return s ? loc(s, 'name', lang) : '—' }
  const doc = (id: number) => doctors.find((d) => d.id === id)
  const chairName = (id: number | null) => { const r = resources.find((x) => x.id === id); return r ? loc(r, 'name', lang) : '' }

  const kpis = [
    { icon: CalendarCheck, label: tr("Today's visits", 'زيارات النهارده'), v: data.todays.length, s: '' },
    { icon: Inbox, label: tr('New leads', 'عملاء جدد'), v: newReq.length, s: '' },
    { icon: Armchair, label: tr('Chair occupancy', 'إشغال الكراسي'), v: data.occupancy, s: '%' },
    { icon: Wallet, label: tr('Collected this month', 'المحصّل الشهر ده'), v: Math.round(data.revenue / 1000), s: 'K' },
  ]
  const hour = new Date().getHours()

  return (
    <>
      <PageHeader
        title={hour < 17 ? tr('Good afternoon, Dr. Youssef', 'مساء النور يا دكتور يوسف') : tr('Good evening, Dr. Youssef', 'مساء الخير يا دكتور يوسف')}
        sub={tr('Here is how the clinic looks today.', 'دي صورة العيادة النهارده.')}
        actions={<Link to="/dashboard/appointments" className="inline-flex items-center gap-2 rounded-full bg-deep px-4 py-2.5 text-sm font-medium text-ivory hover:bg-emerald">{tr('Open schedule', 'افتح الجدول')}<ArrowUpRight className="size-4 rtl:-scale-x-100" /></Link>}
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Card key={i} className={i === 0 ? '!bg-deep !border-deep text-ivory' : ''}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${i === 0 ? 'text-jade' : 'text-stone'}`}>{k.label}</span>
              <k.icon className={`size-4 ${i === 0 ? 'text-jade' : 'text-emerald'}`} />
            </div>
            <p className={`font-display mt-4 text-4xl font-semibold ${i === 0 ? 'text-ivory' : 'text-deep'}`}><span dir="ltr" className="inline-flex"><CountUp to={k.v} duration={1.6} />{k.s}</span></p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-deep">{tr('Completed visits · last 14 days', 'الزيارات المكتملة · آخر ١٤ يوم')}</h2>
          </div>
          <div className="mt-4 h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.visits} margin={{ left: -20, right: 8, top: 8 }}>
                <defs><linearGradient id="g1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1F7A5C" stopOpacity={0.35} /><stop offset="100%" stopColor="#1F7A5C" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#0E4D3C" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#8C8F8D' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#8C8F8D' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(14,77,60,.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="v" name={tr('Visits', 'زيارات')} stroke="#0E4D3C" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold text-deep">{tr('Collected by treatment · 30 days', 'المحصّل حسب العلاج · ٣٠ يوم')}</h2>
          <div className="mt-4 h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byService} layout="vertical" margin={{ left: 10, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="n" width={120} tick={{ fontSize: 11, fill: '#2B2F2E' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => money(Number(v), lang)} contentStyle={{ borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgba(191,227,211,.3)' }} />
                <Bar dataKey="v" fill="#1F7A5C" radius={[0, 8, 8, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-deep">{tr("Today's schedule", 'جدول النهارده')}</h2>
            <Link to="/dashboard/appointments" className="text-xs text-emerald hover:text-deep">{tr('All', 'الكل')} →</Link>
          </div>
          <ul className="mt-4 divide-y divide-deep/5">
            {data.todays.map((a) => {
              const d = doc(a.doctor_id)
              return (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <span className="font-display w-20 text-sm font-semibold text-deep tabular-nums" dir="ltr">{a.from_time} <span className="text-[0.65rem] font-normal text-stone">{a.from_time_type}</span></span>
                  <span className="h-9 w-1 rounded-full" style={{ background: d?.color }} />
                  <div className="min-w-0 flex-1">
                    <Link to={`/dashboard/patients/${a.patient_id}`} className="block truncate text-sm font-medium text-charcoal hover:text-emerald">{pName(a.patient_id)}</Link>
                    <p className="truncate text-xs text-stone">{a.service_ids.map(sName).join(' + ')} · {d ? doctorName(d, lang) : ''} · {chairName(a.resource_id)}</p>
                  </div>
                  <ApptBadge s={a.status} />
                </li>
              )
            })}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-deep">{tr('New leads', 'عملاء محتملين جدد')}</h2>
              <Link to="/dashboard/leads" className="text-xs text-emerald hover:text-deep">{tr('Inbox', 'الوارد')} →</Link>
            </div>
            <ul className="mt-3 space-y-2">
              {newReq.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-ivory px-3 py-2.5">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-charcoal">{r.name}</p><p className="truncate text-xs text-stone">{r.service_id ? sName(r.service_id) : r.subject} · {r.form_name}</p></div>
                  <ReqBadge s={r.status} />
                </li>
              ))}
              {newReq.length === 0 && <li className="py-4 text-center text-sm text-stone">{tr('All caught up.', 'مفيش طلبات جديدة.')}</li>}
            </ul>
          </Card>
          <Card>
            <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-deep"><FileClock className="size-4 text-emerald" />{tr('Plans awaiting approval', 'خطط مستنية موافقة')}</h2>
            <ul className="mt-3 space-y-2">
              {data.pendingPlans.slice(0, 5).map((x) => (
                <li key={x.id}><Link to={`/dashboard/patients/${x.patient_id}`} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-ivory">
                  <span className="text-charcoal">{pName(x.patient_id)} <span className="text-xs text-stone">{x.reference}</span></span>
                  <span className="text-xs tabular-nums text-stone">{money(optionTotal(x), lang)}</span>
                </Link></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
