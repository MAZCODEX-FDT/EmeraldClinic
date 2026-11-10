import { useState } from 'react'
import { RotateCcw, Check, Plug, Plus, Trash2 } from 'lucide-react'
import { db, useDB, nextId, mainBranch, type Branch, type SiteSettings, type Resource } from '@/lib/store'
import { PageHeader, Card, Field, inputCls, Btn, useTr } from '../ui'

/** MazMed Branch (contact, hours, map), ClinicResources (chairs) and the website ↔ MazMed connection. */
export default function Settings() {
  const tr = useTr()
  const branch = useDB(mainBranch)
  const settings = useDB((d) => d.settings)
  const resources = useDB((d) => d.resources)
  const [b, setB] = useState<Branch>(branch)
  const [s, setS] = useState<SiteSettings>(settings)
  const [r, setR] = useState<Resource[]>(resources)
  const [saved, setSaved] = useState(false)
  const [ping, setPing] = useState<'idle' | 'ok' | 'fail' | 'busy'>('idle')
  const setBranch = <K extends keyof Branch>(k: K, v: Branch[K]) => { setB({ ...b, [k]: v }); setSaved(false) }
  const setSite = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => { setS({ ...s, [k]: v }); setSaved(false); setPing('idle') }
  const save = () => {
    db.set((d) => { const i = d.branches.findIndex((x) => x.id === b.id); if (i >= 0) d.branches[i] = b; d.settings = { ...s, mazmed_url: s.mazmed_url.trim().replace(/\/+$/, '') }; d.resources = r.filter((x) => x.name.trim()) })
    setSaved(true)
  }
  /** Reads MazMed's public slots endpoint for tomorrow; a JSON reply means the site can reach it (CORS allowed). */
  const test = async () => {
    setPing('busy')
    try {
      const u = new URL('/site/booking/slots', s.mazmed_url.trim())
      u.searchParams.set('doctor_id', '1'); u.searchParams.set('date', new Date(Date.now() + 864e5).toISOString().slice(0, 10))
      const res = await fetch(u, { headers: { Accept: 'application/json' }, credentials: 'include' })
      await res.json()
      setPing(res.ok ? 'ok' : 'fail')
    } catch { setPing('fail') }
  }
  const bi = (k: 'name' | 'address' | 'hours', label: string) => (
    <div className="grid grid-cols-2 gap-3">
      <Field label={`${label} (EN)`}><input className={inputCls} value={b[k]} onChange={(e) => setBranch(k, e.target.value)} /></Field>
      <Field label={`${label} (AR)`}><input dir="rtl" className={inputCls} value={b[`${k}_ar`]} onChange={(e) => setBranch(`${k}_ar`, e.target.value)} /></Field>
    </div>
  )

  return (
    <>
      <PageHeader title={tr('Settings', 'الإعدادات')} sub={tr('Branch details shown on the website, booking and written plans — plus the MazMed connection.', 'بيانات الفرع اللي بتظهر في الموقع والحجز والخطط المكتوبة — وربط MazMed.')}
        actions={<Btn onClick={save}>{saved ? <Check className="size-4" /> : null}{saved ? tr('Saved', 'اتحفظ') : tr('Save changes', 'احفظ التعديلات')}</Btn>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2 !border-emerald/30">
          <h2 className="font-display flex items-center gap-2 text-lg font-semibold text-deep"><Plug className="size-4 text-emerald" />{tr('MazMed connection', 'الربط مع MazMed')}</h2>
          <p className="mt-1 text-sm text-stone">{tr('Paste the clinic’s MazMed address. Once set, the website’s booking form, available times and contact form go straight to MazMed. Leave empty to use the demo data in this browser.', 'حط لينك MazMed بتاع العيادة. بعدها فورم الحجز والمواعيد المتاحة وفورم التواصل على الموقع هيروحوا لـ MazMed مباشرة. سيبه فاضي علشان تستخدم بيانات الديمو.')}</p>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1"><Field label="MazMed URL"><input dir="ltr" placeholder="https://emerald.mazmed.net" className={inputCls} value={s.mazmed_url} onChange={(e) => setSite('mazmed_url', e.target.value)} /></Field></div>
            <Btn variant="ghost" disabled={!s.mazmed_url.trim() || ping === 'busy'} onClick={test}>{ping === 'busy' ? tr('Testing…', 'بيجرب…') : tr('Test connection', 'جرّب الربط')}</Btn>
          </div>
          {ping === 'ok' && <p className="mt-2 text-xs text-emerald">{tr('Connected — MazMed answered with available times.', 'متوصل — MazMed رد بالمواعيد المتاحة.')}</p>}
          {ping === 'fail' && <p className="mt-2 text-xs text-charcoal">{tr('No answer. Check the address, and that MazMed allows this website in its CORS settings.', 'مفيش رد. اتأكد من اللينك، وإن MazMed مسموح فيه للموقع ده في إعدادات CORS.')}</p>}
        </Card>
        <Card>
          <h2 className="font-display mb-4 text-lg font-semibold text-deep">{tr('Branch & contact', 'الفرع والتواصل')}</h2>
          <div className="grid gap-3">
            {bi('name', tr('Branch name', 'اسم الفرع'))}
            <Field label={tr('Phone', 'التليفون')}><input dir="ltr" className={inputCls} value={b.phone} onChange={(e) => setBranch('phone', e.target.value)} /></Field>
            <Field label="WhatsApp"><input dir="ltr" className={inputCls} value={b.whatsapp} onChange={(e) => setBranch('whatsapp', e.target.value)} /></Field>
            <Field label="Email"><input dir="ltr" className={inputCls} value={b.email} onChange={(e) => setBranch('email', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram"><input dir="ltr" className={inputCls} value={s.instagram} onChange={(e) => setSite('instagram', e.target.value)} /></Field>
              <Field label="Facebook"><input dir="ltr" className={inputCls} value={s.facebook} onChange={(e) => setSite('facebook', e.target.value)} /></Field>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="font-display mb-4 text-lg font-semibold text-deep">{tr('Location & hours', 'العنوان والمواعيد')}</h2>
          <div className="grid gap-3">
            {bi('address', tr('Address', 'العنوان'))}
            {bi('hours', tr('Hours', 'المواعيد'))}
            <Field label="Google Maps URL"><input dir="ltr" className={inputCls} value={b.map_url} onChange={(e) => setBranch('map_url', e.target.value)} /></Field>
          </div>
          <h3 className="mt-6 mb-2 text-sm font-semibold text-deep">{tr('Treatment chairs', 'الكراسي')}</h3>
          <div className="grid gap-2">
            {r.map((x, i) => (
              <div key={x.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input className={inputCls} value={x.name} onChange={(e) => { const n = [...r]; n[i] = { ...x, name: e.target.value }; setR(n); setSaved(false) }} />
                <input dir="rtl" className={inputCls} value={x.name_ar} onChange={(e) => { const n = [...r]; n[i] = { ...x, name_ar: e.target.value }; setR(n); setSaved(false) }} />
                <button onClick={() => { setR(r.filter((y) => y.id !== x.id)); setSaved(false) }} disabled={r.length < 2} className="grid size-10 place-items-center text-stone hover:text-charcoal disabled:opacity-30" aria-label="Remove"><Trash2 className="size-4" /></button>
              </div>
            ))}
            <button onClick={() => { const id = nextId(r); setR([...r, { id, name: `Chair ${id}`, name_ar: `كرسي ${id}` }]); setSaved(false) }} className="inline-flex w-fit items-center gap-1.5 text-sm text-emerald hover:text-deep"><Plus className="size-4" />{tr('Add chair', 'ضيف كرسي')}</button>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div><h2 className="font-display text-lg font-semibold text-deep">{tr('Demo data', 'بيانات الديمو')}</h2><p className="mt-1 text-sm text-stone">{tr('Until MazMed is connected, all data is stored in this browser. Reset restores the sample clinic.', 'لحد ما MazMed يتربط، كل البيانات متخزنة في المتصفح ده. الريست بيرجّع بيانات العيادة التجريبية.')}</p></div>
            <Btn variant="ghost" onClick={() => { if (confirm(tr('Reset all data to the demo clinic?', 'ترجّع كل البيانات للديمو؟'))) { db.reset(); const d = db.get(); setB(mainBranch(d)); setS(d.settings); setR(d.resources) } }}><RotateCcw className="size-4" />{tr('Reset demo data', 'ريست للديمو')}</Btn>
          </div>
        </Card>
      </div>
    </>
  )
}
