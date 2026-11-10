import { useState } from 'react'
import { RotateCcw, Check } from 'lucide-react'
import { db, useDB, type Settings as S } from '@/lib/store'
import { PageHeader, Card, Field, inputCls, Btn, useTr } from '../ui'

export default function Settings() {
  const tr = useTr()
  const current = useDB((d) => d.settings)
  const [f, setF] = useState<S>(current)
  const [saved, setSaved] = useState(false)
  const set = <K extends keyof S>(k: K, v: S[K]) => { setF({ ...f, [k]: v }); setSaved(false) }
  return (
    <>
      <PageHeader title={tr('Settings', 'الإعدادات')} sub={tr('Clinic details shown across the website footer, booking and written plans.', 'بيانات العيادة اللي بتظهر في الموقع والحجز والخطط المكتوبة.')}
        actions={<Btn onClick={() => { db.set((d) => { d.settings = f }); setSaved(true) }}>{saved ? <Check className="size-4" /> : null}{saved ? tr('Saved', 'اتحفظ') : tr('Save changes', 'احفظ التعديلات')}</Btn>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display mb-4 text-lg font-semibold text-deep">{tr('Contact', 'التواصل')}</h2>
          <div className="grid gap-3">
            <Field label={tr('Phone', 'التليفون')}><input dir="ltr" className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="WhatsApp"><input dir="ltr" className={inputCls} value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} /></Field>
            <Field label="Email"><input dir="ltr" className={inputCls} value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Instagram"><input dir="ltr" className={inputCls} value={f.instagram} onChange={(e) => set('instagram', e.target.value)} /></Field>
              <Field label="Facebook"><input dir="ltr" className={inputCls} value={f.facebook} onChange={(e) => set('facebook', e.target.value)} /></Field>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="font-display mb-4 text-lg font-semibold text-deep">{tr('Location & hours', 'العنوان والمواعيد')}</h2>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Address (EN)"><input className={inputCls} value={f.address.en} onChange={(e) => set('address', { ...f.address, en: e.target.value })} /></Field>
              <Field label="العنوان (AR)"><input dir="rtl" className={inputCls} value={f.address.ar} onChange={(e) => set('address', { ...f.address, ar: e.target.value })} /></Field>
              <Field label="Hours (EN)"><input className={inputCls} value={f.hours.en} onChange={(e) => set('hours', { ...f.hours, en: e.target.value })} /></Field>
              <Field label="المواعيد (AR)"><input dir="rtl" className={inputCls} value={f.hours.ar} onChange={(e) => set('hours', { ...f.hours, ar: e.target.value })} /></Field>
            </div>
            <Field label="Google Maps URL"><input dir="ltr" className={inputCls} value={f.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} /></Field>
            <Field label={tr('Treatment chairs', 'عدد الكراسي')}><input type="number" min={1} max={8} className={inputCls} value={f.chairs} onChange={(e) => set('chairs', Number(e.target.value))} /></Field>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div><h2 className="font-display text-lg font-semibold text-deep">{tr('Demo data', 'بيانات الديمو')}</h2><p className="mt-1 text-sm text-stone">{tr('All data is stored in this browser until a backend is connected. Reset restores the sample clinic.', 'كل البيانات متخزنة في المتصفح ده لحد ما نربط Backend. الريست بيرجّع بيانات العيادة التجريبية.')}</p></div>
            <Btn variant="ghost" onClick={() => { if (confirm(tr('Reset all data to the demo clinic?', 'ترجّع كل البيانات للديمو؟'))) { db.reset(); setF(db.get().settings) } }}><RotateCcw className="size-4" />{tr('Reset demo data', 'ريست للديمو')}</Btn>
          </div>
        </Card>
      </div>
    </>
  )
}
