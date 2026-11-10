import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarPlus, MessageCircle, Printer, Plus, Trash2, Check } from 'lucide-react'
import { DentalArch } from '@/components/dental/DentalArch'
import { useLang } from '@/lib/i18n'
import { db, useDB, uid, todayISO, money, type ToothState, type PlanStatus, type Payment } from '@/lib/store'
import { PageHeader, Btn, Card, ApptBadge, PlanBadge, Field, inputCls, useTr, fmtDate, Toggle, Modal } from '../ui'
import { AppointmentModal, type Draft } from './Appointments'

export const TOOTH_STATES: { k: ToothState; en: string; ar: string; fill: string; stroke: string }[] = [
  { k: 'healthy', en: 'Healthy', ar: 'سليمة', fill: '#FFFFFF', stroke: '#BFE3D3' },
  { k: 'watch', en: 'Watch', ar: 'متابعة', fill: '#E9DFCF', stroke: '#8C8F8D' },
  { k: 'caries', en: 'Caries', ar: 'تسوس', fill: '#2B2F2E', stroke: '#2B2F2E' },
  { k: 'filling', en: 'Filling', ar: 'حشو', fill: '#BFE3D3', stroke: '#1F7A5C' },
  { k: 'rootcanal', en: 'Root canal', ar: 'عصب', fill: '#1F7A5C', stroke: '#0E4D3C' },
  { k: 'crown', en: 'Crown', ar: 'كراون', fill: '#0E4D3C', stroke: '#093629' },
  { k: 'implant', en: 'Implant', ar: 'زراعة', fill: '#125A47', stroke: '#BFE3D3' },
  { k: 'missing', en: 'Missing', ar: 'مخلوعة', fill: 'transparent', stroke: '#8C8F8D' },
]
const stateOf = (k?: ToothState) => TOOTH_STATES.find((s) => s.k === (k ?? 'healthy'))!

export default function PatientDetail() {
  const { id } = useParams()
  const tr = useTr()
  const { lang, pick } = useLang()
  const patient = useDB((d) => d.patients).find((p) => p.id === id)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const allAppts = useDB((d) => d.appointments)
  const allPayments = useDB((d) => d.payments)
  const [tooth, setTooth] = useState<number | null>(null)
  const [tab, setTab] = useState<'chart' | 'visits' | 'payments'>('chart')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [newItem, setNewItem] = useState({ serviceId: '', cost: 0, note: '' })
  const [payOpen, setPayOpen] = useState(false)
  const [pay, setPay] = useState<{ amount: number; method: Payment['method']; note: string }>({ amount: 0, method: 'cash', note: '' })

  const appts = useMemo(() => allAppts.filter((a) => a.patientId === id).sort((a, b) => b.date.localeCompare(a.date)), [allAppts, id])
  const payments = useMemo(() => allPayments.filter((p) => p.patientId === id).sort((a, b) => b.date.localeCompare(a.date)), [allPayments, id])
  if (!patient) return <Navigate to="/dashboard/patients" replace />

  const p = patient
  const total = p.plan.reduce((s, i) => s + i.cost, 0)
  const paid = payments.reduce((s, x) => s + x.amount, 0)
  const remaining = p.plan.filter((i) => i.status !== 'done').reduce((s, i) => s + i.cost, 0)
  const sName = (sid: string) => { const s = services.find((x) => x.id === sid); return s ? pick(s.name) : '—' }
  const update = (fn: (pp: typeof p) => void) => db.set((d) => { const x = d.patients.find((y) => y.id === p.id); if (x) fn(x) })
  const setState = (k: ToothState) => tooth && update((x) => { if (k === 'healthy') delete x.teeth[tooth]; else x.teeth[tooth] = k })
  const nextStatus: Record<PlanStatus, PlanStatus> = { planned: 'in-progress', 'in-progress': 'done', done: 'planned' }
  const age = p.dob ? Math.floor((Date.now() - new Date(p.dob).getTime()) / 3.15576e10) : null

  const addItem = () => {
    if (!newItem.serviceId) return
    update((x) => { x.plan.push({ id: uid('pi-'), tooth: tooth ?? undefined, serviceId: newItem.serviceId, note: newItem.note, cost: newItem.cost, status: 'planned' }); x.planApproved = false })
    setNewItem({ serviceId: '', cost: 0, note: '' })
  }

  return (
    <>
      <Link to="/dashboard/patients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-emerald hover:text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{tr('Patients', 'المرضى')}</Link>
      <PageHeader
        title={p.name}
        sub={[p.phone, age ? `${age} ${tr('yrs', 'سنة')}` : '', p.gender === 'f' ? tr('Female', 'أنثى') : tr('Male', 'ذكر'), `${tr('Since', 'من')} ${fmtDate(p.createdAt, lang, { month: 'short', year: 'numeric' })}`].filter(Boolean).join(' · ')}
        actions={<>
          <a href={`https://wa.me/2${p.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-4 py-2.5 text-sm font-medium text-deep hover:bg-deep/5"><MessageCircle className="size-4" />WhatsApp</a>
          <Link to={`/dashboard/patients/${p.id}/plan`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-4 py-2.5 text-sm font-medium text-deep hover:bg-deep/5"><Printer className="size-4" />{tr('Written plan', 'الخطة المكتوبة')}</Link>
          <Btn onClick={() => setDraft({ patientId: p.id, doctorId: doctors[0].id, serviceId: '', date: todayISO(), time: '16:00', duration: 45, chair: 1, status: 'booked', notes: '' })}><CalendarPlus className="size-4" />{tr('Book visit', 'احجز زيارة')}</Btn>
        </>}
      />

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[[tr('Plan total', 'إجمالي الخطة'), money(total, lang)], [tr('Paid (all visits)', 'المدفوع (كل الزيارات)'), money(paid, lang)], [tr('Remaining on plan', 'المتبقي من الخطة'), money(remaining, lang)], [tr('Visits', 'الزيارات'), String(appts.filter((a) => a.status === 'done').length)]].map(([k, v], i) => (
          <Card key={k} className={i === 2 ? '!bg-deep !border-deep text-ivory' : ''}><p className={`text-xs ${i === 2 ? 'text-jade' : 'text-stone'}`}>{k}</p><p className={`font-display mt-2 text-2xl font-semibold tabular-nums ${i === 2 ? '' : 'text-deep'}`}>{v}</p></Card>
        ))}
      </div>
      {(p.notes || p.tags.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-beige/70 px-4 py-3 text-sm text-charcoal">
          {p.tags.map((t) => <span key={t} className="rounded-full bg-white px-2.5 py-0.5 text-xs">{t}</span>)}{p.notes}
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-full bg-white p-1 text-sm shadow-sm w-fit">
        {([['chart', tr('Chart & plan', 'الشارت والخطة')], ['visits', tr('Visits', 'الزيارات')], ['payments', tr('Payments', 'المدفوعات')]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 ${tab === k ? 'bg-deep text-ivory' : 'text-stone'}`}>{l}</button>
        ))}
      </div>

      {tab === 'chart' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-deep">{tr('Dental chart (FDI)', 'شارت الأسنان (FDI)')}</h2>
              <span className="text-xs text-stone">{tooth ? `${tr('Tooth', 'سنة')} ${tooth}` : tr('Select a tooth', 'اختار سنة')}</span>
            </div>
            <div className="relative mx-auto mt-2 max-w-[440px]">
              <DentalArch width={420} className="w-full" selected={tooth} onSelect={(t) => setTooth(tooth === t.fdi ? null : t.fdi)}
                fill={(t) => stateOf(p.teeth[t.fdi]).fill} stroke={(t) => stateOf(p.teeth[t.fdi]).stroke}
                marker={(t) => p.teeth[t.fdi] === 'missing' ? <path d="M-6 -6L6 6M6 -6L-6 6" stroke="#8C8F8D" strokeWidth={1.6} strokeLinecap="round" /> : p.plan.some((i) => i.tooth === t.fdi && i.status !== 'done') ? <circle r={3.2} fill="#BFE3D3" stroke="#0E4D3C" strokeWidth={1} /> : null} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-[30%] text-[0.65rem] tracking-widest text-stone uppercase" dir="ltr"><span>R</span><span>L</span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {TOOTH_STATES.map((s) => (
                <button key={s.k} disabled={!tooth} onClick={() => setState(s.k)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:cursor-default ${tooth && stateOf(p.teeth[tooth]).k === s.k ? 'border-deep bg-deep/5' : 'border-deep/10 hover:border-deep/30'}`}>
                  <span className="size-3 rounded-full border" style={{ background: s.fill, borderColor: s.stroke }} />{lang === 'ar' ? s.ar : s.en}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-deep">{tr('Treatment plan', 'خطة العلاج')}</h2>
              <label className="flex items-center gap-2 text-xs text-charcoal">{tr('Approved by patient', 'موافقة المريض')}<Toggle on={p.planApproved} onChange={(v) => update((x) => { x.planApproved = v })} /></label>
            </div>
            <div className="mt-4 grid grid-cols-[4rem_1fr_6.5rem_auto] items-end gap-2 rounded-2xl bg-ivory p-3">
              <Field label={tr('Tooth', 'سنة')}><input className={inputCls} value={tooth ?? '—'} readOnly /></Field>
              <Field label={tr('Treatment', 'العلاج')}>
                <select className={inputCls} value={newItem.serviceId} onChange={(e) => setNewItem({ ...newItem, serviceId: e.target.value, cost: services.find((s) => s.id === e.target.value)?.price ?? 0 })}>
                  <option value="">—</option>{services.map((s) => <option key={s.id} value={s.id}>{pick(s.name)}</option>)}
                </select>
              </Field>
              <Field label="EGP"><input type="number" className={inputCls} value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: Number(e.target.value) })} /></Field>
              <Btn disabled={!newItem.serviceId} onClick={addItem} className="!px-3" aria-label="Add"><Plus className="size-4" /></Btn>
            </div>
            <ul className="mt-3 divide-y divide-deep/5">
              {p.plan.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <button onClick={() => setTooth(i.tooth ?? null)} className="font-display grid size-10 shrink-0 place-items-center rounded-xl bg-jade/40 text-sm font-semibold text-deep">{i.tooth ?? '—'}</button>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-charcoal">{sName(i.serviceId)}</p>{i.note && <p className="truncate text-xs text-stone">{i.note}</p>}</div>
                  <input type="number" value={i.cost} onChange={(e) => update((x) => { const it = x.plan.find((y) => y.id === i.id); if (it) it.cost = Number(e.target.value) })} className="w-24 rounded-lg border border-transparent bg-transparent px-2 py-1 text-end text-sm tabular-nums hover:border-deep/10 focus:border-emerald focus:outline-none" aria-label="Cost" />
                  <button onClick={() => update((x) => { const it = x.plan.find((y) => y.id === i.id); if (it) it.status = nextStatus[it.status] })} title={tr('Click to change status', 'دوس لتغيير الحالة')}><PlanBadge s={i.status} /></button>
                  <button onClick={() => update((x) => { x.plan = x.plan.filter((y) => y.id !== i.id) })} className="text-stone hover:text-charcoal" aria-label="Remove"><Trash2 className="size-4" /></button>
                </li>
              ))}
              {p.plan.length === 0 && <li className="py-10 text-center text-sm text-stone">{tr('No plan yet. Select a tooth and add a treatment.', 'مفيش خطة لسه. اختار سنة وضيف علاج.')}</li>}
            </ul>
            {p.plan.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-deep px-4 py-3 text-ivory">
                <span className="flex items-center gap-2 text-sm text-jade">{p.planApproved && <Check className="size-4" />}{tr('Estimated total', 'التكلفة التقديرية')}</span>
                <span className="font-display text-xl font-semibold tabular-nums">{money(total, lang)}</span>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'visits' && (
        <Card className="!p-0 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <tbody className="divide-y divide-deep/5">
              {appts.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => setDraft(a)}>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.date, lang, { day: 'numeric', month: 'short', year: 'numeric' })} · <span dir="ltr">{a.time}</span></td>
                  <td className="px-4 py-3">{sName(a.serviceId)}</td>
                  <td className="px-4 py-3 text-stone">{pick(doctors.find((d) => d.id === a.doctorId)?.name ?? { en: '', ar: '' })}</td>
                  <td className="px-4 py-3"><ApptBadge s={a.status} /></td>
                </tr>
              ))}
              {appts.length === 0 && <tr><td className="p-10 text-center text-stone">{tr('No visits yet.', 'مفيش زيارات لسه.')}</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <div className="mb-3 flex justify-end"><Btn onClick={() => { setPay({ amount: remaining, method: 'cash', note: '' }); setPayOpen(true) }}><Plus className="size-4" />{tr('Record payment', 'سجّل دفعة')}</Btn></div>
          <ul className="divide-y divide-deep/5">
            {payments.map((x) => (
              <li key={x.id} className="flex items-center justify-between py-3 text-sm">
                <span>{fmtDate(x.date, lang, { day: 'numeric', month: 'short', year: 'numeric' })} · <span className="text-stone">{x.note}</span></span>
                <span className="flex items-center gap-3"><span className="rounded-full bg-ivory px-2 py-0.5 text-xs uppercase text-stone">{x.method}</span><span className="font-medium tabular-nums">{money(x.amount, lang)}</span></span>
              </li>
            ))}
            {payments.length === 0 && <li className="py-10 text-center text-sm text-stone">{tr('No payments yet.', 'مفيش مدفوعات لسه.')}</li>}
          </ul>
        </Card>
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title={tr('Record payment', 'سجّل دفعة')}>
        <div className="grid gap-3">
          <Field label="EGP"><input type="number" className={inputCls} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} /></Field>
          <Field label={tr('Method', 'طريقة الدفع')}>
            <div className="flex gap-2">{(['cash', 'card', 'instapay'] as const).map((m) => <button key={m} onClick={() => setPay({ ...pay, method: m })} className={`flex-1 rounded-xl border py-2.5 text-sm capitalize ${pay.method === m ? 'border-deep bg-deep text-ivory' : 'border-deep/10'}`}>{m}</button>)}</div>
          </Field>
          <Field label={tr('Note', 'ملاحظة')}><input className={inputCls} value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} /></Field>
          <div className="mt-2 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setPayOpen(false)}>{tr('Cancel', 'إلغاء')}</Btn>
            <Btn disabled={pay.amount <= 0} onClick={() => { db.set((d) => { d.payments.push({ id: uid('pay-'), patientId: p.id, amount: pay.amount, method: pay.method, date: todayISO(), note: pay.note || tr('Payment', 'دفعة') }) }); setPayOpen(false) }}>{tr('Save', 'حفظ')}</Btn></div>
        </div>
      </Modal>
      {draft && <AppointmentModal key={draft.id ?? 'new'} draft={draft} onClose={() => setDraft(null)} />}
    </>
  )
}
