import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, nextId, todayISO, money } from '@/lib/store'
import { egyptE164 } from '@/lib/mazmed/time'
import { optionTotal, isOpen } from '../plans'
import { startOf } from './Appointments'
import { PageHeader, Btn, Card, Modal, Field, inputCls, useTr, fmtDate } from '../ui'

export default function Patients() {
  const tr = useTr()
  const { lang } = useLang()
  const nav = useNavigate()
  const patients = useDB((d) => d.patients)
  const appts = useDB((d) => d.appointments)
  const plans = useDB((d) => d.plans)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [adding, setAdding] = useState(false)
  const [np, setNp] = useState({ name: '', phone: '', email: '', gender: 2 as 1 | 2, dob: '' })

  const rows = useMemo(() => patients.map((p) => {
    const mine = appts.filter((a) => a.patient_id === p.id)
    const last = mine.filter((a) => a.status === 'completed').sort((a, b) => b.date.localeCompare(a.date))[0]
    const next = mine.filter((a) => a.date >= todayISO() && ['booked', 'checked_in'].includes(a.status)).sort((a, b) => a.date.localeCompare(b.date) || startOf(a) - startOf(b))[0]
    const open = plans.filter((x) => x.patient_id === p.id && isOpen(x))
    const planTotal = open.reduce((t, x) => t + optionTotal(x, true), 0)
    const pending = open.some((x) => x.status === 'draft' || x.status === 'quoted')
    return { p, last, next, planTotal, open: open.length, pending }
  }).filter(({ p, open, pending }) => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q) || p.patient_unique_id.toLowerCase().includes(q.toLowerCase())) && (filter === 'all' || (filter === 'pending' ? pending : open > 0))), [patients, appts, plans, q, filter])

  const e164 = egyptE164(np.phone)
  const dupe = e164 ? patients.find((p) => p.phone_e164 === e164) : undefined
  const add = () => {
    if (!e164) return
    if (dupe) { setAdding(false); nav(`/dashboard/patients/${dupe.id}`); return }
    const id = nextId(patients)
    db.set((d) => { d.patients.unshift({ id, patient_unique_id: 'P' + String(id).padStart(5, '0'), name: np.name.trim(), phone: np.phone.trim(), phone_e164: e164, email: np.email.trim() || null, gender: np.gender, dob: np.dob || null, source: 'desk', notes: '', tags: ['new'], created_at: todayISO() }) })
    setAdding(false); nav(`/dashboard/patients/${id}`)
  }

  return (
    <>
      <PageHeader title={tr('Patients', 'المرضى')} sub={`${patients.length} ${tr('patients on file', 'مريض مسجل')}`} actions={<Btn onClick={() => setAdding(true)}><Plus className="size-4" />{tr('New patient', 'مريض جديد')}</Btn>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Name, phone or patient ID', 'الاسم أو الرقم أو كود المريض')} className={inputCls + ' !rounded-full ps-10'} />
        </div>
        {([['all', tr('All', 'الكل')], ['active', tr('Open plan', 'خطة مفتوحة')], ['pending', tr('Awaiting approval', 'مستني موافقة')]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full border px-4 py-2 text-sm ${filter === k ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white text-charcoal'}`}>{l}</button>
        ))}
      </div>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Patient', 'المريض'), tr('Phone', 'الموبايل'), tr('Last visit', 'آخر زيارة'), tr('Next visit', 'الزيارة الجاية'), tr('Plan', 'الخطة'), tr('Open plan value', 'قيمة الخطة المفتوحة')].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-deep/5">
            {rows.map(({ p, last, next, planTotal, open, pending }) => (
              <tr key={p.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => nav(`/dashboard/patients/${p.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-jade/50 text-xs font-semibold text-deep">{p.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span>
                    <div><Link to={`/dashboard/patients/${p.id}`} className="font-medium text-deep">{p.name}</Link> <span className="text-[0.65rem] text-stone">{p.patient_unique_id}</span>
                      <div className="mt-0.5 flex gap-1">{p.tags.map((t) => <span key={t} className="rounded bg-beige px-1.5 text-[0.65rem] text-charcoal">{t}</span>)}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal/70" dir="ltr">{p.phone}</td>
                <td className="px-4 py-3 text-charcoal/70">{last ? fmtDate(last.date, lang) : '—'}</td>
                <td className="px-4 py-3 text-charcoal/70">{next ? fmtDate(next.date, lang) + ' · ' + next.from_time + ' ' + next.from_time_type : '—'}</td>
                <td className="px-4 py-3">{open > 0 ? <span className={`rounded-full px-2.5 py-1 text-[0.7rem] ${!pending ? 'bg-jade/60 text-deep' : 'bg-beige text-charcoal'}`}>{open} {tr('open', 'مفتوحة')} · {!pending ? tr('accepted', 'موافق') : tr('awaiting', 'مستني')}</span> : <span className="text-stone">—</span>}</td>
                <td className="px-4 py-3 tabular-nums text-charcoal">{planTotal > 0 ? money(planTotal, lang) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={adding} onClose={() => setAdding(false)} title={tr('New patient', 'مريض جديد')}>
        <div className="grid gap-3">
          <Field label={tr('Full name', 'الاسم بالكامل')}><input className={inputCls} value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr('Mobile', 'الموبايل')}><input className={inputCls} dir="ltr" placeholder="01XXXXXXXXX" value={np.phone} onChange={(e) => setNp({ ...np, phone: e.target.value })} /></Field>
            <Field label={tr('Date of birth', 'تاريخ الميلاد')}><input type="date" className={inputCls} value={np.dob} onChange={(e) => setNp({ ...np, dob: e.target.value })} /></Field>
          </div>
          <Field label={tr('Email (optional)', 'الإيميل (اختياري)')}><input type="email" className={inputCls} dir="ltr" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} /></Field>
          {dupe && <p className="rounded-xl bg-beige px-3 py-2 text-xs text-charcoal">{tr('This number already belongs to', 'الرقم ده مسجل باسم')} {dupe.name} ({dupe.patient_unique_id}).</p>}
          <Field label={tr('Gender', 'النوع')}>
            <div className="flex gap-2">{([2, 1] as const).map((g) => <button key={g} onClick={() => setNp({ ...np, gender: g })} className={`flex-1 rounded-xl border py-2.5 text-sm ${np.gender === g ? 'border-deep bg-deep text-ivory' : 'border-deep/10'}`}>{g === 2 ? tr('Female', 'أنثى') : tr('Male', 'ذكر')}</button>)}</div>
          </Field>
          <div className="mt-2 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setAdding(false)}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={np.name.trim().length < 3 || !e164} onClick={add}>{dupe ? tr('Open file', 'افتح الملف') : tr('Create', 'إنشاء')}</Btn></div>
        </div>
      </Modal>
    </>
  )
}
