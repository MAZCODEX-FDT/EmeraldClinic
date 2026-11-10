import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, nextId, todayISO, loc, doctorName, mainBranch, type Doctor, type WeekDay } from '@/lib/store'
import { toMinutes, fromMinutes, to24, from24 } from '@/lib/mazmed/time'
import { PageHeader, Card, Modal, Field, inputCls, Btn, Toggle, useTr } from '../ui'

const DAYS = [6, 0, 1, 2, 3, 4, 5] // Sat → Fri, MazMed day_of_week (0 = Sunday)
const initials = (n: string) => n.replace(/^Dr\.?\s*/i, '').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()

/** MazMed Doctors: profile, specialisations, services, weekly hours (WeekDay) and session gap. */
export default function DoctorsAdmin() {
  const tr = useTr()
  const { lang } = useLang()
  const doctors = useDB((d) => d.doctors)
  const services = useDB((d) => d.services)
  const specs = useDB((d) => d.specializations)
  const appts = useDB((d) => d.appointments)
  const branch = useDB(mainBranch)
  const [edit, setEdit] = useState<Doctor | null>(null)
  const dayName = (n: number) => new Date(2026, 10, 1 + n).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short' }) // 1 Nov 2026 is a Sunday
  const save = () => { if (!edit) return; db.set((d) => { const i = d.doctors.findIndex((x) => x.id === edit.id); if (i >= 0) d.doctors[i] = edit; else d.doctors.push(edit) }); setEdit(null) }
  const patch = (id: number, p: Partial<Doctor>) => db.set((x) => { const y = x.doctors.find((z) => z.id === id); if (y) Object.assign(y, p) })
  const blank = (): Doctor => ({
    id: nextId(doctors), user: { full_name: '', profile_image: null, status: 1 }, full_name_ar: '', title: '', slug: '', bio: '', bio_ar: '', experience: '', specialization_ids: [], service_ids: [], languages: ['ar', 'en'],
    show_on_website: false, accepts_new_patients: true, online_booking: true, sort_order: doctors.length + 1, color: '#1F7A5C', session_gap: 30, week_days: [],
  })
  const toggleList = (k: 'service_ids' | 'specialization_ids', id: number) => edit && setEdit({ ...edit, [k]: edit[k].includes(id) ? edit[k].filter((x) => x !== id) : [...edit[k], id] })
  const dayOf = (n: number) => edit?.week_days.find((w) => w.day_of_week === n)
  const setDay = (n: number, w: WeekDay | null) => edit && setEdit({ ...edit, week_days: [...edit.week_days.filter((x) => x.day_of_week !== n), ...(w ? [w] : [])].sort((a, b) => a.day_of_week - b.day_of_week) })
  const fmt = (w: WeekDay) => `${w.start_time.replace(/^0/, '')}${w.start_time_type.toLowerCase()}–${w.end_time.replace(/^0/, '')}${w.end_time_type.toLowerCase()}`

  return (
    <>
      <PageHeader title={tr('Doctors', 'الأطباء')} sub={tr('MazMed doctor profiles — shown on the website and used for online booking slots.', 'بروفايلات الأطباء في MazMed — بتظهر على الموقع وبتحدد مواعيد الحجز أونلاين.')} actions={<Btn onClick={() => setEdit(blank())}><Plus className="size-4" />{tr('Add doctor', 'ضيف دكتور')}</Btn>} />
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((d) => {
          const today = appts.filter((a) => a.doctor_id === d.id && a.date === todayISO() && !a.status.startsWith('cancelled')).length
          return (
            <Card key={d.id}>
              <div className="flex items-start gap-4">
                {d.user.profile_image ? <img src={d.user.profile_image} alt="" className="size-16 shrink-0 rounded-2xl bg-mist object-cover object-top" /> : <span className="font-display grid size-16 shrink-0 place-items-center rounded-2xl text-xl text-ivory" style={{ background: `linear-gradient(160deg, ${d.color}, #093629)` }}>{initials(d.user.full_name)}</span>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-display text-lg font-semibold text-deep">{doctorName(d, lang) || '—'}</p><p className="text-sm text-stone">{d.specialization_ids.map((id) => specs.find((s) => s.id === id)).filter(Boolean).map((s) => loc(s!, 'name', lang)).join(' · ')}</p></div>
                    <button onClick={() => setEdit(structuredClone(d))} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-deep/5" aria-label="Edit"><Pencil className="size-3.5" /></button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">{DAYS.map((n) => { const w = d.week_days.find((x) => x.day_of_week === n); return <span key={n} title={w ? fmt(w) : ''} className={`rounded-md px-2 py-0.5 text-[0.7rem] ${w ? 'bg-deep text-ivory' : 'bg-ivory text-stone'}`}>{dayName(n)}</span> })}</div>
                  <p className="mt-3 text-xs text-stone">{today} {tr('visits today', 'زيارات النهارده')} · {d.service_ids.length} {tr('services', 'خدمات')} · {d.session_gap}′ {tr('slots', 'مواعيد')}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-charcoal">
                    <label className="flex items-center gap-2"><Toggle on={d.show_on_website} label="Website" onChange={(v) => patch(d.id, { show_on_website: v })} />{tr('Website', 'الموقع')}</label>
                    <label className="flex items-center gap-2"><Toggle on={d.online_booking} label="Online booking" onChange={(v) => patch(d.id, { online_booking: v })} />{tr('Online booking', 'حجز أونلاين')}</label>
                    <label className="flex items-center gap-2"><Toggle on={d.accepts_new_patients} label="New patients" onChange={(v) => patch(d.id, { accepts_new_patients: v })} />{tr('New patients', 'مرضى جدد')}</label>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={tr('Doctor profile', 'بروفايل الدكتور')} wide>
        {edit && (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Full name (EN)"><input className={inputCls} value={edit.user.full_name} onChange={(e) => setEdit({ ...edit, user: { ...edit.user, full_name: e.target.value } })} /></Field>
              <Field label="الاسم (AR)"><input dir="rtl" className={inputCls} value={edit.full_name_ar} onChange={(e) => setEdit({ ...edit, full_name_ar: e.target.value })} /></Field>
              <Field label="Bio (EN)"><textarea rows={3} className={inputCls} value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} /></Field>
              <Field label="نبذة (AR)"><textarea rows={3} dir="rtl" className={inputCls} value={edit.bio_ar} onChange={(e) => setEdit({ ...edit, bio_ar: e.target.value })} /></Field>
              <Field label={tr('Title', 'اللقب')}><input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
              <Field label={tr('Photo URL', 'رابط الصورة')}><input dir="ltr" className={inputCls} value={edit.user.profile_image ?? ''} onChange={(e) => setEdit({ ...edit, user: { ...edit.user, profile_image: e.target.value || null } })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label={tr('Years of experience', 'سنين الخبرة')}><input className={inputCls} value={edit.experience} onChange={(e) => setEdit({ ...edit, experience: e.target.value })} /></Field>
              <Field label={tr('Session gap (min)', 'مدة الموعد (دقيقة)')}><select className={inputCls} value={edit.session_gap} onChange={(e) => setEdit({ ...edit, session_gap: Number(e.target.value) })}>{[15, 20, 30, 45, 60].map((n) => <option key={n}>{n}</option>)}</select></Field>
              <Field label={tr('Calendar colour', 'لون الجدول')}>
                <div className="flex gap-1.5 pt-1">{['#0E4D3C', '#1F7A5C', '#125A47', '#2B2F2E'].map((c) => <button key={c} onClick={() => setEdit({ ...edit, color: c })} className={`size-8 rounded-full ${edit.color === c ? 'ring-2 ring-emerald ring-offset-2' : ''}`} style={{ background: c }} aria-label={c} />)}</div>
              </Field>
            </div>
            <Field label={tr('Working hours', 'مواعيد العمل')}>
              <div className="grid gap-1.5">
                {DAYS.map((n) => {
                  const w = dayOf(n)
                  const s = w ? toMinutes(w.start_time, w.start_time_type) : 12 * 60, e = w ? toMinutes(w.end_time, w.end_time_type) : 22 * 60
                  const put = (a: number, b: number) => { const f = fromMinutes(a), t = fromMinutes(b); setDay(n, { day_of_week: n, start_time: f.time, start_time_type: f.type, end_time: t.time, end_time_type: t.type, branch_id: w?.branch_id ?? branch?.id ?? null }) }
                  return (
                    <div key={n} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-2 text-sm">
                      <Toggle on={!!w} label={dayName(n)} onChange={(v) => v ? put(s, e) : setDay(n, null)} />
                      <span className="w-12">{dayName(n)}</span>
                      {w ? <>
                        <input type="time" step={900} className={inputCls + ' !w-auto !py-1.5'} value={to24(s)} onChange={(ev) => ev.target.value && put(from24(ev.target.value), e)} />
                        <span className="text-stone">–</span>
                        <input type="time" step={900} className={inputCls + ' !w-auto !py-1.5'} value={to24(e)} onChange={(ev) => ev.target.value && put(s, from24(ev.target.value))} />
                      </> : <span className="text-xs text-stone">{tr('Off', 'إجازة')}</span>}
                    </div>
                  )
                })}
              </div>
            </Field>
            <Field label={tr('Specialisations', 'التخصصات')}>
              <div className="flex flex-wrap gap-1.5">{specs.map((s) => <button key={s.id} onClick={() => toggleList('specialization_ids', s.id)} className={`rounded-full border px-3 py-1.5 text-xs ${edit.specialization_ids.includes(s.id) ? 'border-emerald bg-jade/50 text-deep' : 'border-deep/10'}`}>{loc(s, 'name', lang)}</button>)}</div>
            </Field>
            <Field label={tr('Services this doctor offers', 'الخدمات اللي بيقدمها')}>
              <div className="flex flex-wrap gap-1.5">{services.map((s) => <button key={s.id} onClick={() => toggleList('service_ids', s.id)} className={`rounded-full border px-3 py-1.5 text-xs ${edit.service_ids.includes(s.id) ? 'border-emerald bg-jade/50 text-deep' : 'border-deep/10'}`}>{loc(s, 'name', lang)}</button>)}</div>
            </Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={!edit.user.full_name.trim()} onClick={() => { if (!edit.slug) edit.slug = edit.user.full_name.toLowerCase().replace(/^dr\.?\s*/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); save() }}>{tr('Save', 'حفظ')}</Btn></div>
          </div>
        )}
      </Modal>
    </>
  )
}
