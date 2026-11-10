import { useMemo, useRef, useState } from 'react'
import { Phone, MessageCircle, Mail, MapPin, Clock, Check } from 'lucide-react'
import { useLang, useL } from '@/lib/i18n'
import { useDB, mainBranch } from '@/lib/store'
import { mazmed } from '@/lib/mazmed/client'
import { egyptE164 } from '@/lib/mazmed/time'
import { gsap, useGSAP } from '@/lib/gsap'
import { PageHero } from './PageHero'

/** Contact — messages go to MazMed as leads (POST /site/appointment → Enquiry). */
export default function Contact() {
  const { l } = useLang()
  const L = useL()
  const branch = useDB(mainBranch)
  const all = useDB((d) => d.services)
  const services = useMemo(() => all.filter((s) => s.status && s.show_on_website), [all])
  const [f, setF] = useState({ name: '', phone: '', service_id: '', preferred_time: '', message: '', consent: false })
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [err, setErr] = useState('')
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => { gsap.from('[data-c]', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9 }) }, { scope: root })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2 || !egyptE164(f.phone) || !f.consent) { setErr(L('Please enter your name, a valid mobile number and accept to be contacted.', 'من فضلك اكتب اسمك ورقم موبايل صحيح ووافق على التواصل.')); return }
    setState('busy'); setErr('')
    const res = await mazmed.request({
      name: f.name, phone: f.phone, service_id: Number(f.service_id) || null, branch_id: branch.id,
      preferred_time: (f.preferred_time || null) as 'morning' | 'afternoon' | 'evening' | null, message: f.message, consent: f.consent,
    })
    if (!res.ok) { setErr(res.message); setState('idle'); return }
    setState('done')
  }

  const cards = [
    { icon: Phone, t: L('Call us', 'اتصل بينا'), v: branch.phone, href: `tel:${branch.phone.replace(/\s/g, '')}`, ltr: true },
    { icon: MessageCircle, t: 'WhatsApp', v: L('Chat with the desk', 'كلم الريسبشن'), href: `https://wa.me/${branch.whatsapp.replace(/\D/g, '')}` },
    { icon: Mail, t: L('Email', 'الإيميل'), v: branch.email, href: `mailto:${branch.email}`, ltr: true },
    { icon: MapPin, t: L('Visit', 'زورنا'), v: l(branch, 'address'), href: branch.map_url },
  ]
  const input = 'mt-2 w-full rounded-2xl border border-deep/15 bg-white px-5 py-3.5 outline-none transition-colors focus:border-emerald'

  return (
    <div ref={root}>
      <PageHero image="/img/dr-nour-cut.webp" eyebrow={L('Contact', 'تواصل')} title={L('We’re here to help.', 'إحنا هنا علشانك.')}
        sub={L('Ask anything — about a treatment, a cost or a worry. The desk answers within working hours.', 'اسأل عن أي حاجة — علاج، تكلفة، أو حاجة مقلقاك. الريسبشن بيرد في مواعيد العمل.')} />
      <section className="bg-[#FBFBFA] px-5 pb-24 md:px-10">
        <div className="mx-auto max-w-[88rem]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <a data-c key={c.t} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="group rounded-[1.75rem] bg-white p-7 transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(14,77,60,.35)]">
                <span className="grid size-12 place-items-center rounded-2xl bg-mist text-deep transition-colors group-hover:bg-deep group-hover:text-jade"><c.icon className="size-5" /></span>
                <p className="mt-6 text-sm text-stone">{c.t}</p>
                <p className="font-display mt-1 text-lg font-medium text-charcoal" dir={c.ltr ? 'ltr' : undefined}>{c.v}</p>
              </a>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <form data-c onSubmit={submit} noValidate className="rounded-[2rem] bg-white p-6 md:p-10">
              {state === 'done' ? (
                <div className="py-10 text-center">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-deep text-jade"><Check className="size-7" /></span>
                  <h2 className="font-display mt-6 text-3xl font-bold text-charcoal">{L('Message received.', 'وصلتنا رسالتك.')}</h2>
                  <p className="mt-3 text-charcoal/70">{L('Thank you — we will call you within working hours.', 'شكرًا ليك — هنكلمك في مواعيد العمل.')}</p>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-3xl font-bold text-charcoal">{L('Send us a message', 'ابعتلنا رسالة')}</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <label className="block text-sm font-medium text-deep">{L('Full name', 'الاسم بالكامل')} <span className="text-emerald">*</span>
                      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={255} autoComplete="name" className={input} /></label>
                    <label className="block text-sm font-medium text-deep">{L('Mobile', 'رقم الموبايل')} <span className="text-emerald">*</span>
                      <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} type="tel" dir="ltr" placeholder="01X XXXX XXXX" className={input + ' rtl:text-right'} /></label>
                    <label className="block text-sm font-medium text-deep">{L('About a treatment (optional)', 'بخصوص علاج (اختياري)')}
                      <select value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })} className={input}>
                        <option value="">—</option>{services.map((s) => <option key={s.id} value={s.id}>{l(s, 'name')}</option>)}
                      </select></label>
                    <label className="block text-sm font-medium text-deep">{L('Best time to call', 'أنسب وقت نكلمك')}
                      <select value={f.preferred_time} onChange={(e) => setF({ ...f, preferred_time: e.target.value })} className={input}>
                        <option value="">{L('Any time', 'أي وقت')}</option><option value="morning">{L('Morning', 'الصبح')}</option><option value="afternoon">{L('Afternoon', 'الضهر')}</option><option value="evening">{L('Evening', 'بالليل')}</option>
                      </select></label>
                    <label className="block text-sm font-medium text-deep md:col-span-2">{L('Your message', 'رسالتك')}
                      <textarea rows={4} maxLength={2000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} className={input + ' resize-none'} /></label>
                    <label className="flex items-start gap-3 text-sm text-charcoal md:col-span-2">
                      <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} className="mt-0.5 size-4 accent-[#0E4D3C]" />
                      {L('I agree that the clinic may contact me about my message.', 'أوافق على أن تتواصل معي العيادة بخصوص رسالتي.')}
                    </label>
                  </div>
                  {err && <p className="mt-4 rounded-xl bg-beige/70 px-4 py-3 text-sm text-charcoal">{err}</p>}
                  <button disabled={state === 'busy'} className="mt-6 rounded-full bg-deep px-8 py-3.5 text-sm font-medium text-ivory transition-colors hover:bg-emerald disabled:opacity-50">{state === 'busy' ? '…' : L('Send message', 'ابعت الرسالة')}</button>
                </>
              )}
            </form>
            <div data-c className="flex flex-col gap-4">
              <iframe title="Map" loading="lazy" className="min-h-[18rem] w-full flex-1 rounded-[2rem] border-0" src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`} />
              <div className="flex items-center gap-3 rounded-[1.75rem] bg-white p-6 text-charcoal/80"><Clock className="size-5 shrink-0 text-emerald" />{l(branch, 'hours')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
