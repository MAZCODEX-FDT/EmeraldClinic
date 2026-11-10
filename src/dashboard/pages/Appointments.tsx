import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, todayISO, addDays, uid, type Appointment, type ApptStatus } from '@/lib/store'
import { PageHeader, Btn, Card, ApptBadge, Modal, Field, inputCls, useTr, fmtDate, apptLabel } from '../ui'

const START = 12 * 60
const END = 22 * 60
const PX = 1.4 // px per minute
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const STATUSES: ApptStatus[] = ['booked', 'confirmed', 'arrived', 'in-chair', 'done', 'no-show', 'cancelled']

export type Draft = Omit<Appointment, 'id'> & { id?: string; newPatient?: { name: string; phone: string } }

export function conflict(appts: Appointment[], a: Draft) {
  const s = toMin(a.time), e = s + a.duration
  return appts.find((x) => x.id !== a.id && x.date === a.date && x.chair === a.chair && x.status !== 'cancelled' && toMin(x.time) < e && toMin(x.time) + x.duration > s)
}

export function AppointmentModal({ draft, onClose, onSaved }: { draft: Draft | null; onClose: () => void; onSaved?: (id: string) => void }) {
  const tr = useTr()
  const { pick, lang } = useLang()
  const patients = useDB((d) => d.patients)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const appts = useDB((d) => d.appointments)
  const chairs = useDB((d) => d.settings.chairs)
  const [f, setF] = useState<Draft | null>(draft)
  const [mode, setMode] = useState<'existing' | 'new'>(draft?.newPatient ? 'new' : 'existing')
  if (!draft || !f) return null
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF({ ...f, [k]: v })
  const clash = conflict(appts, f)
  const valid = (mode === 'existing' ? !!f.patientId : (f.newPatient?.name.trim().length ?? 0) > 2) && f.serviceId && f.doctorId && f.date && f.time

  const save = () => {
    const id = f.id ?? uid('a-')
    db.set((d) => {
      let patientId = f.patientId
      if (mode === 'new' && f.newPatient) {
        patientId = uid('p-')
        d.patients.unshift({ id: patientId, name: f.newPatient.name.trim(), phone: f.newPatient.phone.trim(), gender: 'm', dob: '', notes: '', createdAt: todayISO(), teeth: {}, plan: [], planApproved: false, tags: ['new'] })
      }
      const rec: Appointment = { id, patientId, doctorId: f.doctorId, serviceId: f.serviceId, date: f.date, time: f.time, duration: f.duration, chair: f.chair, status: f.status, notes: f.notes }
      const i = d.appointments.findIndex((x) => x.id === id)
      if (i >= 0) d.appointments[i] = rec; else d.appointments.push(rec)
    })
    onSaved?.(id)
    onClose()
  }
  const remove = () => { if (f.id && confirm(tr('Delete this appointment?', 'تحذف الميعاد ده؟'))) { db.set((d) => { d.appointments = d.appointments.filter((x) => x.id !== f.id) }); onClose() } }

  return (
    <Modal open onClose={onClose} title={f.id ? tr('Edit appointment', 'تعديل ميعاد') : tr('New appointment', 'ميعاد جديد')}>
      <div className="grid gap-4">
        {!f.id && (
          <div className="flex gap-1 rounded-full bg-deep/5 p-1 text-sm">
            {(['existing', 'new'] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-full py-2 ${mode === m ? 'bg-white text-deep shadow' : 'text-stone'}`}>{m === 'existing' ? tr('Existing patient', 'مريض مسجل') : tr('New patient', 'مريض جديد')}</button>)}
          </div>
        )}
        {mode === 'existing' || f.id ? (
          <Field label={tr('Patient', 'المريض')}>
            <select className={inputCls} value={f.patientId} onChange={(e) => set('patientId', e.target.value)}>
              <option value="">—</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.phone}</option>)}
            </select>
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr('Name', 'الاسم')}><input className={inputCls} value={f.newPatient?.name ?? ''} onChange={(e) => set('newPatient', { name: e.target.value, phone: f.newPatient?.phone ?? '' })} /></Field>
            <Field label={tr('Phone', 'الموبايل')}><input className={inputCls} dir="ltr" value={f.newPatient?.phone ?? ''} onChange={(e) => set('newPatient', { name: f.newPatient?.name ?? '', phone: e.target.value })} /></Field>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label={tr('Treatment', 'العلاج')}>
            <select className={inputCls} value={f.serviceId} onChange={(e) => { const s = services.find((x) => x.id === e.target.value); setF({ ...f, serviceId: e.target.value, duration: s?.duration ?? f.duration }) }}>
              <option value="">—</option>{services.map((s) => <option key={s.id} value={s.id}>{pick(s.name)}</option>)}
            </select>
          </Field>
          <Field label={tr('Doctor', 'الدكتور')}>
            <select className={inputCls} value={f.doctorId} onChange={(e) => set('doctorId', e.target.value)}>
              <option value="">—</option>{doctors.map((d) => <option key={d.id} value={d.id}>{pick(d.name)}</option>)}
            </select>
          </Field>
          <Field label={tr('Date', 'التاريخ')}><input type="date" className={inputCls} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
          <Field label={tr('Time', 'الوقت')}><input type="time" step={900} min="12:00" max="21:45" className={inputCls} value={f.time} onChange={(e) => set('time', e.target.value)} /></Field>
          <Field label={tr('Duration (min)', 'المدة (دقيقة)')}><input type="number" min={15} step={15} className={inputCls} value={f.duration} onChange={(e) => set('duration', Number(e.target.value))} /></Field>
          <Field label={tr('Chair', 'الكرسي')}>
            <select className={inputCls} value={f.chair} onChange={(e) => set('chair', Number(e.target.value))}>{Array.from({ length: chairs }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select>
          </Field>
        </div>
        <Field label={tr('Status', 'الحالة')}>
          <div className="flex flex-wrap gap-1.5">{STATUSES.map((s) => <button key={s} onClick={() => set('status', s)} className={`rounded-full border px-3 py-1.5 text-xs ${f.status === s ? 'border-deep bg-deep text-ivory' : 'border-deep/10 text-charcoal'}`}>{apptLabel(s, lang === 'ar')}</button>)}</div>
        </Field>
        <Field label={tr('Notes', 'ملاحظات')}><textarea rows={2} className={inputCls} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        {clash && <p className="rounded-xl bg-beige px-3 py-2 text-xs text-charcoal">⚠ {tr('Chair already booked at this time.', 'الكرسي محجوز في الوقت ده.')} ({clash.time})</p>}
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
  const { lang, pick } = useLang()
  const [date, setDate] = useState(todayISO())
  const [view, setView] = useState<'day' | 'list'>('day')
  const [draft, setDraft] = useState<Draft | null>(null)
  const appts = useDB((d) => d.appointments)
  const patients = useDB((d) => d.patients)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const chairs = useDB((d) => d.settings.chairs)
  const [docFilter, setDocFilter] = useState('')

  const day = useMemo(() => appts.filter((a) => a.date === date && (!docFilter || a.doctorId === docFilter)), [appts, date, docFilter])
  const upcoming = useMemo(() => appts.filter((a) => a.date >= todayISO() && a.status !== 'cancelled' && (!docFilter || a.doctorId === docFilter)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 60), [appts, docFilter])
  const pName = (id: string) => patients.find((p) => p.id === id)?.name ?? '—'
  const sName = (id: string) => { const s = services.find((x) => x.id === id); return s ? pick(s.name) : '' }
  const doc = (id: string) => doctors.find((d) => d.id === id)
  const isFriday = new Date(date + 'T00:00:00').getDay() === 5
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START / 60 + i)

  const blank = (time = '16:00', chair = 1): Draft => ({ patientId: '', doctorId: docFilter || doctors[0]?.id || '', serviceId: '', date, time, duration: 45, chair, status: 'booked', notes: '' })
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <>
      <PageHeader
        title={tr('Appointments', 'المواعيد')}
        sub={fmtDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={<>
          <div className="flex rounded-full bg-white p-1 text-sm shadow-sm">{(['day', 'list'] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 ${view === v ? 'bg-deep text-ivory' : 'text-stone'}`}>{v === 'day' ? tr('Day', 'يوم') : tr('Upcoming', 'القادمة')}</button>)}</div>
          <select value={docFilter} onChange={(e) => setDocFilter(e.target.value)} className={inputCls + ' !w-auto !rounded-full'}><option value="">{tr('All doctors', 'كل الأطباء')}</option>{doctors.map((d) => <option key={d.id} value={d.id}>{pick(d.name)}</option>)}</select>
          <Btn onClick={() => setDraft(blank())}><Plus className="size-4" />{tr('New', 'جديد')}</Btn>
        </>}
      />

      {view === 'day' ? (
        <Card className="!p-0 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-deep/5 p-4">
            <button onClick={() => setDate(addDays(date, -1))} className="grid size-9 place-items-center rounded-full border border-deep/10" aria-label="Previous"><ChevronLeft className="size-4 rtl:-scale-x-100" /></button>
            <button onClick={() => setDate(todayISO())} className="rounded-full border border-deep/10 px-4 py-1.5 text-sm">{tr('Today', 'النهارده')}</button>
            <button onClick={() => setDate(addDays(date, 1))} className="grid size-9 place-items-center rounded-full border border-deep/10" aria-label="Next"><ChevronRight className="size-4 rtl:-scale-x-100" /></button>
            <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className={inputCls + ' !w-auto'} />
            <span className="ms-auto text-sm text-stone">{day.filter((a) => a.status !== 'cancelled').length} {tr('visits', 'زيارة')}</span>
          </div>
          {isFriday ? <p className="p-16 text-center text-stone">{tr('Friday — clinic closed.', 'الجمعة — العيادة إجازة.')}</p> : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `4rem repeat(${chairs}, 1fr)` }}>
                <div />
                {Array.from({ length: chairs }, (_, c) => <div key={c} className="border-s border-deep/5 px-4 py-3 text-xs font-medium text-stone">{tr('Chair', 'كرسي')} {c + 1}</div>)}
                <div className="relative" style={{ height: (END - START) * PX }}>
                  {hours.map((h) => <span key={h} className="absolute end-2 -translate-y-1/2 text-[0.7rem] text-stone tabular-nums" style={{ top: (h * 60 - START) * PX }} dir="ltr">{h > 12 ? h - 12 : h}{h >= 12 ? 'pm' : 'am'}</span>)}
                </div>
                {Array.from({ length: chairs }, (_, c) => (
                  <div key={c} className="relative border-s border-deep/5" style={{ height: (END - START) * PX }}
                    onDoubleClick={(e) => { const y = e.nativeEvent.offsetY; const m = Math.floor((START + y / PX) / 15) * 15; setDraft(blank(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, c + 1)) }}>
                    {hours.map((h) => <div key={h} className="absolute inset-x-0 border-t border-deep/5" style={{ top: (h * 60 - START) * PX }} />)}
                    {date === todayISO() && nowMin > START && nowMin < END && <div className="absolute inset-x-0 z-10 border-t-2 border-emerald" style={{ top: (nowMin - START) * PX }} />}
                    {day.filter((a) => a.chair === c + 1).map((a) => {
                      const d = doc(a.doctorId)
                      return (
                        <button key={a.id} onClick={() => setDraft(a)} className={`absolute inset-x-1.5 overflow-hidden rounded-xl border-s-4 bg-white p-2 text-start shadow-sm transition-shadow hover:shadow-md ${a.status === 'cancelled' ? 'opacity-40' : ''}`}
                          style={{ top: (toMin(a.time) - START) * PX + 1, height: a.duration * PX - 2, borderColor: d?.color }}>
                          <div className="flex items-start justify-between gap-1">
                            <p className="truncate text-xs font-semibold text-deep">{pName(a.patientId)}</p>
                            <span className="text-[0.65rem] text-stone tabular-nums" dir="ltr">{a.time}</span>
                          </div>
                          <p className="truncate text-[0.7rem] text-stone">{sName(a.serviceId)}</p>
                          {a.duration >= 45 && <div className="mt-1"><ApptBadge s={a.status} /></div>}
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
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ivory text-xs text-stone"><tr>{[tr('Date', 'التاريخ'), tr('Patient', 'المريض'), tr('Treatment', 'العلاج'), tr('Doctor', 'الدكتور'), tr('Chair', 'الكرسي'), tr('Status', 'الحالة')].map((h) => <th key={h} className="px-4 py-3 text-start font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-deep/5">
              {upcoming.map((a) => (
                <tr key={a.id} className="cursor-pointer hover:bg-ivory/60" onClick={() => setDraft(a)}>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(a.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · <span dir="ltr">{a.time}</span></td>
                  <td className="px-4 py-3"><Link onClick={(e) => e.stopPropagation()} to={`/dashboard/patients/${a.patientId}`} className="font-medium text-deep hover:text-emerald">{pName(a.patientId)}</Link></td>
                  <td className="px-4 py-3 text-charcoal/80">{sName(a.serviceId)}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: doc(a.doctorId)?.color }} />{doc(a.doctorId) ? pick(doc(a.doctorId)!.name) : ''}</span></td>
                  <td className="px-4 py-3">{a.chair}</td>
                  <td className="px-4 py-3"><ApptBadge s={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {draft && <AppointmentModal key={(draft.id ?? 'new') + draft.time + draft.chair} draft={draft} onClose={() => setDraft(null)} />}
    </>
  )
}
