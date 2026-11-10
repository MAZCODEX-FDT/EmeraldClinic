import { useState } from 'react'
import { Star, Plus, Trash2, QrCode } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, nextId, todayISO, loc, doctorName } from '@/lib/store'
import { PageHeader, Card, Toggle, Btn, Modal, Field, inputCls, useTr, fmtDate } from '../ui'

export default function ReviewsAdmin() {
  const tr = useTr()
  const { lang } = useLang()
  const reviews = useDB((d) => d.reviews)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ name: '', text: '', rating: 5, service_id: 0, doctor_id: 0 })
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'
  return (
    <>
      <PageHeader title={tr('Reviews', 'التقييمات')} sub={tr('Choose which real patient reviews appear on the website.', 'اختار أنهي تقييمات حقيقية تظهر على الموقع.')} actions={<Btn onClick={() => setOpen(true)}><Plus className="size-4" />{tr('Add review', 'ضيف تقييم')}</Btn>} />
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card className="!bg-deep !border-deep text-ivory"><p className="text-xs text-jade">{tr('Average rating', 'متوسط التقييم')}</p><p className="font-display mt-2 text-4xl font-semibold">{avg}</p></Card>
        <Card><p className="text-xs text-stone">{tr('Shown on website', 'ظاهرة على الموقع')}</p><p className="font-display mt-2 text-4xl font-semibold text-deep">{reviews.filter((r) => r.is_published).length}</p></Card>
        <Card className="flex items-center gap-4"><QrCode className="size-10 text-emerald" /><p className="text-sm text-charcoal/80">{tr('Ask happy patients to review you on Google with the reception QR stand.', 'اطلب من المرضى المبسوطين يقيّموا على جوجل من ستاند الـQR في الريسبشن.')}</p></Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.map((r) => (
          <Card key={r.id} className={r.is_published ? '' : 'opacity-60'}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-medium text-deep">{r.name}</p><div className="mt-1 flex gap-0.5 text-emerald">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-3.5 ${i < r.rating ? 'fill-current' : 'opacity-30'}`} />)}</div></div>
              <div className="flex items-center gap-2"><Toggle on={r.is_published} label="Published" onChange={(v) => db.set((d) => { const x = d.reviews.find((y) => y.id === r.id); if (x) x.is_published = v })} />
                <button onClick={() => db.set((d) => { d.reviews = d.reviews.filter((y) => y.id !== r.id) })} className="text-stone hover:text-charcoal" aria-label="Delete"><Trash2 className="size-4" /></button></div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/85" dir={/[؀-ۿ]/.test(r.review) ? 'rtl' : 'ltr'}>{r.review}</p>
            <p className="mt-3 text-xs text-stone">{fmtDate(r.created_at, lang)}{r.service_id && services.find((s) => s.id === r.service_id) && ' · ' + loc(services.find((s) => s.id === r.service_id)!, 'name', lang)}{r.doctor_id && doctors.find((d) => d.id === r.doctor_id) && ' · ' + doctorName(doctors.find((d) => d.id === r.doctor_id)!, lang)}</p>
            <textarea rows={1} placeholder={tr('Clinic reply (optional)', 'رد العيادة (اختياري)')} value={r.reply ?? ''} onChange={(e) => db.set((d) => { const x = d.reviews.find((y) => y.id === r.id); if (x) x.reply = e.target.value || null })} className="mt-3 w-full resize-none rounded-xl border border-deep/10 bg-ivory px-3 py-2 text-xs outline-none focus:border-emerald" />
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={tr('Add review', 'ضيف تقييم')}>
        <div className="grid gap-3">
          <Field label={tr('Patient name (as they agreed to show it)', 'اسم المريض (زي ما وافق يظهر)')}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label={tr('Review', 'التقييم')}><textarea rows={3} className={inputCls} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={tr('Rating', 'النجوم')}><select className={inputCls} value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })}>{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></Field>
            <Field label={tr('Service', 'الخدمة')}><select className={inputCls} value={f.service_id} onChange={(e) => setF({ ...f, service_id: Number(e.target.value) })}><option value={0}>—</option>{services.map((s) => <option key={s.id} value={s.id}>{loc(s, 'name', lang)}</option>)}</select></Field>
          </div>
          <div>
            <Field label={tr('Doctor', 'الدكتور')}><select className={inputCls} value={f.doctor_id} onChange={(e) => setF({ ...f, doctor_id: Number(e.target.value) })}><option value={0}>—</option>{doctors.map((d) => <option key={d.id} value={d.id}>{doctorName(d, lang)}</option>)}</select></Field>
          </div>
          <div className="mt-2 flex justify-end gap-2"><Btn variant="ghost" onClick={() => setOpen(false)}>{tr('Cancel', 'إلغاء')}</Btn>
            <Btn disabled={!f.name || !f.text} onClick={() => { db.set((d) => { d.reviews.unshift({ id: nextId(d.reviews), patient_id: null, name: f.name, review: f.text, rating: f.rating, service_id: f.service_id || null, doctor_id: f.doctor_id || null, is_published: true, reply: null, created_at: todayISO() }) }); setOpen(false); setF({ name: '', text: '', rating: 5, service_id: 0, doctor_id: 0 }) }}>{tr('Save', 'حفظ')}</Btn></div>
        </div>
      </Modal>
    </>
  )
}
