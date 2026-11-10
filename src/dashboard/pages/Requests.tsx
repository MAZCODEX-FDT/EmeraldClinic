import { useMemo, useState } from 'react'
import { Phone, MessageCircle, CalendarPlus, Globe2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, loc, ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from '@/lib/store'
import { egyptE164 } from '@/lib/mazmed/time'
import { PageHeader, Card, ReqBadge, Btn, useTr, fmtDate, leadLabel } from '../ui'
import { AppointmentModal, blankDraft, type Draft } from './Appointments'

const PREF_START = { morning: 12 * 60, afternoon: 15 * 60, evening: 18 * 60 } as const

/** MazMed Enquiries — the leads pipeline (contact form, appointment requests, online bookings). */
export default function Requests() {
  const tr = useTr()
  const { lang } = useLang()
  const ar = lang === 'ar'
  const enquiries = useDB((d) => d.enquiries)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const patients = useDB((d) => d.patients)
  const [tab, setTab] = useState<EnquiryStatus | 'all'>('new')
  const [booking, setBooking] = useState<{ r: Enquiry; draft: Draft } | null>(null)
  const list = useMemo(() => enquiries.filter((r) => tab === 'all' || r.status === tab).sort((a, b) => b.created_at.localeCompare(a.created_at)), [enquiries, tab])
  const setStatus = (id: number, s: EnquiryStatus, extra: Partial<Enquiry> = {}) => db.set((d) => { const r = d.enquiries.find((x) => x.id === id); if (r) Object.assign(r, { status: s, ...extra }) })
  const sv = (id: number | null) => services.find((s) => s.id === id)

  const startBooking = (r: Enquiry) => {
    const e164 = egyptE164(r.phone)
    const existing = patients.find((p) => p.phone_e164 === e164)
    const s = sv(r.service_id)
    const doc = r.doctor_id ?? doctors.find((d) => s && d.service_ids.includes(s.id))?.id ?? doctors[0].id
    setBooking({ r, draft: blankDraft({
      patient_id: existing?.id ?? 0, newPatient: existing ? undefined : { name: r.name, phone: r.phone },
      doctor_id: doc, service_ids: s ? [s.id] : [], total_charge: s?.charges ?? 0, minutes: s?.service_time ?? 30,
      date: r.preferred_date ?? new Date().toISOString().slice(0, 10), start: PREF_START[r.preferred_time ?? 'evening'],
      description: r.message || null, source: r.source === 'website' ? 'website' : r.source === 'whatsapp' ? 'whatsapp' : 'phone',
    }) })
  }
  const counts = (s: EnquiryStatus) => enquiries.filter((r) => r.status === s).length
  const src = (s: Enquiry['source']) => s === 'website' ? <Globe2 className="size-3.5" /> : s === 'phone' ? <Phone className="size-3.5" /> : <MessageCircle className="size-3.5" />
  const prefLabel = (p: Enquiry['preferred_time']) => p ? (ar ? { morning: 'صباحًا', afternoon: 'بعد الظهر', evening: 'مساءً' } : { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' })[p] : ''

  return (
    <>
      <PageHeader title={tr('Leads', 'العملاء المحتملين')} sub={tr('MazMed enquiries — website bookings, contact form, WhatsApp and calls.', 'استفسارات MazMed — حجوزات الموقع، فورم التواصل، الواتساب والتليفون.')} />
      <div className="mb-4 flex flex-wrap gap-2">
        {[...ENQUIRY_STATUSES, 'all' as const].map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-2 text-sm ${tab === k ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white'}`}>
            {k === 'all' ? tr('All', 'الكل') : leadLabel(k, ar)}
            {k !== 'all' && <span className="ms-2 opacity-60">{counts(k)}</span>}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-deep">{r.name}{r.priority === 'high' && <span className="ms-2 rounded bg-beige px-1.5 align-middle text-[0.65rem] font-normal text-charcoal">{tr('priority', 'أولوية')}</span>}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-stone"><span dir="ltr">{r.phone}</span>·<span className="inline-flex items-center gap-1">{src(r.source)}{r.source}</span>·{r.form_name}·{fmtDate(r.created_at, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <ReqBadge s={r.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ivory p-3 text-sm">
              <div><p className="text-xs text-stone">{tr('Service', 'الخدمة')}</p><p className="font-medium text-charcoal">{sv(r.service_id) ? loc(sv(r.service_id)!, 'name', lang) : r.subject || '—'}</p></div>
              <div><p className="text-xs text-stone">{tr('Preferred', 'الميعاد المفضل')}</p><p className="font-medium text-charcoal">{r.preferred_date ? fmtDate(r.preferred_date, lang, { weekday: 'short', day: 'numeric', month: 'short' }) : '—'} {prefLabel(r.preferred_time) && `· ${prefLabel(r.preferred_time)}`}</p></div>
            </div>
            {r.message && <p className="mt-3 text-sm text-charcoal/80">“{r.message}”</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <a href={`tel:${r.phone}`} onClick={() => r.status === 'new' && setStatus(r.id, 'contacted')} className="inline-flex items-center gap-1.5 rounded-full border border-deep/15 px-3.5 py-2 text-xs font-medium text-deep hover:bg-deep/5"><Phone className="size-3.5" />{tr('Call', 'اتصل')}</a>
              <a href={`https://wa.me/${(egyptE164(r.phone) ?? r.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={() => r.status === 'new' && setStatus(r.id, 'contacted')} className="inline-flex items-center gap-1.5 rounded-full border border-deep/15 px-3.5 py-2 text-xs font-medium text-deep hover:bg-deep/5"><MessageCircle className="size-3.5" />WhatsApp</a>
              {r.status !== 'booked' && <Btn className="!px-3.5 !py-2 !text-xs" onClick={() => startBooking(r)}><CalendarPlus className="size-3.5" />{tr('Book it', 'احجزه')}</Btn>}
              <select aria-label={tr('Status', 'الحالة')} value={r.status} onChange={(e) => setStatus(r.id, e.target.value as EnquiryStatus)} className="ms-auto rounded-full border border-deep/10 bg-white px-3 py-1.5 text-xs">
                {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{leadLabel(s, ar)}</option>)}
              </select>
            </div>
          </Card>
        ))}
        {list.length === 0 && <p className="col-span-full py-16 text-center text-stone">{tr('Nothing here.', 'مفيش حاجة هنا.')}</p>}
      </div>
      {booking && <AppointmentModal key={booking.r.id} draft={booking.draft} onClose={() => setBooking(null)} onSaved={(id) => setStatus(booking.r.id, 'booked', { appointment_id: id })} />}
    </>
  )
}
