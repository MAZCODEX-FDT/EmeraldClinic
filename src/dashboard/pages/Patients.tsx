import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, uid, todayISO, money } from '@/lib/store'
import { PageHeader, Btn, Card, Modal, Field, inputCls, useTr, fmtDate } from '../ui'

export default function Patients() {
  const tr = useTr()
  const { lang } = useLang()
  const nav = useNavigate()
  const patients = useDB((d) => d.patients)
  const appts = useDB((d) => d.appointments)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')
  const [adding, setAdding] = useState(false)
  const [np, setNp] = useState({ name: '', phone: '', gender: 'f' as 'm' | 'f', dob: '' })

  const rows = useMemo(() => patients.map((p) => {
    const mine = appts.filter((a) => a.patientId === p.id)
    const last = mine.filter((a) => a.status === 'done').sort((a, b) => b.date.localeCompare(a.date))[0]
    const next = mine.filter((a) => a.date >= todayISO() && !['cancelled', 'done', 'no-show'].includes(a.status)).sort((a, b) => a.date.localeCompare(b.date))[0]
    const planTotal = p.plan.filter((i) => i.status !== 'done').reduce((s, i) => s + i.cost, 0)
    return { p, last, next, planTotal, open: p.plan.filter((i) => i.status !== 'done').length }
  }).filter(({ p, open }) => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q)) && (filter === 'all' || (filter === 'pending' ? !p.planApproved && open > 0 : open > 0))), [patients, appts, q, filter])

  const add = () => {
    const id = uid('p-')
    db.set((d) => { d.patients.unshift({ id, name: np.name.trim(), phone: np.phone.trim(), gender: np.gender, dob: np.dob, notes: '', createdAt: todayISO(), teeth: {}, plan: [], planApproved: false, tags: ['new'] }) })
    setAdding(false); nav(`/dashboard/patients/${id}`)
  }

  return (
    <>
      <PageHeader title={tr('Patients', 'المرضى')} sub={`${patients.length} ${tr('patients on file', 'مريض مسجل')}`} actions={<Btn onClick={() => setAdding(true)}><Plus className="size-4" />{tr('New patient', 'مريض جديد')}</Btn>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1 md:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Name or phone', 'الاسم أو الرقم')} className={inputCls + ' !rounded-full ps-10'} />
        </div>
        {([['all', tr('All', 'الكل')], ['active', tr('Open plan', 'خطة مفتوحة')], ['pending', tr('Awaiting approval', 'مستني موافقة')]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`rounded-full border px-4 py-2 text-sm ${filter === k ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white text-charcoal'}`}>{l}</button>
        ))}
      </div>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Patient', 'المريض'), tr('Phone', 'الموبايل'), tr('Last visit', 'آخر زيارة'), tr('Next visit', 'الزيارة الجاية'), tr('Plan', 'الخطة'), tr('Open plan value', 'قيمة الخطة المفتوحة')].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-deep/5">
            {rows.map(({ p, last, next, planTotal, open }) => (
              <tr key={p.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => nav(`/dashboard/patients/${p.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display grid size-9 shrink-0 place-items-center rounded-full bg-jade/50 text-xs font-semibold text-deep">{p.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</span>
                    <div><Link to={`/dashboard/patients/${p.id}`} className="font-medium text-deep">{p.name}</Link>
                      <div className="mt-0.5 flex gap-1">{p.tags.map((t) => <span key={t} className="rounded bg-beige px-1.5 text-[0.65rem] text-charcoal">{t}</span>)}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal/70" dir="ltr">{p.phone}</td>
                <td className="px-4 py-3 text-charcoal/70">{last ? fmtDate(last.date, lang) : '—'}</td>
                <td className="px-4 py-3 text-charcoal/70">{next ? fmtDate(next.date, lang) + ' · ' + next.time : '—'}</td>
                <td className="px-4 py-3">{open > 0 ? <span className={`rounded-full px-2.5 py-1 text-[0.7rem] ${p.planApproved ? 'bg-jade/60 text-deep' : 'bg-beige text-charcoal'}`}>{open} {tr('open', 'مفتوح')} · {p.planApproved ? tr('approved', 'موافق') : tr('pending', 'مستني')}</span> : <span className="text-stone">—</span>}</td>
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
            <Field label={tr('Phone', 'الموبايل')}><input className={inputCls} dir="ltr" value={np.phone} onChange={(e) => setNp({ ...np, phone: e.target.value })} /></Field>
            <Field label={tr('Date of birth', 'تاريخ الميلاد')}><input type="date" className={inputCls} value={np.dob} onChange={(e) => setNp({ ...np, dob: e.target.value })} /></Field>
          </div>
          <Field label={tr('Gender', 'النوع')}>
            <div className="flex gap-2">{(['f', 'm'] as const).map((g) => <button key={g} onClick={() => setNp({ ...np, gender: g })} className={`flex-1 rounded-xl border py-2.5 text-sm ${np.gender === g ? 'border-deep bg-deep text-ivory' : 'border-deep/10'}`}>{g === 'f' ? tr('Female', 'أنثى') : tr('Male', 'ذكر')}</button>)}</div>
          </Field>
          <div className="mt-2 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setAdding(false)}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={np.name.trim().length < 3} onClick={add}>{tr('Create', 'إنشاء')}</Btn></div>
        </div>
      </Modal>
    </>
  )
}
