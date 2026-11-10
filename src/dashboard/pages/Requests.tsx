import { useMemo, useState } from 'react'
import { Phone, MessageCircle, CalendarPlus, X, Globe2 } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { db, useDB, type BookingRequest, type RequestStatus } from '@/lib/store'
import { PageHeader, Card, ReqBadge, Btn, useTr, fmtDate } from '../ui'
import { AppointmentModal, type Draft } from './Appointments'

export default function Requests() {
  const tr = useTr()
  const { lang, pick } = useLang()
  const requests = useDB((d) => d.requests)
  const services = useDB((d) => d.services)
  const doctors = useDB((d) => d.doctors)
  const patients = useDB((d) => d.patients)
  const [tab, setTab] = useState<RequestStatus | 'all'>('new')
  const [booking, setBooking] = useState<{ r: BookingRequest; draft: Draft } | null>(null)
  const list = useMemo(() => requests.filter((r) => tab === 'all' || r.status === tab), [requests, tab])
  const setStatus = (id: string, s: RequestStatus) => db.set((d) => { const r = d.requests.find((x) => x.id === id); if (r) r.status = s })
  const sv = (id: string) => services.find((s) => s.id === id)

  const startBooking = (r: BookingRequest) => {
    const existing = patients.find((p) => p.phone.replace(/\D/g, '').endsWith(r.phone.replace(/\D/g, '').slice(-10)))
    const s = sv(r.serviceId)
    const doc = r.doctorId ?? doctors.find((d) => d.services.includes(r.serviceId))?.id ?? doctors[0].id
    setBooking({ r, draft: { patientId: existing?.id ?? '', newPatient: existing ? undefined : { name: r.name, phone: r.phone }, doctorId: doc, serviceId: r.serviceId, date: r.date, time: r.time, duration: s?.duration ?? 45, chair: 1, status: 'confirmed', notes: r.message } })
  }
  const counts = (s: RequestStatus) => requests.filter((r) => r.status === s).length
  const src = { website: <Globe2 className="size-3.5" />, whatsapp: <MessageCircle className="size-3.5" />, phone: <Phone className="size-3.5" /> }

  return (
    <>
      <PageHeader title={tr('Booking requests', 'طلبات الحجز')} sub={tr('Requests from the website booking form, WhatsApp and calls.', 'الطلبات اللي جاية من فورم الموقع والواتساب والتليفون.')} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(['new', 'contacted', 'booked', 'declined', 'all'] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full border px-4 py-2 text-sm ${tab === k ? 'border-deep bg-deep text-ivory' : 'border-deep/10 bg-white'}`}>
            {{ new: tr('New', 'جديد'), contacted: tr('Contacted', 'تم التواصل'), booked: tr('Booked', 'اتحجز'), declined: tr('Declined', 'مرفوض'), all: tr('All', 'الكل') }[k]}
            {k !== 'all' && <span className="ms-2 opacity-60">{counts(k)}</span>}
          </button>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-deep">{r.name}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-stone"><span dir="ltr">{r.phone}</span>·<span className="inline-flex items-center gap-1">{src[r.source]}{r.source}</span>·{fmtDate(r.createdAt, lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <ReqBadge s={r.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-ivory p-3 text-sm">
              <div><p className="text-xs text-stone">{tr('Treatment', 'العلاج')}</p><p className="font-medium text-charcoal">{sv(r.serviceId) ? pick(sv(r.serviceId)!.name) : '—'}</p></div>
              <div><p className="text-xs text-stone">{tr('Preferred', 'الميعاد المفضل')}</p><p className="font-medium text-charcoal">{fmtDate(r.date, lang, { weekday: 'short', day: 'numeric', month: 'short' })} · <span dir="ltr">{r.time}</span></p></div>
            </div>
            {r.message && <p className="mt-3 text-sm text-charcoal/80">“{r.message}”</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${r.phone}`} onClick={() => r.status === 'new' && setStatus(r.id, 'contacted')} className="inline-flex items-center gap-1.5 rounded-full border border-deep/15 px-3.5 py-2 text-xs font-medium text-deep hover:bg-deep/5"><Phone className="size-3.5" />{tr('Call', 'اتصل')}</a>
              <a href={`https://wa.me/2${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={() => r.status === 'new' && setStatus(r.id, 'contacted')} className="inline-flex items-center gap-1.5 rounded-full border border-deep/15 px-3.5 py-2 text-xs font-medium text-deep hover:bg-deep/5"><MessageCircle className="size-3.5" />WhatsApp</a>
              {r.status !== 'booked' && <Btn className="!px-3.5 !py-2 !text-xs" onClick={() => startBooking(r)}><CalendarPlus className="size-3.5" />{tr('Book it', 'احجزه')}</Btn>}
              {r.status !== 'declined' && r.status !== 'booked' && <button onClick={() => setStatus(r.id, 'declined')} className="ms-auto inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal"><X className="size-3.5" />{tr('Decline', 'رفض')}</button>}
            </div>
          </Card>
        ))}
        {list.length === 0 && <p className="col-span-full py-16 text-center text-stone">{tr('Nothing here.', 'مفيش حاجة هنا.')}</p>}
      </div>
      {booking && <AppointmentModal key={booking.r.id} draft={booking.draft} onClose={() => setBooking(null)} onSaved={() => setStatus(booking.r.id, 'booked')} />}
    </>
  )
}
