import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, todayISO, addDays, nextId, loc, doctorName, mainBranch, APPOINTMENT_STATUSES, type Appointment } from '@/lib/store'
import { toMinutes, fromMinutes, to24, from24, label, egyptE164 } from '@/lib/mazmed/time'
import { PageHeader, Btn, Card, ApptBadge, Modal, Field, inputCls, useTr, fmtDate, apptLabel } from '../ui'

const START = 12 * 60
const END = 22 * 60
const PX = 1.4 // px per minute
const LIVE = (s: Appointment['status']) => !['cancelled', 'cancelled_by_doctor', 'rescheduled'].includes(s)
export const startOf = (a: Pick<Appointment, 'from_time' | 'from_time_type'>) => toMinutes(a.from_time, a.from_time_type)
export const endOf = (a: Pick<Appointment, 'to_time' | 'to_time_type'>) => toMinutes(a.to_time, a.to_time_type)

/** Editable appointment: MazMed fields, id optional, plus an inline new patient. */
export type Draft = Omit<Appointment, 'id' | 'appointment_unique_id'> & { id?: number; appointment_unique_id?: string; newPatient?: { name: string; phone: string } }

export function blankDraft(over: Partial<Draft> & { start?: number; minutes?: number } = {}): Draft {
  const { start = 16 * 60, minutes = 30, ...rest } = over
  const f = fromMinutes(start), t = fromMinutes(start + minutes)
  return {
    patient_id: 0, doctor_id: 1, branch_id: 1, date: todayISO(),
    from_time: f.time, from_time_type: f.type, to_time: t.time, to_time_type: t.type,
    status: 'booked', service_ids: [], description: null, total_charge: 0, source: 'desk', resource_id: 1, ...rest,
  }
}

/** Same chair or same doctor overlapping (MazMed blocks both). */
export function conflict(appts: Appointment[], a: Draft) {
  const s = startOf(a), e = endOf(a)
  return appts.find((x) => x.id !== a.id && x.date === a.date && LIVE(x.status) && (x.resource_id === a.resource_id || x.doctor_id === a.doctor_id) && startOf(x) < e && endOf(x) > s)
}

const ref8 = () => Math.random().toString(36).slice(2, 10).toUpperCase()

export function AppointmentModal({ draft, onClose, onSaved }: { draft: Draft | null; onClose: () => void; onSaved?: (id: number) => void }) {
  const tr = useTr()
  const { lang } = useLang()
  const patients = useDB((d) => d.patients)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const appts = useDB((d) => d.appointments)
  const resources = useDB((d) => d.resources)
  const [f, setF] = useState<Draft | null>(draft)
  const [mode, setMode] = useState<'existing' | 'new'>(draft?.newPatient ? 'new' : 'existing')
  if (!draft || !f) return null
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF({ ...f, [k]: v })
  const start = startOf(f), minutes = Math.max(endOf(f) - start, 15)
  const setTime = (s: number, m: number) => { const a = fromMinutes(s), b = fromMinutes(s + m); setF({ ...f, from_time: a.time, from_time_type: a.type, to_time: b.time, to_time_type: b.type }) }
  const doc = doctors.find((d) => d.id === f.doctor_id)
  const docServices = services.filter((s) => !doc || doc.service_ids.includes(s.id))
  const toggleService = (id: number) => {
    const ids = f.service_ids.includes(id) ? f.service_ids.filter((x) => x !== id) : [...f.service_ids, id]
    const chosen = services.filter((s) => ids.includes(s.id))
    const gap = doc?.session_gap ?? 30
    const mins = Math.max(gap, Math.ceil(chosen.reduce((t, s) => t + s.service_time, 0) / gap) * gap)
    const a = fromMinutes(start), b = fromMinutes(start + mins)
    setF({ ...f, service_ids: ids, total_charge: chosen.reduce((t, s) => t + s.charges, 0), from_time: a.time, from_time_type: a.type, to_time: b.time, to_time_type: b.type })
  }
  const clash = conflict(appts, f)
  const phoneOk = mode === 'existing' || !!egyptE164(f.newPatient?.phone ?? '')
  const valid = (mode === 'existing' ? !!f.patient_id : (f.newPatient?.name.trim().length ?? 0) > 2 && phoneOk) && f.service_ids.length && f.doctor_id && f.date

  const save = () => {
    let id = f.id ?? 0
    db.set((d) => {
      let patient_id = f.patient_id
      if (mode === 'new' && f.newPatient) {
        const e164 = egyptE164(f.newPatient.phone)!
        const existing = d.patients.find((p) => p.phone_e164 === e164)
        if (existing) patient_id = existing.id
        else {
          patient_id = nextId(d.patients)
          d.patients.unshift({ id: patient_id, patient_unique_id: 'P' + String(patient_id).padStart(5, '0'), name: f.newPatient.name.trim(), phone: f.newPatient.phone.trim(), phone_e164: e164, email: null, gender: 1, dob: null, source: 'desk', notes: '', tags: ['new'], created_at: todayISO() })
        }
      }
      id = f.id ?? nextId(d.appointments)
      const { newPatient: _n, ...rest } = f
      void _n
      const rec: Appointment = { ...rest, id, patient_id, appointment_unique_id: f.appointment_unique_id ?? ref8(), branch_id: f.branch_id ?? mainBranch(d)?.id ?? null }
      const i = d.appointments.findIndex((x) => x.id === id)
      if (i >= 0) d.appointments[i] = rec; else d.appointments.push(rec)
    })
    onSaved?.(id)
    onClose()
  }
  const remove = () => { if (f.id && confirm(tr('Delete this appointment?', 'تحذف الميعاد ده؟'))) { db.set((d) => { d.appointments = d.appointments.filter((x) => x.id !== f.id) }); onClose() } }

  return (
    <Modal open onClose={onClose} wide title={f.id ? `${tr('Appointment', 'ميعاد')} #${f.appointment_unique_id}` : tr('New appointment', 'ميعاد جديد')}>
      <div className="grid gap-4">
        {!f.id && (
          <div className="flex gap-1 rounded-full bg-deep/5 p-1 text-sm">
            {(['existing', 'new'] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-full py-2 ${mode === m ? 'bg-white text-deep shadow' : 'text-stone'}`}>{m === 'existing' ? tr('Existing patient', 'مريض مسجل') : tr('New patient', 'مريض جديد')}</button>)}
          </div>
        )}
        {mode === 'existing' || f.id ? (
          <Field label={tr('Patient', 'المريض')}>
            <select className={inputCls} value={f.patient_id || ''} onChange={(e) => set('patient_id', Number(e.target.value))}>
              <option value="">—</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.phone}</option>)}
            </select>
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr('Name', 'الاسم')}><input className={inputCls} value={f.newPatient?.name ?? ''} onChange={(e) => set('newPatient', { name: e.target.value, phone: f.newPatient?.phone ?? '' })} /></Field>
            <Field label={tr('Mobile', 'الموبايل')}><input className={inputCls} dir="ltr" placeholder="01XXXXXXXXX" value={f.newPatient?.phone ?? ''} onChange={(e) => set('newPatient', { name: f.newPatient?.name ?? '', phone: e.target.value })} /></Field>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label={tr('Doctor', 'الدكتور')}>
            <select className={inputCls} value={f.doctor_id} onChange={(e) => setF({ ...f, doctor_id: Number(e.target.value), service_ids: [] })}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{doctorName(d, lang)}</option>)}
            </select>
          </Field>
          <Field label={tr('Chair', 'الكرسي')}>
            <select className={inputCls} value={f.resource_id ?? ''} onChange={(e) => set('resource_id', e.target.value ? Number(e.target.value) : null)}>
              <option value="">—</option>{resources.map((r) => <option key={r.id} value={r.id}>{loc(r, 'name', lang)}</option>)}
            </select>
          </Field>
        </div>
        <Field label={tr('Services', 'الخدمات')}>
          <div className="flex flex-wrap gap-1.5">
            {docServices.map((s) => <button key={s.id} onClick={() => toggleService(s.id)} className={`rounded-full border px-3 py-1.5 text-xs ${f.service_ids.includes(s.id) ? 'border-deep bg-deep text-ivory' : 'border-deep/10 text-charcoal'}`}>{loc(s, 'name', lang)} · {s.service_time}′</button>)}
          </div>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={tr('Date', 'التاريخ')}><input type="date" className={inputCls} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label={tr('From', 'من')}><input type="time" step={900} className={inputCls} value={to24(start)} onChange={(e) => e.target.value && setTime(from24(e.target.value), minutes)} /></Field>
          <Field label={tr('Minutes', 'الدقائق')}><input type="number" min={15} step={15} className={inputCls} value={minutes} onChange={(e) => setTime(start, Math.max(15, Number(e.target.value)))} /></Field>
        </div>
        <Field label={tr('Status', 'الحالة')}>
          <div className="flex flex-wrap gap-1.5">{APPOINTMENT_STATUSES.map((s) => <button key={s} onClick={() => set('status', s)} className={`rounded-full border px-3 py-1.5 text-xs ${f.status === s ? 'border-deep bg-deep text-ivory' : 'border-deep/10 text-charcoal'}`}>{apptLabel(s, lang === 'ar')}</button>)}</div>
        </Field>
        <Field label={tr('Notes', 'ملاحظات')}><textarea rows={2} className={inputCls} value={f.description ?? ''} onChange={(e) => set('description', e.target.value || null)} /></Field>
        <p className="text-xs text-stone" dir="ltr">{label(start)} – {label(start + minutes)} · {f.total_charge.toLocaleString()} EGP</p>
        {clash && <p className="rounded-xl bg-beige px-3 py-2 text-xs text-charcoal">⚠ {tr('Doctor or chair already booked at this time.', 'الدكتور أو الكرسي محجوز في الوقت ده.')} ({clash.from_time} {clash.from_time_type})</p>}
        <div className="flex items-center justify-between pt-2">
          {f.id ? <button onClick={remove} className="inline-flex items-center gap-1.5 text-sm text-stone hover:text-charcoal"><Trash2 className="size-4" />{tr('Delete', 'حذف')}</button> : <span />}
          <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={!valid || !!clash} onClick={save}>{tr('Save', 'حفظ')}</Btn></div>
        </div>
      </div>
    </Modal>
  )
}

export default function Appointments() {
  const tr = useTr()
  const { lang } = useLang()
  const [date, setDate] = useState(todayISO())
  const [view, setView] = useState<'day' | 'list'>('day')
  const [draft, setDraft] = useState<Draft | null>(null)
  const appts = useDB((d) => d.appointments)
  const patients = useDB((d) => d.patients)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const resources = useDB((d) => d.resources)
  const [docFilter, setDocFilter] = useState(0)

  const day = useMemo(() => appts.filter((a) => a.date === date && (!docFilter || a.doctor_id === docFilter)), [appts, date, docFilter])
  const upcoming = useMemo(() => appts.filter((a) => a.date >= todayISO() && LIVE(a.status) && (!docFilter || a.doctor_id === docFilter)).sort((a, b) => a.date.localeCompare(b.date) || startOf(a) - startOf(b)).slice(0, 60), [appts, docFilter])
  const pName = (id: number) => patients.find((p) => p.id === id)?.name ?? '—'
  const sNames = (ids: number[]) => ids.map((id) => { const s = services.find((x) => x.id === id); return s ? loc(s, 'name', lang) : '' }).join(' + ')
  const doc = (id: number) => doctors.find((d) => d.id === id)
  const isFriday = new Date(date + 'T00:00:00').getDay() === 5
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i)
  const blank = (start = 16 * 60, resource_id = 1) => blankDraft({ date, start, resource_id, doctor_id: docFilter || doctors[0]?.id || 1 })
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <>
      <PageHeader
        title={tr('Appointments', 'المواعيد')}
        sub={fmtDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={<>
          <div className="flex rounded-full bg-white p-1 text-sm shadow-sm">{(['day', 'list'] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 ${view === v ? 'bg-deep text-ivory' : 'text-stone'}`}>{v === 'day' ? tr('Day', 'يوم') : tr('Upcoming', 'القادمة')}</button>)}</div>
          <select value={docFilter} onChange={(e) => setDocFilter(Number(e.target.value))} className={inputCls + ' !w-auto !rounded-full'}><option value={0}>{tr('All doctors', 'كل الأطباء')}</option>{doctors.map((d) => <option key={d.id} value={d.id}>{doctorName(d, lang)}</option>)}</select>
          <Btn onClick={() => setDraft(blank())}><Plus className="size-4" />{tr('New', 'جديد')}</Btn>
        </>}
      />

      {view === 'day' ? (
        <Card className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-deep/5 p-4">
            <button onClick={() => setDate(addDays(date, -1))} className="grid size-9 place-items-center rounded-full border border-deep/10" aria-label="Previous"><ChevronLeft className="size-4 rtl:-scale-x-100" /></button>
            <button onClick={() => setDate(todayISO())} className="rounded-full border border-deep/10 px-4 py-1.5 text-sm">{tr('Today', 'النهارده')}</button>
            <button onClick={() => setDate(addDays(date, 1))} className="grid size-9 place-items-center rounded-full border border-deep/10" aria-label="Next"><ChevronRight className="size-4 rtl:-scale-x-100" /></button>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputCls + ' !w-auto'} />
            <span className="ms-auto text-sm text-stone">{day.filter((a) => LIVE(a.status)).length} {tr('visits', 'زيارة')}</span>
          </div>
          {isFriday ? <p className="p-16 text-center text-stone">{tr('Friday — clinic closed.', 'الجمعة — العيادة إجازة.')}</p> : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `4rem repeat(${resources.length}, 1fr)` }}>
                <div />
                {resources.map((r) => <div key={r.id} className="border-s border-deep/5 px-4 py-3 text-xs font-medium text-stone">{loc(r, 'name', lang)}</div>)}
                <div className="relative" style={{ height: (END - START) * PX }}>
                  {hours.map((h) => <span key={h} className="absolute end-2 -translate-y-1/2 text-[0.7rem] text-stone tabular-nums" style={{ top: (h * 60 - START) * PX }} dir="ltr">{h > 12 ? h - 12 : h}{h >= 12 ? 'pm' : 'am'}</span>)}
                </div>
                {resources.map((r) => (
                  <div key={r.id} className="relative border-s border-deep/5" style={{ height: (END - START) * PX }}
                    onDoubleClick={(e) => { const m = Math.floor((START + e.nativeEvent.offsetY / PX) / 15) * 15; setDraft(blank(m, r.id)) }}>
                    {hours.map((h) => <div key={h} className="absolute inset-x-0 border-t border-deep/5" style={{ top: (h * 60 - START) * PX }} />)}
                    {date === todayISO() && nowMin > START && nowMin < END && <div className="absolute inset-x-0 z-10 border-t-2 border-emerald" style={{ top: (nowMin - START) * PX }} />}
                    {day.filter((a) => a.resource_id === r.id).map((a) => {
                      const d = doc(a.doctor_id), s = startOf(a), mins = endOf(a) - s
                      return (
                        <button key={a.id} onClick={() => setDraft(a)} className={`absolute inset-x-1.5 overflow-hidden rounded-xl border-s-4 bg-white p-2 text-start shadow-sm transition-shadow hover:shadow-md ${LIVE(a.status) ? '' : 'opacity-40'}`}
                          style={{ top: (s - START) * PX + 1, height: mins * PX - 2, borderColor: d?.color }}>
                          <div className="flex items-start justify-between gap-1">
                            <p className="truncate text-xs font-semibold text-deep">{pName(a.patient_id)}</p>
                            <span className="text-[0.65rem] text-stone tabular-nums" dir="ltr">{a.from_time}</span>
                          </div>
                          <p className="truncate text-[0.7rem] text-stone">{sNames(a.service_ids)}</p>
                          {mins >= 45 && <div className="mt-1"><ApptBadge s={a.status} /></div>}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="border-t border-deep/5 px-4 py-2.5 text-xs text-stone">{tr('Tip: double-click an empty slot to book it.', 'نصيحة: دبل كليك على أي مكان فاضي علشان تحجزه.')}</p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Date', 'التاريخ'), tr('Patient', 'المريض'), tr('Services', 'الخدمات'), tr('Doctor', 'الدكتور'), tr('Source', 'المصدر'), tr('Status', 'الحالة')].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-deep/5">
              {upcoming.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => setDraft(a)}>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · <span dir="ltr">{a.from_time} {a.from_time_type}</span></td>
                  <td className="px-4 py-3"><Link onClick={(e) => e.stopPropagation()} to={`/dashboard/patients/${a.patient_id}`} className="font-medium text-deep hover:text-emerald">{pName(a.patient_id)}</Link></td>
                  <td className="px-4 py-3 text-charcoal/80">{sNames(a.service_ids)}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: doc(a.doctor_id)?.color }} />{doc(a.doctor_id) ? doctorName(doc(a.doctor_id)!, lang) : ''}</span></td>
                  <td className="px-4 py-3 text-xs text-stone">{a.source}</td>
                  <td className="px-4 py-3"><ApptBadge s={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {draft && <AppointmentModal key={(draft.id ?? 'new') + draft.from_time + draft.resource_id} draft={draft} onClose={() => setDraft(null)} />}
    </>
  )
}
