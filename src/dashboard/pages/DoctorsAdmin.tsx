import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, uid, todayISO, type Doctor } from '@/lib/store'
import { PageHeader, Card, Modal, Field, inputCls, Btn, Toggle, useTr } from '../ui'

const DAYS = [6, 0, 1, 2, 3, 4]
export default function DoctorsAdmin() {
  const tr = useTr()
  const { lang, pick } = useLang()
  const doctors = useDB((d) => d.doctors)
  const services = useDB((d) => d.services)
  const appts = useDB((d) => d.appointments)
  const [edit, setEdit] = useState<Doctor | null>(null)
  const dayName = (n: number) => new Date(2026, 10, 1 + ((n - 0 + 7) % 7)).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short' })
  const save = () => { if (!edit) return; db.set((d) => { const i = d.doctors.findIndex((x) => x.id === edit.id); if (i >= 0) d.doctors[i] = edit; else d.doctors.push(edit) }); setEdit(null) }
  const blank = (): Doctor => ({ id: uid('d-'), name: { en: '', ar: '' }, role: { en: '', ar: '' }, bio: { en: '', ar: '' }, initials: '', services: [], days: [6, 0, 1, 2, 3], color: '#1F7A5C', visible: false, years: 1 })

  return (
    <>
      <PageHeader title={tr('Doctors', 'الأطباء')} sub={tr('Profiles shown on the website and used for scheduling.', 'البروفايلات اللي بتظهر على الموقع وبتستخدم في الجدول.')} actions={<Btn onClick={() => setEdit(blank())}><Plus className="size-4" />{tr('Add doctor', 'ضيف دكتور')}</Btn>} />
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((d) => {
          const today = appts.filter((a) => a.doctorId === d.id && a.date === todayISO() && a.status !== 'cancelled').length
          return (
            <Card key={d.id}>
              <div className="flex items-start gap-4">
                <span className="font-display grid size-16 shrink-0 place-items-center rounded-2xl text-xl text-ivory" style={{ background: `linear-gradient(160deg, ${d.color}, #093629)` }}>{d.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-display text-lg font-semibold text-deep">{pick(d.name) || '—'}</p><p className="text-sm text-stone">{pick(d.role)}</p></div>
                    <div className="flex items-center gap-2"><Toggle on={d.visible} label="Visible" onChange={(v) => db.set((x) => { const y = x.doctors.find((z) => z.id === d.id); if (y) y.visible = v })} /><button onClick={() => setEdit(structuredClone(d))} className="grid size-8 place-items-center rounded-full hover:bg-deep/5" aria-label="Edit"><Pencil className="size-3.5" /></button></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">{DAYS.map((n) => <span key={n} className={`rounded-md px-2 py-0.5 text-[0.7rem] ${d.days.includes(n) ? 'bg-deep text-ivory' : 'bg-ivory text-stone'}`}>{dayName(n)}</span>)}</div>
                  <p className="mt-3 text-xs text-stone">{today} {tr('visits today', 'زيارات النهارده')} · {d.services.length} {tr('treatments', 'علاجات')}</p>
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
              {(['name', 'role', 'bio'] as const).map((k) => (['en', 'ar'] as const).map((l) => (
                <Field key={k + l} label={`${k} (${l.toUpperCase()})`}>
                  {k === 'bio' ? <textarea rows={3} dir={l === 'ar' ? 'rtl' : 'ltr'} className={inputCls} value={edit[k][l]} onChange={(e) => setEdit({ ...edit, [k]: { ...edit[k], [l]: e.target.value } })} />
                    : <input dir={l === 'ar' ? 'rtl' : 'ltr'} className={inputCls} value={edit[k][l]} onChange={(e) => setEdit({ ...edit, [k]: { ...edit[k], [l]: e.target.value } })} />}
                </Field>
              )))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label={tr('Initials', 'الحروف')}><input maxLength={3} className={inputCls} value={edit.initials} onChange={(e) => setEdit({ ...edit, initials: e.target.value.toUpperCase() })} /></Field>
              <Field label={tr('Years', 'سنين الخبرة')}><input type="number" className={inputCls} value={edit.years} onChange={(e) => setEdit({ ...edit, years: Number(e.target.value) })} /></Field>
              <Field label={tr('Card colour', 'لون الكارت')}>
                <div className="flex gap-1.5 pt-1">{['#0E4D3C', '#1F7A5C', '#125A47', '#2B2F2E'].map((c) => <button key={c} onClick={() => setEdit({ ...edit, color: c })} className={`size-8 rounded-full ${edit.color === c ? 'ring-2 ring-emerald ring-offset-2' : ''}`} style={{ background: c }} aria-label={c} />)}</div>
              </Field>
            </div>
            <Field label={tr('Working days', 'أيام العمل')}>
              <div className="flex flex-wrap gap-1.5">{DAYS.map((n) => <button key={n} onClick={() => setEdit({ ...edit, days: edit.days.includes(n) ? edit.days.filter((x) => x !== n) : [...edit.days, n] })} className={`rounded-lg border px-3 py-1.5 text-xs ${edit.days.includes(n) ? 'border-deep bg-deep text-ivory' : 'border-deep/10'}`}>{dayName(n)}</button>)}</div>
            </Field>
            <Field label={tr('Treatments', 'العلاجات')}>
              <div className="flex flex-wrap gap-1.5">{services.map((s) => <button key={s.id} onClick={() => setEdit({ ...edit, services: edit.services.includes(s.id) ? edit.services.filter((x) => x !== s.id) : [...edit.services, s.id] })} className={`rounded-full border px-3 py-1.5 text-xs ${edit.services.includes(s.id) ? 'border-emerald bg-jade/50 text-deep' : 'border-deep/10'}`}>{pick(s.name)}</button>)}</div>
            </Field>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={!edit.name.en && !edit.name.ar} onClick={save}>{tr('Save', 'حفظ')}</Btn></div>
          </div>
        )}
      </Modal>
    </>
  )
}
