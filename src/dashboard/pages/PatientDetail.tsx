import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarPlus, MessageCircle, Printer, Plus, Trash2, Check, Receipt } from 'lucide-react'
import { DentalArch } from '@/components/dental/DentalArch'
import { useLang } from '@/lib/i18n'
import {
  db, useDB, nextId, todayISO, addDays, money, loc, doctorName, TOOTH_CONDITIONS, PLAN_STATUSES, PAYMENT_METHODS,
  type ToothCondition, type DentalChartEntry, type PlanItemStatus, type PaymentMethodKey, type TreatmentPlan, type Invoice,
} from '@/lib/store'
import { PageHeader, Btn, Card, ApptBadge, PlanBadge, Field, inputCls, useTr, fmtDate, Modal, planLabel, methodLabel } from '../ui'
import { AppointmentModal, blankDraft, startOf, type Draft } from './Appointments'
import { CONDITIONS, ENTRY_STATUS, toothLook } from '../teeth'
import { activeOption, itemTotal, optionTotal, isOpen } from '../plans'

const NEXT_ITEM: Record<PlanItemStatus, PlanItemStatus> = { planned: 'in_progress', in_progress: 'done', done: 'planned', cancelled: 'planned' }
export const invoiceTotal = (i: Invoice) => Math.max(0, i.lines.reduce((t, l) => t + l.unit_price * l.quantity, 0) - i.discount)
export const invoicePaid = (i: Invoice) => i.payments.reduce((t, p) => t + p.amount, 0)
const statusOf = (i: Invoice): Invoice['status'] => { const p = invoicePaid(i), t = invoiceTotal(i); return p >= t ? 'paid' : p > 0 ? 'partial' : 'unpaid' }

export default function PatientDetail() {
  const { id } = useParams()
  const pid = Number(id)
  const tr = useTr()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const patient = useDB((d) => d.patients).find((p) => p.id === pid)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const allAppts = useDB((d) => d.appointments)
  const allChart = useDB((d) => d.chart)
  const allPlans = useDB((d) => d.plans)
  const allInvoices = useDB((d) => d.invoices)
  const [tooth, setTooth] = useState<number | null>(null)
  const [tab, setTab] = useState<'chart' | 'plans' | 'visits' | 'billing'>('chart')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [entry, setEntry] = useState<{ condition: ToothCondition; status: DentalChartEntry['status']; material: string }>({ condition: 'caries', status: 'existing', material: '' })
  const [newItem, setNewItem] = useState<{ plan: number; service_id: number; unit_price: number; phase: 1 | 2 | 3 }>({ plan: 0, service_id: 0, unit_price: 0, phase: 1 })
  const [payFor, setPayFor] = useState<Invoice | null>(null)
  const [pay, setPay] = useState<{ amount: number; method: PaymentMethodKey; reference: string }>({ amount: 0, method: 'cash', reference: '' })

  const appts = useMemo(() => allAppts.filter((a) => a.patient_id === pid).sort((a, b) => b.date.localeCompare(a.date) || startOf(b) - startOf(a)), [allAppts, pid])
  const chart = useMemo(() => allChart.filter((c) => c.patient_id === pid), [allChart, pid])
  const plans = useMemo(() => allPlans.filter((p) => p.patient_id === pid).sort((a, b) => b.created_at.localeCompare(a.created_at)), [allPlans, pid])
  const invoices = useMemo(() => allInvoices.filter((i) => i.patient_id === pid).sort((a, b) => b.created_at.localeCompare(a.created_at)), [allInvoices, pid])
  if (!patient) return <Navigate to="/dashboard/patients" replace />

  const p = patient
  const openValue = plans.filter(isOpen).reduce((t, x) => t + optionTotal(x, true), 0)
  const paid = invoices.reduce((t, i) => t + invoicePaid(i), 0)
  const due = invoices.reduce((t, i) => t + Math.max(0, invoiceTotal(i) - invoicePaid(i)), 0)
  const sName = (sid: number) => { const s = services.find((x) => x.id === sid); return s ? loc(s, 'name', lang) : '—' }
  const docName = (did: number) => { const d = doctors.find((x) => x.id === did); return d ? doctorName(d, lang) : '' }
  const age = p.dob ? Math.floor((Date.now() - new Date(p.dob).getTime()) / 3.15576e10) : null
  const toothEntries = tooth ? chart.filter((c) => c.tooth === tooth) : []
  const plannedTeeth = new Set(plans.filter(isOpen).flatMap((x) => activeOption(x)?.items.filter((i) => i.status !== 'done' && i.status !== 'cancelled').map((i) => Number(i.site)) ?? []))

  const editPlan = (planId: number, fn: (pl: TreatmentPlan) => void) => db.set((d) => { const pl = d.plans.find((x) => x.id === planId); if (pl) fn(pl) })
  const addEntry = () => tooth && db.set((d) => { d.chart.push({ id: nextId(d.chart), patient_id: pid, tooth, surfaces: [], condition: entry.condition, status: entry.status, material: entry.material || null, notes: null }) })
  const newPlan = () => db.set((d) => {
    const id = nextId(d.plans)
    const optId = d.plans.reduce((m, x) => Math.max(m, ...x.options.map((o) => o.id)), 0) + 1
    d.plans.unshift({ id, reference: 'TP-' + String(2400 + id), patient_id: pid, doctor_id: doctors[0].id, title: tr('Treatment plan', 'خطة علاج'), status: 'draft', valid_until: addDays(todayISO(), 30), accepted_option_id: null, notes: '', created_at: todayISO(), options: [{ id: optId, name: 'Recommended', is_recommended: true, discount: 0, items: [] }] })
  })
  const addItem = (pl: TreatmentPlan) => {
    if (!newItem.service_id) return
    editPlan(pl.id, (x) => {
      const o = activeOption(x); if (!o) return
      const iid = allPlans.reduce((m, y) => Math.max(m, ...y.options.flatMap((oo) => oo.items.map((i) => i.id))), 0) + 1
      o.items.push({ id: iid, phase: newItem.phase, service_id: newItem.service_id, site: tooth ? String(tooth) : null, qty: 1, unit_price: newItem.unit_price, discount: 0, status: 'planned' })
    })
    setNewItem({ plan: 0, service_id: 0, unit_price: 0, phase: 1 })
  }
  const invoiceVisit = (aid: number) => db.set((d) => {
    const a = d.appointments.find((x) => x.id === aid); if (!a) return
    const id = nextId(d.invoices)
    d.invoices.push({ id, number: 'INV-' + String(5000 + id), patient_id: pid, appointment_id: aid, discount: 0, status: 'unpaid', created_at: todayISO(), payments: [],
      lines: a.service_ids.map((sid) => { const s = d.services.find((x) => x.id === sid)!; return { description: s.name, unit_price: s.charges, quantity: 1 } }) })
  })
  const savePayment = () => payFor && db.set((d) => {
    const inv = d.invoices.find((x) => x.id === payFor.id); if (!inv) return
    inv.payments.push({ id: Date.now(), method: pay.method, amount: pay.amount, reference: pay.reference || null, paid_at: todayISO() })
    inv.status = statusOf(inv)
  })
  const invoiced = new Set(invoices.map((i) => i.appointment_id))

  return (
    <>
      <Link to="/dashboard/patients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-emerald hover:text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{tr('Patients', 'المرضى')}</Link>
      <PageHeader
        title={p.name}
        sub={[p.patient_unique_id, p.phone, age ? `${age} ${tr('yrs', 'سنة')}` : '', p.gender === 2 ? tr('Female', 'أنثى') : tr('Male', 'ذكر'), `${tr('Since', 'من')} ${fmtDate(p.created_at, lang, { month: 'short', year: 'numeric' })}`].filter(Boolean).join(' · ')}
        actions={<>
          <a href={`https://wa.me/${p.phone_e164.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-4 py-2.5 text-sm font-medium text-deep hover:bg-deep/5"><MessageCircle className="size-4" />WhatsApp</a>
          <Link to={`/dashboard/patients/${p.id}/plan`} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-4 py-2.5 text-sm font-medium text-deep hover:bg-deep/5"><Printer className="size-4" />{tr('Written plan', 'الخطة المكتوبة')}</Link>
          <Btn onClick={() => setDraft(blankDraft({ patient_id: p.id, doctor_id: doctors[0].id }))}><CalendarPlus className="size-4" />{tr('Book visit', 'احجز زيارة')}</Btn>
        </>}
      />

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[[tr('Open plans', 'الخطط المفتوحة'), money(openValue, lang)], [tr('Paid', 'المدفوع'), money(paid, lang)], [tr('Balance due', 'المستحق'), money(due, lang)], [tr('Visits', 'الزيارات'), String(appts.filter((a) => a.status === 'completed').length)]].map(([k, v], i) => (
          <Card key={k} className={i === 2 ? '!bg-deep !border-deep text-ivory' : ''}><p className={`text-xs ${i === 2 ? 'text-jade' : 'text-stone'}`}>{k}</p><p className={`font-display mt-2 text-2xl font-semibold tabular-nums ${i === 2 ? '' : 'text-deep'}`}>{v}</p></Card>
        ))}
      </div>
      {(p.notes || p.tags.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-beige/70 px-4 py-3 text-sm text-charcoal">
          {p.tags.map((t) => <span key={t} className="rounded-full bg-white px-2.5 py-0.5 text-xs">{t}</span>)}{p.notes}
        </div>
      )}

      <div className="mb-4 flex w-fit flex-wrap gap-1 rounded-full bg-white p-1 text-sm shadow-sm">
        {([['chart', tr('Dental chart', 'شارت الأسنان')], ['plans', tr('Treatment plans', 'خطط العلاج')], ['visits', tr('Visits', 'الزيارات')], ['billing', tr('Invoices', 'الفواتير')]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 ${tab === k ? 'bg-deep text-ivory' : 'text-stone'}`}>{l}</button>
        ))}
      </div>

      {tab === 'chart' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-deep">{tr('Dental chart (FDI)', 'شارت الأسنان (FDI)')}</h2>
              <span className="text-xs text-stone">{tooth ? `${tr('Tooth', 'سنة')} ${tooth}` : tr('Select a tooth', 'اختار سنة')}</span>
            </div>
            <div className="relative mx-auto mt-2 max-w-[440px]">
              <DentalArch width={420} className="w-full" selected={tooth} onSelect={(t) => setTooth(tooth === t.fdi ? null : t.fdi)}
                fill={(t) => toothLook(chart, t.fdi).fill} stroke={(t) => toothLook(chart, t.fdi).stroke}
                marker={(t) => { const l = toothLook(chart, t.fdi); return l.missing ? <path d="M-6 -6L6 6M6 -6L-6 6" stroke="#8C8F8D" strokeWidth={1.6} strokeLinecap="round" /> : l.planned || plannedTeeth.has(t.fdi) ? <circle r={3.2} fill="#BFE3D3" stroke="#0E4D3C" strokeWidth={1} /> : null }} />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-[30%] text-[0.65rem] tracking-widest text-stone uppercase" dir="ltr"><span>R</span><span>L</span></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[0.7rem] text-charcoal/80">
              {(['caries', 'filling', 'rct', 'crown', 'implant', 'missing'] as const).map((k) => <span key={k} className="inline-flex items-center gap-1.5"><span className="size-3 rounded-full border" style={{ background: CONDITIONS[k].fill, borderColor: CONDITIONS[k].stroke }} />{ar ? CONDITIONS[k].ar : CONDITIONS[k].en}</span>)}
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border border-deep bg-jade" />{tr('Planned', 'مخطط')}</span>
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-lg font-semibold text-deep">{tooth ? `${tr('Tooth', 'سنة')} ${tooth}` : tr('Chart entries', 'تسجيلات الشارت')}</h2>
            {!tooth ? <p className="mt-6 text-sm text-stone">{tr('Select a tooth on the chart to see and record its conditions.', 'اختار سنة من الشارت علشان تشوف وتسجّل حالتها.')}</p> : <>
              <ul className="mt-3 divide-y divide-deep/5">
                {toothEntries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="size-3.5 rounded-full border" style={{ background: CONDITIONS[e.condition].fill, borderColor: CONDITIONS[e.condition].stroke }} />
                    <span className="flex-1">{ar ? CONDITIONS[e.condition].ar : CONDITIONS[e.condition].en}{e.material && <span className="text-stone"> · {e.material}</span>}</span>
                    <select value={e.status} onChange={(ev) => db.set((d) => { const x = d.chart.find((y) => y.id === e.id); if (x) x.status = ev.target.value as DentalChartEntry['status'] })} className="rounded-full border border-deep/10 bg-white px-2.5 py-1 text-xs">
                      {(Object.keys(ENTRY_STATUS) as DentalChartEntry['status'][]).map((s) => <option key={s} value={s}>{ENTRY_STATUS[s][ar ? 1 : 0]}</option>)}
                    </select>
                    <button onClick={() => db.set((d) => { d.chart = d.chart.filter((y) => y.id !== e.id) })} className="text-stone hover:text-charcoal" aria-label="Remove"><Trash2 className="size-4" /></button>
                  </li>
                ))}
                {toothEntries.length === 0 && <li className="py-6 text-sm text-stone">{tr('Healthy — nothing recorded.', 'سليمة — مفيش تسجيلات.')}</li>}
              </ul>
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 rounded-2xl bg-ivory p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
                <Field label={tr('Condition', 'الحالة')}>
                  <select className={inputCls} value={entry.condition} onChange={(e) => setEntry({ ...entry, condition: e.target.value as ToothCondition })}>
                    {TOOTH_CONDITIONS.map((c) => <option key={c} value={c}>{ar ? CONDITIONS[c].ar : CONDITIONS[c].en}</option>)}
                  </select>
                </Field>
                <Field label={tr('Status', 'الوضع')}>
                  <select className={inputCls} value={entry.status} onChange={(e) => setEntry({ ...entry, status: e.target.value as DentalChartEntry['status'] })}>
                    {(Object.keys(ENTRY_STATUS) as DentalChartEntry['status'][]).map((s) => <option key={s} value={s}>{ENTRY_STATUS[s][ar ? 1 : 0]}</option>)}
                  </select>
                </Field>
                <Field label={tr('Material', 'الخامة')}><input className={inputCls} value={entry.material} onChange={(e) => setEntry({ ...entry, material: e.target.value })} /></Field>
                <Btn onClick={addEntry} className="!px-3" aria-label="Add"><Plus className="size-4" /></Btn>
              </div>
            </>}
          </Card>
        </div>
      )}

      {tab === 'plans' && (
        <div className="grid gap-4">
          <div className="flex justify-end"><Btn onClick={newPlan}><Plus className="size-4" />{tr('New plan', 'خطة جديدة')}</Btn></div>
          {plans.map((pl) => {
            const o = activeOption(pl)
            return (
              <Card key={pl.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-stone">{pl.reference} · {docName(pl.doctor_id)} · {fmtDate(pl.created_at, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <input value={pl.title} onChange={(e) => editPlan(pl.id, (x) => { x.title = e.target.value })} className="font-display -ms-1 mt-0.5 rounded-lg bg-transparent px-1 text-lg font-semibold text-deep outline-none focus:bg-ivory" />
                  </div>
                  <div className="flex items-center gap-2">
                    {o && pl.accepted_option_id !== o.id && <Btn variant="soft" className="!py-2 !text-xs" onClick={() => editPlan(pl.id, (x) => { x.accepted_option_id = o.id; x.status = 'accepted' })}><Check className="size-3.5" />{tr('Mark accepted', 'وافق المريض')}</Btn>}
                    <select value={pl.status} onChange={(e) => editPlan(pl.id, (x) => { x.status = e.target.value as TreatmentPlan['status'] })} className="rounded-full border border-deep/10 bg-white px-3 py-1.5 text-xs">
                      {PLAN_STATUSES.map((s) => <option key={s} value={s}>{planLabel(s, ar)}</option>)}
                    </select>
                  </div>
                </div>
                {o && <>
                  <ul className="mt-3 divide-y divide-deep/5">
                    {o.items.map((i) => (
                      <li key={i.id} className="flex items-center gap-3 py-3">
                        <button onClick={() => { setTab('chart'); setTooth(i.site ? Number(i.site) : null) }} className="font-display grid size-10 shrink-0 place-items-center rounded-xl bg-jade/40 text-sm font-semibold text-deep">{i.site ?? '—'}</button>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-charcoal">{sName(i.service_id)}</p><p className="text-xs text-stone">{tr('Phase', 'مرحلة')} {i.phase}</p></div>
                        <input type="number" value={i.unit_price} onChange={(e) => editPlan(pl.id, (x) => { const it = activeOption(x)?.items.find((y) => y.id === i.id); if (it) it.unit_price = Number(e.target.value) })} className="w-24 rounded-lg border border-transparent bg-transparent px-2 py-1 text-end text-sm tabular-nums hover:border-deep/10 focus:border-emerald focus:outline-none" aria-label="Price" />
                        <button onClick={() => editPlan(pl.id, (x) => { const it = activeOption(x)?.items.find((y) => y.id === i.id); if (it) it.status = NEXT_ITEM[it.status] })} title={tr('Click to change status', 'دوس لتغيير الحالة')}><PlanBadge s={i.status} /></button>
                        <button onClick={() => editPlan(pl.id, (x) => { const oo = activeOption(x); if (oo) oo.items = oo.items.filter((y) => y.id !== i.id) })} className="text-stone hover:text-charcoal" aria-label="Remove"><Trash2 className="size-4" /></button>
                      </li>
                    ))}
                    {o.items.length === 0 && <li className="py-6 text-center text-sm text-stone">{tr('No items yet.', 'مفيش بنود لسه.')}</li>}
                  </ul>
                  <div className="mt-3 grid grid-cols-[4rem_1fr_5rem_6.5rem_auto] items-end gap-2 rounded-2xl bg-ivory p-3">
                    <Field label={tr('Tooth', 'سنة')}><input className={inputCls} value={tooth ?? '—'} readOnly title={tr('Pick the tooth on the chart tab', 'اختار السنة من الشارت')} /></Field>
                    <Field label={tr('Service', 'الخدمة')}>
                      <select className={inputCls} value={newItem.plan === pl.id ? newItem.service_id : 0} onChange={(e) => { const s = services.find((x) => x.id === Number(e.target.value)); setNewItem({ ...newItem, plan: pl.id, service_id: Number(e.target.value), unit_price: s?.charges ?? 0 }) }}>
                        <option value={0}>—</option>{services.map((s) => <option key={s.id} value={s.id}>{loc(s, 'name', lang)}</option>)}
                      </select>
                    </Field>
                    <Field label={tr('Phase', 'مرحلة')}>
                      <select className={inputCls} value={newItem.plan === pl.id ? newItem.phase : 1} onChange={(e) => setNewItem({ ...newItem, plan: pl.id, phase: Number(e.target.value) as 1 | 2 | 3 })}>{[1, 2, 3].map((n) => <option key={n}>{n}</option>)}</select>
                    </Field>
                    <Field label="EGP"><input type="number" className={inputCls} value={newItem.plan === pl.id ? newItem.unit_price : 0} onChange={(e) => setNewItem({ ...newItem, plan: pl.id, unit_price: Number(e.target.value) })} /></Field>
                    <Btn disabled={newItem.plan !== pl.id || !newItem.service_id} onClick={() => addItem(pl)} className="!px-3" aria-label="Add"><Plus className="size-4" /></Btn>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-deep px-4 py-3 text-ivory">
                    <span className="flex items-center gap-2 text-sm text-jade">{pl.accepted_option_id === o.id && <Check className="size-4" />}{o.name} · {tr('total', 'الإجمالي')}</span>
                    <span className="font-display text-xl font-semibold tabular-nums">{money(o.items.filter((i) => i.status !== 'cancelled').reduce((t, i) => t + itemTotal(i), 0) - o.discount, lang)}</span>
                  </div>
                </>}
              </Card>
            )
          })}
          {plans.length === 0 && <Card><p className="py-8 text-center text-sm text-stone">{tr('No treatment plans yet.', 'مفيش خطط علاج لسه.')}</p></Card>}
        </div>
      )}

      {tab === 'visits' && (
        <Card className="!p-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <tbody className="divide-y divide-deep/5">
              {appts.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => setDraft(a)}>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.date, lang, { day: 'numeric', month: 'short', year: 'numeric' })} · <span dir="ltr">{a.from_time} {a.from_time_type}</span></td>
                  <td className="px-4 py-3">{a.service_ids.map(sName).join(' + ')}</td>
                  <td className="px-4 py-3 text-stone">{docName(a.doctor_id)}</td>
                  <td className="px-4 py-3"><ApptBadge s={a.status} /></td>
                  <td className="px-4 py-3 text-end">{a.status === 'completed' && !invoiced.has(a.id) && <button onClick={(e) => { e.stopPropagation(); invoiceVisit(a.id); setTab('billing') }} className="inline-flex items-center gap-1 text-xs text-emerald hover:text-deep"><Receipt className="size-3.5" />{tr('Invoice', 'فاتورة')}</button>}</td>
                </tr>
              ))}
              {appts.length === 0 && <tr><td className="p-10 text-center text-stone">{tr('No visits yet.', 'مفيش زيارات لسه.')}</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'billing' && (
        <Card>
          <ul className="divide-y divide-deep/5">
            {invoices.map((inv) => {
              const t = invoiceTotal(inv), pd = invoicePaid(inv)
              return (
                <li key={inv.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-deep">{inv.number} <span className="ms-1 text-xs font-normal text-stone">{fmtDate(inv.created_at, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
                    <p className="truncate text-xs text-stone">{inv.lines.map((l) => l.description).join(' + ')} {inv.payments.length > 0 && '· ' + inv.payments.map((x) => methodLabel(x.method, ar)).join(', ')}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[0.7rem] ${inv.status === 'paid' ? 'bg-deep text-ivory' : inv.status === 'partial' ? 'bg-jade/60 text-deep' : 'bg-beige text-charcoal'}`}>{{ paid: tr('Paid', 'مدفوعة'), partial: tr('Partial', 'جزئي'), unpaid: tr('Unpaid', 'غير مدفوعة') }[inv.status]}</span>
                  <span className="text-end whitespace-nowrap tabular-nums">{money(pd, lang)} / {money(t, lang)}</span>
                  {pd < t && <Btn variant="soft" className="!py-1.5 !text-xs" onClick={() => { setPay({ amount: t - pd, method: 'cash', reference: '' }); setPayFor(inv) }}>{tr('Pay', 'دفع')}</Btn>}
                </li>
              )
            })}
            {invoices.length === 0 && <li className="py-10 text-center text-sm text-stone">{tr('No invoices yet. Invoice a completed visit from the Visits tab.', 'مفيش فواتير لسه. اعمل فاتورة لزيارة خلصت من تاب الزيارات.')}</li>}
          </ul>
        </Card>
      )}

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title={`${tr('Payment', 'دفعة')} · ${payFor?.number ?? ''}`}>
        <div className="grid gap-3">
          <Field label="EGP"><input type="number" className={inputCls} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} /></Field>
          <Field label={tr('Method', 'طريقة الدفع')}>
            <div className="flex flex-wrap gap-2">{PAYMENT_METHODS.map((m) => <button key={m} onClick={() => setPay({ ...pay, method: m })} className={`flex-1 whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm ${pay.method === m ? 'border-deep bg-deep text-ivory' : 'border-deep/10'}`}>{methodLabel(m, ar)}</button>)}</div>
          </Field>
          <Field label={tr('Reference (optional)', 'رقم العملية (اختياري)')}><input className={inputCls} value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} /></Field>
          <div className="mt-2 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setPayFor(null)}>{tr('Cancel', 'إلغاء')}</Btn>
            <Btn disabled={pay.amount <= 0} onClick={() => { savePayment(); setPayFor(null) }}>{tr('Save', 'حفظ')}</Btn></div>
        </div>
      </Modal>
      {draft && <AppointmentModal key={draft.id ?? 'new'} draft={draft} onClose={() => setDraft(null)} />}
    </>
  )
}
