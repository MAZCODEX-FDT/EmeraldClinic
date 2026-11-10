/**
 * Online booking — the same flow, fields and payload as MazMed's booking wizard
 * (resources/views/site/blocks/booking-wizard.blade.php → POST /site/booking):
 * 1. services (several allowed)  2. doctor  3. a free slot  4. the patient's details.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, ArrowLeft, ShieldCheck, FileText, Clock } from 'lucide-react'
import { DentalIcon } from '@/components/dental/DentalIcon'
import { Mark } from '@/components/brand/Logo'
import { useLang, useL } from '@/lib/i18n'
import { useDB, addDays, todayISO, money, doctorName, type Doctor } from '@/lib/store'
import { mazmed } from '@/lib/mazmed/client'
import { gsap, useGSAP } from '@/lib/gsap'

type Step = 1 | 2 | 3 | 4 | 5

export default function Book() {
  const { lang, l } = useLang()
  const L = useL()
  const [params] = useSearchParams()
  const allServices = useDB((d) => d.services)
  const allDoctors = useDB((d) => d.doctors)
  const specs = useDB((d) => d.specializations)
  const branches = useDB((d) => d.branches)
  const services = useMemo(() => allServices.filter((s) => s.status && s.online_booking).sort((a, b) => a.sort_order - b.sort_order), [allServices])
  const doctors = useMemo(() => allDoctors.filter((d) => d.user.status === 1 && d.online_booking).sort((a, b) => a.sort_order - b.sort_order), [allDoctors])
  const activeBranches = useMemo(() => branches.filter((b) => b.is_active), [branches])

  const preService = Number(params.get('service')) || null
  const preDoctor = Number(params.get('doctor')) || null
  const [step, setStep] = useState<Step>(1)
  const [chosen, setChosen] = useState<number[]>(preService ? [preService] : [])
  const [branchId, setBranchId] = useState<number | null>(null)
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [date, setDate] = useState(todayISO())
  const [slots, setSlots] = useState<string[] | null>(null)
  const [slot, setSlot] = useState('')
  const [f, setF] = useState({ name: '', phone: '', email: '', gender: '1' as '1' | '2', dob: '', notes: '', coupon: '', create_account: false, password: '', consent: false, website: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ message: string; pay_url?: string | null } | null>(null)
  const startedAt = useRef(Math.floor(Date.now() / 1000))
  const root = useRef<HTMLDivElement>(null)

  useGSAP(() => { gsap.fromTo('[data-anim]', { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.035, duration: 0.7 }) }, { scope: root, dependencies: [step, doctor?.id, slots?.length] })

  const fit = useMemo(() => doctors.filter((d) => chosen.every((s) => d.service_ids.length === 0 || d.service_ids.includes(s))), [doctors, chosen])
  const specialty = (d: Doctor) => specs.filter((s) => d.specialization_ids.includes(s.id)).map((s) => l(s, 'name')).join('، ')
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i)), [])
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', o)

  // ?service= jumps to the doctor step; ?doctor= also picks the doctor (as in MazMed)
  useEffect(() => {
    if (preService) setStep(2)
    if (preDoctor) {
      const d = doctors.find((x) => x.id === preDoctor)
      if (d && (!preService || d.service_ids.length === 0 || d.service_ids.includes(preService))) { setDoctor(d); setStep(3) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (step !== 3 || !doctor) return
    let live = true
    setSlots(null); setSlot('')
    mazmed.slots({ doctor_id: doctor.id, date, services: chosen, branch_id: branchId }).then((s) => { if (live) setSlots(s) })
    return () => { live = false }
  }, [step, doctor, date, chosen, branchId])

  const go = (s: Step) => { setStep(s); setMsg(''); root.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const toggle = (id: number) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!f.name.trim() || !f.phone.trim() || !f.consent) { setMsg(L('Enter your name, mobile and accept the terms.', 'أدخل الاسم ورقم الموبايل ووافق على الشروط.')); return }
    if (!doctor || !slot) return
    setBusy(true)
    const res = await mazmed.book({
      name: f.name, phone: f.phone, email: f.email || undefined, gender: f.gender, dob: f.dob || undefined,
      doctor_id: doctor.id, date, slot, services: chosen, branch_id: branchId,
      create_account: f.create_account, password: f.create_account ? f.password : undefined,
      notes: f.notes || undefined, coupon: f.coupon || undefined, consent: f.consent, website: f.website, form_started_at: startedAt.current,
    })
    setBusy(false)
    if (!res.ok) {
      setMsg(res.message || L('Could not book. Please check the details and try again.', 'تعذر الحجز. راجع البيانات وحاول مرة أخرى.'))
      if (/slot|taken|الموعد/i.test(res.message)) go(3)
      return
    }
    setDone({ message: res.message, pay_url: res.pay_url }); go(5)
  }

  const chosenServices = services.filter((s) => chosen.includes(s.id))
  const stepsLabels = [L('Services', 'الخدمات'), L('Doctor', 'الطبيب'), L('Time', 'الموعد'), L('Your details', 'بياناتك')]
  const input = 'mt-2 w-full rounded-2xl border border-deep/15 bg-white px-5 py-3.5 outline-none transition-colors focus:border-emerald'

  return (
    <section className="min-h-screen bg-[#FBFBFA] px-2 pt-2 pb-24 md:px-4 md:pt-4">
      <div className="rounded-[2rem] bg-[linear-gradient(180deg,#F1F5F2_0%,#FBFBFA_60%)] px-4 pt-32 pb-10 md:rounded-[2.75rem] md:px-10 md:pt-40">
        <div ref={root} className="mx-auto grid max-w-[80rem] gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <p className="eyebrow text-emerald">{L('Online booking', 'الحجز أونلاين')}</p>
            <h1 className={`${lang === 'ar' ? 'font-ar-display leading-tight' : 'font-display leading-[1] tracking-[-0.03em]'} mt-4 text-4xl font-bold text-charcoal md:text-6xl`}>
              {L('Book your visit', 'احجز زيارتك')}
            </h1>

            {step < 5 && (
              <ol className="mt-8 flex flex-wrap gap-2" aria-hidden>
                {stepsLabels.map((s, i) => (
                  <li key={s} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors ${i + 1 === step ? 'bg-deep text-ivory' : i + 1 < step ? 'bg-jade/50 text-deep' : 'bg-white text-stone'}`}>
                    <span className="font-display">{i + 1 < step ? <Check className="size-3.5" /> : i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            )}

            <form onSubmit={submit} noValidate className="mt-8 rounded-[2rem] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(14,77,60,.35)] md:p-8">
              <div className="hidden" aria-hidden><input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
              {msg && <p role="status" className="mb-5 rounded-xl bg-beige/70 px-4 py-3 text-sm text-charcoal">{msg}</p>}

              {step === 1 && (
                <section>
                  <h2 data-anim className="font-display text-2xl font-semibold text-charcoal">{L('What would you like to book?', 'ما الذي تريد حجزه؟')}</h2>
                  {activeBranches.length > 1 && (
                    <label data-anim className="mt-4 flex items-center gap-3 text-sm">{L('Branch', 'الفرع')}
                      <select value={branchId ?? ''} onChange={(e) => setBranchId(Number(e.target.value) || null)} className="rounded-xl border border-deep/15 px-3 py-2">
                        <option value="">{L('Any branch', 'أي فرع')}</option>
                        {activeBranches.map((b) => <option key={b.id} value={b.id}>{l(b, 'name')}</option>)}
                      </select>
                    </label>
                  )}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {services.map((s) => {
                      const on = chosen.includes(s.id)
                      return (
                        <label data-anim key={s.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all ${on ? 'border-deep bg-deep text-ivory' : 'border-deep/10 hover:border-emerald'}`}>
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(s.id)} />
                          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${on ? 'bg-ivory/10 text-jade' : 'bg-mist text-deep'}`}><DentalIcon name={s.icon} size={24} /></span>
                          <span className="min-w-0 flex-1">
                            <strong className="font-display block font-semibold">{l(s, 'name')}</strong>
                            <small className={on ? 'text-jade' : 'text-stone'}>{[s.charges ? money(s.charges, lang) : null, s.service_time ? `${s.service_time} ${L('min', 'د')}` : null].filter(Boolean).join(' · ')}</small>
                          </span>
                          <span className={`grid size-6 shrink-0 place-items-center rounded-md border ${on ? 'border-jade bg-jade text-deep' : 'border-deep/20'}`}>{on && <Check className="size-4" />}</span>
                        </label>
                      )
                    })}
                  </div>
                  <p data-anim className="mt-4 text-sm text-stone">{L('Choose one or more, or just continue for a consultation.', 'اختر خدمة أو أكثر، أو تابع لحجز كشف.')}</p>
                  <div className="mt-8 flex justify-end"><button type="button" onClick={() => go(2)} className="rounded-full bg-deep px-8 py-3.5 text-sm font-medium text-ivory hover:bg-emerald">{L('Continue', 'متابعة')}</button></div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <h2 data-anim className="font-display text-2xl font-semibold text-charcoal">{L('Choose your doctor', 'اختر الطبيب')}</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {fit.map((d) => (
                      <button data-anim type="button" key={d.id} onClick={() => { setDoctor(d); go(3) }}
                        className={`group flex items-center gap-4 rounded-2xl border p-3 text-start transition-all hover:border-emerald hover:shadow-md ${doctor?.id === d.id ? 'border-deep' : 'border-deep/10'}`}>
                        {d.user.profile_image
                          ? <img src={d.user.profile_image} alt="" className="size-20 shrink-0 rounded-2xl bg-mist object-cover object-top" />
                          : <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-mist">👨‍⚕️</span>}
                        <span><strong className="font-display block text-lg font-semibold text-charcoal">{doctorName(d, lang)}</strong><small className="text-stone">{specialty(d)}</small></span>
                      </button>
                    ))}
                  </div>
                  {fit.length === 0 && <p className="mt-6 text-stone">{L('No doctor offers all of these services online. Remove one, or call us.', 'لا يوجد طبيب يقدم كل هذه الخدمات أونلاين. احذف خدمة أو اتصل بنا.')}</p>}
                  <div className="mt-8"><button type="button" onClick={() => go(1)} className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-6 py-3 text-sm font-medium text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{L('Back', 'رجوع')}</button></div>
                </section>
              )}

              {step === 3 && doctor && (
                <section>
                  <h2 data-anim className="font-display text-2xl font-semibold text-charcoal">{L('Pick a day and a free time', 'اختر اليوم والوقت المتاح')}</h2>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {days.map((d) => (
                      <button data-anim type="button" key={d} onClick={() => setDate(d)} className={`flex w-16 flex-col items-center rounded-2xl border py-3 transition-all ${date === d ? 'border-deep bg-deep text-ivory' : 'border-deep/10 hover:border-emerald'}`}>
                        <small className={date === d ? 'text-jade' : 'text-stone'}>{fmt(d, { weekday: 'short' })}</small>
                        <strong className="font-display text-xl">{new Date(d + 'T00:00:00').getDate()}</strong>
                      </button>
                    ))}
                    <input data-anim type="date" aria-label={L('Date', 'التاريخ')} value={date} min={todayISO()} max={addDays(todayISO(), 92)} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-2xl border border-deep/10 px-4 text-sm" />
                  </div>
                  <div className="mt-6 min-h-[8rem]" aria-live="polite">
                    {slots === null && <p className="text-stone">{L('Looking for free times…', 'جارٍ البحث عن المواعيد…')}</p>}
                    {slots && slots.length === 0 && <p className="text-stone">{L('No free times this day. Try another day.', 'لا توجد مواعيد متاحة في هذا اليوم. جرّب يوماً آخر.')}</p>}
                    {slots && slots.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {slots.map((s) => (
                          <button data-anim type="button" key={s} dir="ltr" onClick={() => { setSlot(s); go(4) }} className={`rounded-xl border px-2 py-3 text-sm tabular-nums transition-all ${slot === s ? 'border-deep bg-deep text-ivory' : 'border-deep/10 hover:border-emerald'}`}>{s.split(' - ')[0]}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-6"><button type="button" onClick={() => go(2)} className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-6 py-3 text-sm font-medium text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{L('Back', 'رجوع')}</button></div>
                </section>
              )}

              {step === 4 && doctor && (
                <section>
                  <p data-anim className="rounded-2xl bg-mist px-5 py-4 text-sm text-deep">
                    {doctorName(doctor, lang)} · {fmt(date, { weekday: 'long', day: 'numeric', month: 'long' })} · <span dir="ltr">{slot.split(' - ')[0]}</span>
                  </p>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label data-anim className="block text-sm font-medium text-deep">{L('Full name', 'الاسم بالكامل')} <span className="text-emerald">*</span>
                      <input required maxLength={120} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={input} /></label>
                    <label data-anim className="block text-sm font-medium text-deep">{L('Mobile', 'رقم الموبايل')} <span className="text-emerald">*</span>
                      <input required type="tel" inputMode="tel" dir="ltr" maxLength={20} autoComplete="tel" placeholder="01X XXXX XXXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={input + ' rtl:text-right'} /></label>
                    <label data-anim className="block text-sm font-medium text-deep">{L('Email', 'البريد الإلكتروني')}
                      <input type="email" dir="ltr" maxLength={120} autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={input + ' rtl:text-right'} /></label>
                    <label data-anim className="block text-sm font-medium text-deep">{L('Gender', 'النوع')}
                      <select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value as '1' | '2' })} className={input}><option value="1">{L('Male', 'ذكر')}</option><option value="2">{L('Female', 'أنثى')}</option></select></label>
                    <label data-anim className="block text-sm font-medium text-deep">{L('Date of birth', 'تاريخ الميلاد')}
                      <input type="date" max={addDays(todayISO(), -1)} value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} className={input} /></label>
                    <label data-anim className="block text-sm font-medium text-deep">{L('Promo code (optional)', 'كود الخصم (اختياري)')}
                      <input maxLength={30} autoComplete="off" value={f.coupon} onChange={(e) => setF({ ...f, coupon: e.target.value })} className={input} /></label>
                    <label data-anim className="block text-sm font-medium text-deep md:col-span-2">{L('Anything we should know?', 'ملاحظات للطبيب')}
                      <textarea rows={2} maxLength={1000} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className={input + ' resize-none'} /></label>
                    <label data-anim className="flex items-start gap-3 text-sm text-charcoal md:col-span-2">
                      <input type="checkbox" checked={f.create_account} onChange={(e) => setF({ ...f, create_account: e.target.checked })} className="mt-0.5 size-4 accent-[#0E4D3C]" />
                      {L('Create my patient account to see my visits, prescriptions and invoices', 'أنشئ حسابي كمريض لأرى زياراتي وروشتاتي وفواتيري')}
                    </label>
                    {f.create_account && (
                      <label className="block text-sm font-medium text-deep md:col-span-2">{L('Choose a password (8+ characters)', 'اختر كلمة مرور (٨ أحرف على الأقل)')}
                        <input type="password" minLength={8} maxLength={100} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className={input} /></label>
                    )}
                    <label data-anim className="flex items-start gap-3 text-sm text-charcoal md:col-span-2">
                      <input type="checkbox" required checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-4 accent-[#0E4D3C]" />
                      {L('I agree that the clinic may contact me about this appointment.', 'أوافق على أن تتواصل معي العيادة بخصوص هذا الموعد.')} <span className="text-emerald">*</span>
                    </label>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => go(3)} className="inline-flex items-center gap-2 rounded-full border border-deep/15 px-6 py-3 text-sm font-medium text-deep"><ArrowLeft className="size-4 rtl:-scale-x-100" />{L('Back', 'رجوع')}</button>
                    <button type="submit" disabled={busy || (f.create_account && f.password.length < 8)} className="rounded-full bg-deep px-8 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-emerald disabled:opacity-40">{busy ? '…' : L('Confirm booking', 'تأكيد الحجز')}</button>
                  </div>
                </section>
              )}

              {step === 5 && done && (
                <section className="py-6 text-center">
                  <span data-anim className="mx-auto grid size-20 place-items-center rounded-full bg-deep text-jade"><Check className="size-9" /></span>
                  <h2 data-anim className="font-display mt-6 text-3xl font-bold text-charcoal md:text-4xl">{L('You are booked!', 'تم الحجز بنجاح!')}</h2>
                  <p data-anim className="mx-auto mt-4 max-w-lg leading-relaxed text-charcoal/75">{done.message}</p>
                  {done.pay_url && <a href={done.pay_url} className="mt-6 inline-flex rounded-full bg-deep px-7 py-3.5 text-sm font-medium text-ivory">{L('Pay the deposit', 'ادفع العربون')}</a>}
                  <div data-anim className="mt-8"><Link to="/" className="text-sm text-emerald hover:text-deep">{L('Back to home', 'الرجوع للرئيسية')}</Link></div>
                </section>
              )}
            </form>
          </div>

          <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
            <div className="glow-bg grain relative overflow-hidden rounded-[2rem] p-7 text-ivory">
              <Mark size={240} tooth="rgba(191,227,211,.08)" smile="rgba(247,244,238,.06)" className="pointer-events-none absolute -end-14 -bottom-14" />
              <p className="eyebrow text-jade">{L('Your booking', 'حجزك')}</p>
              <dl className="relative mt-6 space-y-5">
                <div><dt className="text-xs text-jade/80">{L('Services', 'الخدمات')}</dt><dd className="font-display mt-1">{chosenServices.length ? chosenServices.map((s) => l(s, 'name')).join('، ') : L('Consultation', 'كشف')}</dd></div>
                <div><dt className="text-xs text-jade/80">{L('Doctor', 'الطبيب')}</dt><dd className="font-display mt-1">{doctor ? doctorName(doctor, lang) : '—'}</dd></div>
                <div><dt className="text-xs text-jade/80">{L('Time', 'الموعد')}</dt><dd className="font-display mt-1">{slot ? <>{fmt(date, { weekday: 'short', day: 'numeric', month: 'short' })} · <span dir="ltr">{slot.split(' - ')[0]}</span></> : '—'}</dd></div>
              </dl>
            </div>
            <ul className="mt-4 space-y-3 rounded-[2rem] bg-white p-6 text-sm text-charcoal/80">
              <li className="flex gap-3"><FileText className="size-4 shrink-0 text-emerald" />{L('Your plan is written before we begin.', 'خطتك مكتوبة قبل ما نبدأ.')}</li>
              <li className="flex gap-3"><Clock className="size-4 shrink-0 text-emerald" />{L('You get an SMS / WhatsApp confirmation.', 'هيوصلك تأكيد برسالة أو واتساب.')}</li>
              <li className="flex gap-3"><ShieldCheck className="size-4 shrink-0 text-emerald" />{L('Free to reschedule — just call us.', 'تقدر تغيّر الميعاد — كلمنا بس.')}</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
