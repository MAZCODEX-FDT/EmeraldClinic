import { useState } from 'react'
import { Pencil, ExternalLink } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { useLang } from '@/lib/i18n'
import { db, useDB, money, type Service } from '@/lib/store'
import { PageHeader, Card, Modal, Field, inputCls, Btn, Toggle, useTr } from '../ui'

export default function ServicesAdmin() {
  const tr = useTr()
  const { lang, pick } = useLang()
  const services = useDB((d) => d.services)
  const [edit, setEdit] = useState<Service | null>(null)
  const save = () => { if (!edit) return; db.set((d) => { const i = d.services.findIndex((s) => s.id === edit.id); if (i >= 0) d.services[i] = edit }); setEdit(null) }
  const bi = (k: 'name' | 'short' | 'long', l: 'en' | 'ar', v: string) => edit && setEdit({ ...edit, [k]: { ...edit[k], [l]: v } })

  return (
    <>
      <PageHeader title={tr('Treatments', 'العلاجات')} sub={tr('Edits here update the website instantly.', 'أي تعديل هنا بيظهر على الموقع فورًا.')} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} className={s.visible ? '' : 'opacity-60'}>
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-xl bg-jade/40 text-deep"><DentalIcon name={s.icon} size={26} /></span>
              <Toggle on={s.visible} label="Visible" onChange={(v) => db.set((d) => { const x = d.services.find((y) => y.id === s.id); if (x) x.visible = v })} />
            </div>
            <p className="font-display mt-4 text-lg font-semibold text-deep">{pick(s.name)}</p>
            <p className="mt-1 line-clamp-2 text-sm text-stone">{pick(s.short)}</p>
            <div className="mt-4 flex items-center justify-between border-t border-deep/5 pt-3 text-xs text-charcoal/70">
              <span>{s.duration} {tr('min', 'دقيقة')} · {money(s.price, lang)}</span>
              <span className="flex gap-1">
                <a href={`/services/${s.slug}`} target="_blank" className="grid size-8 place-items-center rounded-full hover:bg-deep/5" aria-label="Open"><ExternalLink className="size-3.5" /></a>
                <button onClick={() => setEdit(structuredClone(s))} className="grid size-8 place-items-center rounded-full hover:bg-deep/5" aria-label="Edit"><Pencil className="size-3.5" /></button>
              </span>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={tr('Edit treatment', 'تعديل علاج')} wide>
        {edit && (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name (EN)"><input className={inputCls} value={edit.name.en} onChange={(e) => bi('name', 'en', e.target.value)} /></Field>
              <Field label="الاسم (AR)"><input className={inputCls} dir="rtl" value={edit.name.ar} onChange={(e) => bi('name', 'ar', e.target.value)} /></Field>
              <Field label="Short (EN)"><textarea rows={2} className={inputCls} value={edit.short.en} onChange={(e) => bi('short', 'en', e.target.value)} /></Field>
              <Field label="وصف قصير (AR)"><textarea rows={2} dir="rtl" className={inputCls} value={edit.short.ar} onChange={(e) => bi('short', 'ar', e.target.value)} /></Field>
              <Field label="Details (EN)"><textarea rows={4} className={inputCls} value={edit.long.en} onChange={(e) => bi('long', 'en', e.target.value)} /></Field>
              <Field label="التفاصيل (AR)"><textarea rows={4} dir="rtl" className={inputCls} value={edit.long.ar} onChange={(e) => bi('long', 'ar', e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Field label={tr('Chair time (min)', 'مدة الجلسة')}><input type="number" className={inputCls} value={edit.duration} onChange={(e) => setEdit({ ...edit, duration: Number(e.target.value) })} /></Field>
              <Field label={tr('Base price (EGP, internal)', 'السعر الأساسي (داخلي)')}><input type="number" className={inputCls} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
              <Field label={tr('Visits (EN / AR)', 'الزيارات')}><div className="flex gap-1"><input className={inputCls} value={edit.sessions.en} onChange={(e) => setEdit({ ...edit, sessions: { ...edit.sessions, en: e.target.value } })} /><input dir="rtl" className={inputCls} value={edit.sessions.ar} onChange={(e) => setEdit({ ...edit, sessions: { ...edit.sessions, ar: e.target.value } })} /></div></Field>
            </div>
            <p className="text-xs text-stone">{tr('Prices are only used inside treatment plans — the website never shows prices or offers.', 'الأسعار بتستخدم جوه خطط العلاج بس — الموقع مش بيعرض أسعار أو عروض.')}</p>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>{tr('Cancel', 'إلغاء')}</Btn><Btn onClick={save}>{tr('Save', 'حفظ')}</Btn></div>
          </div>
        )}
      </Modal>
    </>
  )
}
