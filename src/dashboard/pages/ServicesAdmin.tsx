import { useState } from 'react'
import { Pencil, ExternalLink, Plus } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { useLang } from '@/lib/i18n'
import { db, useDB, money, loc, nextId, type Service } from '@/lib/store'
import { PageHeader, Card, Modal, Field, inputCls, Btn, Toggle, useTr } from '../ui'

/** Link to a public site page that works in both router modes. */
export const siteHref = (path: string) => `${import.meta.env.BASE_URL}${import.meta.env.VITE_HASH_ROUTER ? '#/' : ''}${path.replace(/^\//, '')}`

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const BI = [['name', 'Name', 2], ['short_description', 'Short description', 2], ['description', 'Description', 4], ['preparation', 'Before your visit', 3], ['aftercare', 'Aftercare', 3]] as const

/** MazMed Services */
export default function ServicesAdmin() {
  const tr = useTr()
  const { lang } = useLang()
  const services = useDB((d) => d.services)
  const categories = useDB((d) => d.categories)
  const [cat, setCat] = useState(0)
  const [edit, setEdit] = useState<Service | null>(null)
  const list = services.filter((s) => !cat || s.category_id === cat).sort((a, b) => a.sort_order - b.sort_order)
  const patch = (id: number, p: Partial<Service>) => db.set((d) => { const x = d.services.find((y) => y.id === id); if (x) Object.assign(x, p) })
  const save = () => {
    if (!edit) return
    const s = { ...edit, slug: edit.slug || slugify(edit.name) }
    db.set((d) => { const i = d.services.findIndex((x) => x.id === s.id); if (i >= 0) d.services[i] = s; else d.services.push(s) })
    setEdit(null)
  }
  const blank = (): Service => ({
    id: nextId(services), category_id: cat || categories[0]?.id || null, name: '', name_ar: '', slug: '', charges: 0, service_time: 30, status: true,
    short_description: '', short_description_ar: '', description: '', description_ar: '', preparation: '', preparation_ar: '', aftercare: '', aftercare_ar: '',
    online_booking: true, show_on_website: false, is_featured: false, sort_order: services.length + 1, faqs: [], related_service_ids: [], icon: 'tooth',
  })

  return (
    <>
      <PageHeader title={tr('Services', 'الخدمات')} sub={tr('MazMed services. Website treatment pages and the booking form read from here.', 'خدمات MazMed. صفحات العلاجات وفورم الحجز على الموقع بتقرا من هنا.')} actions={<Btn onClick={() => setEdit(blank())}><Plus className="size-4" />{tr('New service', 'خدمة جديدة')}</Btn>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: 0, name: 'All', name_ar: 'الكل' }, ...categories].map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full border px-4 py-2 text-sm ${cat === c.id ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white'}`}>{loc(c, 'name', lang)}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <Card key={s.id} className={s.status ? '' : 'opacity-60'}>
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-xl bg-jade/40 text-deep"><DentalIcon name={s.icon} size={26} /></span>
              <div className="grid gap-1.5 text-[0.7rem] text-stone">
                <label className="flex items-center justify-end gap-2">{tr('Website', 'الموقع')}<Toggle on={s.show_on_website} label="Website" onChange={(v) => patch(s.id, { show_on_website: v })} /></label>
                <label className="flex items-center justify-end gap-2">{tr('Online booking', 'حجز أونلاين')}<Toggle on={s.online_booking} label="Online booking" onChange={(v) => patch(s.id, { online_booking: v })} /></label>
              </div>
            </div>
            <p className="font-display mt-4 text-lg font-semibold text-deep">{loc(s, 'name', lang)}{s.is_featured && <span className="ms-2 rounded bg-jade/60 px-1.5 align-middle text-[0.65rem] font-normal">{tr('featured', 'مميزة')}</span>}</p>
            <p className="mt-1 line-clamp-2 text-sm text-stone">{loc(s, 'short_description', lang)}</p>
            <div className="mt-4 flex items-center justify-between border-t border-deep/5 pt-3 text-xs text-charcoal/70">
              <span>{s.service_time} {tr('min', 'دقيقة')} · {money(s.charges, lang)}</span>
              <span className="flex gap-1">
                <a href={siteHref(`/treatments/${s.slug}`)} target="_blank" rel="noreferrer" className="grid size-8 place-items-center rounded-full hover:bg-deep/5" aria-label="Open"><ExternalLink className="size-3.5" /></a>
                <button onClick={() => setEdit(structuredClone(s))} className="grid size-8 place-items-center rounded-full hover:bg-deep/5" aria-label="Edit"><Pencil className="size-3.5" /></button>
              </span>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.name ? loc(edit, 'name', lang) : tr('New service', 'خدمة جديدة')} wide>
        {edit && (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              {BI.map(([k, l, rows]) => (['', '_ar'] as const).map((suf) => {
                const key = (k + suf) as keyof Service
                const ar = suf === '_ar'
                return (
                  <Field key={key} label={`${l} (${ar ? 'AR' : 'EN'})`}>
                    {rows === 2 && k === 'name' ? <input dir={ar ? 'rtl' : 'ltr'} className={inputCls} value={String(edit[key] ?? '')} onChange={(e) => setEdit({ ...edit, [key]: e.target.value })} />
                      : <textarea rows={rows} dir={ar ? 'rtl' : 'ltr'} className={inputCls} value={String(edit[key] ?? '')} onChange={(e) => setEdit({ ...edit, [key]: e.target.value })} />}
                  </Field>
                )
              }))}
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Field label={tr('Category', 'القسم')}><select className={inputCls} value={edit.category_id ?? ''} onChange={(e) => setEdit({ ...edit, category_id: e.target.value ? Number(e.target.value) : null })}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{loc(c, 'name', lang)}</option>)}</select></Field>
              <Field label={tr('Service time (min)', 'مدة الخدمة')}><input type="number" step={5} className={inputCls} value={edit.service_time} onChange={(e) => setEdit({ ...edit, service_time: Number(e.target.value) })} /></Field>
              <Field label={tr('Charges (EGP)', 'السعر')}><input type="number" className={inputCls} value={edit.charges} onChange={(e) => setEdit({ ...edit, charges: Number(e.target.value) })} /></Field>
              <Field label="Slug"><input dir="ltr" className={inputCls} value={edit.slug} placeholder={slugify(edit.name)} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} /></Field>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-charcoal">
              {([['status', tr('Active', 'مفعّلة')], ['show_on_website', tr('Show on website', 'تظهر على الموقع')], ['online_booking', tr('Online booking', 'حجز أونلاين')], ['is_featured', tr('Featured', 'مميزة')]] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2"><Toggle on={edit[k]} label={l} onChange={(v) => setEdit({ ...edit, [k]: v })} />{l}</label>
              ))}
            </div>
            <Field label={tr('Related services', 'خدمات مرتبطة')}>
              <div className="flex flex-wrap gap-1.5">{services.filter((s) => s.id !== edit.id).map((s) => <button key={s.id} onClick={() => setEdit({ ...edit, related_service_ids: edit.related_service_ids.includes(s.id) ? edit.related_service_ids.filter((x) => x !== s.id) : [...edit.related_service_ids, s.id] })} className={`rounded-full border px-3 py-1.5 text-xs ${edit.related_service_ids.includes(s.id) ? 'border-emerald bg-jade/50 text-deep' : 'border-deep/10'}`}>{loc(s, 'name', lang)}</button>)}</div>
            </Field>
            <p className="text-xs text-stone">{tr('The website lists services by name and duration; the booking form shows charges as MazMed does.', 'الموقع بيعرض الخدمات بالاسم والمدة؛ فورم الحجز بيعرض السعر زي MazMed.')}</p>
            <div className="flex justify-end gap-2"><Btn variant="ghost" onClick={() => setEdit(null)}>{tr('Cancel', 'إلغاء')}</Btn><Btn disabled={!edit.name.trim()} onClick={save}>{tr('Save', 'حفظ')}</Btn></div>
          </div>
        )}
      </Modal>
    </>
  )
}
