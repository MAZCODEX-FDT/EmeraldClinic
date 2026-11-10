import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ArrowUpRight, ArrowLeft } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { Mark } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { db, useDB, uid, addDays, todayISO } from '@/lib/store'
import { gsap, useGSAP } from '@/lib/gsap'

const TIMES = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']

export default function Book() {
  const { t, pick, lang } = useLang()
  const [params] = useSearchParams()
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const visible = useMemo(() => services.filter((s) => s.visible), [services])
  const [step, setStep] = useState(params.get('service') ? (params.get('doctor') ? 2 : 1) : params.get('doctor') ? 0 : 0)
  const [serviceId, setService] = useState(params.get('service') ?? '')
  const [doctorId, setDoctor] = useState(params.get('doctor') ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const panel = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.fromTo('[data-anim]', { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.7 })
  }, { scope: panel, dependencies: [step, done] })

  const days = useMemo(() => {
    const out: string[] = []
    for (let i = 1; out.length < 12 && i < 20; i++) {
      const d = addDays(todayISO(), i)
      if (new Date(d + 'T00:00:00').getDay() !== 5) out.push(d)
    }
    return out
  }, [])
  const docs = doctors.filter((d) => d.visible && (!serviceId || d.services.includes(serviceId)))
  const fmtDay = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const canNext = [!!serviceId, true, !!date && !!time, true][step]

  const submit = () => {
    if (form.name.trim().length < 3 || !/^(\+?20)?0?1[0125]\d{8}$/.test(form.phone.replace(/\s/g, ''))) { setErr(t.booking.required); return }
    db.set((d) => {
      d.requests.unshift({
        id: uid('r-'), name: form.name.trim(), phone: form.phone.trim(), serviceId, doctorId: doctorId || undefined,
        date, time, message: form.message.trim(), createdAt: new Date().toISOString(), status: 'new', source: 'website',
      })
    })
    setDone(true)
  }

  const svc = services.find((s) => s.id === serviceId)
  const doc = doctors.find((d) => d.id === doctorId)

  return (
    <section className="min-h-screen bg-ivory px-6 pt-36 pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_22rem]">
        <div ref={panel}>
          {done ? (
            <div className="flex min-h-[60vh] flex-col items-start justify-center">
              <span data-anim className="grid size-20 place-items-center rounded-full bg-deep text-jade"><Check className="size-9" /></span>
              <h1 data-anim className="font-display mt-8 text-5xl font-semibold text-deep md:text-6xl">{t.booking.doneT}</h1>
              <p data-anim className="mt-5 max-w-xl text-lg leading-relaxed text-charcoal/70">{t.booking.doneB}</p>
              <Link data-anim to="/" className="mt-10 rounded-full bg-deep px-7 py-4 font-medium text-ivory">{t.booking.again}</Link>
            </div>
          ) : (
            <>
              <p className="eyebrow text-emerald">{t.booking.eyebrow}</p>
              <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.02em] text-deep md:text-6xl">{t.booking.title}</h1>
              <ol className="mt-10 flex flex-wrap gap-2">
                {t.booking.steps.map((l, i) => (
                  <li key={l}>
                    <button disabled={i > step} onClick={() => setStep(i)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${i === step ? 'border-deep bg-deep text-ivory' : i < step ? 'border-emerald/30 bg-jade/40 text-deep' : 'border-deep/10 text-stone'}`}>
                      <span className="font-display">{i < step ? <Check className="size-3.5" /> : i + 1}</span>{l}
                    </button>
                  </li>
                ))}
              </ol>

              <div className="mt-10 min-h-[22rem]">
                {step === 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((s) => (
                      <button data-anim key={s.id} onClick={() => { setService(s.id); if (doctorId && !doctors.find((d) => d.id === doctorId)?.services.includes(s.id)) setDoctor(''); setStep(1) }}
                        className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${serviceId === s.id ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white hover:border-emerald'}`}>
                        <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${serviceId === s.id ? 'bg-ivory/10 text-jade' : 'bg-jade/40 text-deep'}`}><DentalIcon name={s.icon} size={26} /></span>
                        <span><span className="font-display block font-semibold">{pick(s.name)}</span><span className={`text-xs ${serviceId === s.id ? 'text-jade' : 'text-stone'}`}>{s.duration} {t.services.min} · {pick(s.sessions)}</span></span>
                      </button>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button data-anim onClick={() => { setDoctor(''); setStep(2) }} className={`rounded-2xl border p-5 text-start transition-all ${!doctorId ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white hover:border-emerald'}`}>
                      <span className="font-display text-lg font-semibold">{t.booking.any}</span>
                    </button>
                    {docs.map((d) => (
                      <button data-anim key={d.id} onClick={() => { setDoctor(d.id); setStep(2) }} className={`flex items-center gap-4 rounded-2xl border p-4 text-start transition-all ${doctorId === d.id ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white hover:border-emerald'}`}>
                        <span className="font-display grid size-12 shrink-0 place-items-center rounded-full text-ivory" style={{ background: d.color }}>{d.initials}</span>
                        <span><span className="font-display block font-semibold">{pick(d.name)}</span><span className={`text-xs ${doctorId === d.id ? 'text-jade' : 'text-stone'}`}>{pick(d.role)}</span></span>
                      </button>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <p data-anim className="text-sm font-medium text-deep">{t.booking.date} <span className="text-stone">· {t.booking.friday}</span></p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {days.map((d) => (
                        <button data-anim key={d} onClick={() => setDate(d)} className={`rounded-xl border px-4 py-3 text-sm transition-all ${date === d ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white hover:border-emerald'}`}>{fmtDay(d)}</button>
                      ))}
                    </div>
                    <p data-anim className="mt-8 text-sm font-medium text-deep">{t.booking.time}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {TIMES.map((tm) => (
                        <button data-anim key={tm} onClick={() => setTime(tm)} className={`rounded-xl border px-3 py-3 text-sm tabular-nums transition-all ${time === tm ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white hover:border-emerald'}`} dir="ltr">{tm}</button>
                      ))}
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="grid max-w-xl gap-4">
                    {(['name', 'phone'] as const).map((k) => (
                      <label data-anim key={k} className="block">
                        <span className="text-sm font-medium text-deep">{t.booking[k]}</span>
                        <input value={form[k]} onChange={(e) => { setForm({ ...form, [k]: e.target.value }); setErr('') }} type={k === 'phone' ? 'tel' : 'text'} inputMode={k === 'phone' ? 'tel' : undefined} dir={k === 'phone' ? 'ltr' : undefined}
                          className="mt-2 w-full rounded-2xl border border-deep/15 bg-white px-5 py-4 outline-none transition-colors focus:border-emerald rtl:text-right" placeholder={k === 'phone' ? '01X XXXX XXXX' : ''} />
                      </label>
                    ))}
                    <label data-anim className="block">
                      <span className="text-sm font-medium text-deep">{t.booking.message}</span>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-deep/15 bg-white px-5 py-4 outline-none focus:border-emerald" />
                    </label>
                    {err && <p className="text-sm text-charcoal">⚠ {err}</p>}
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center gap-3">
                {step > 0 && <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-6 py-3.5 text-sm font-medium text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{t.booking.back}</button>}
                {step < 3 ? (
                  <button disabled={!canNext} onClick={() => setStep(step + 1)} className="rounded-full bg-deep px-7 py-3.5 text-sm font-medium text-ivory transition-opacity disabled:opacity-30">{t.booking.next}</button>
                ) : (
                  <button onClick={submit} className="group inline-flex items-center gap-2 rounded-full bg-deep px-7 py-3.5 text-sm font-medium text-ivory">{t.booking.submit}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" /></button>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="glow-bg grain relative hidden self-start overflow-hidden rounded-[2rem] p-7 text-ivory lg:sticky lg:top-28 lg:block">
          <Mark size={240} tooth="rgba(191,227,211,.08)" smile="rgba(247,244,238,.06)" className="pointer-events-none absolute -end-14 -bottom-14" />
          <p className="eyebrow text-jade">{lang === 'ar' ? 'ملخص' : 'Summary'}</p>
          <dl className="relative mt-6 space-y-5">
            {[
              [t.booking.steps[0], svc ? pick(svc.name) : '—'],
              [t.booking.steps[1], doc ? pick(doc.name) : t.booking.any],
              [t.booking.steps[2], date ? `${fmtDay(date)} · ${time || '—'}` : '—'],
            ].map(([k, v]) => (
              <div key={k}><dt className="text-xs text-jade/80">{k}</dt><dd className="font-display mt-1 text-lg">{v}</dd></div>
            ))}
          </dl>
          <p className="relative mt-8 border-t border-ivory/10 pt-6 text-sm leading-relaxed text-ivory/70">{t.plan.sub}</p>
        </aside>
      </div>
    </section>
  )
}
