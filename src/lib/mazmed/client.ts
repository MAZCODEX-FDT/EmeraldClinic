/**
 * The website's connection to MazMed.
 *
 * - remote: when a MazMed URL is set (Settings › MazMed connection, or VITE_MAZMED_URL),
 *   slots and bookings go to MazMed's own public website endpoints:
 *     GET  {url}/site/booking/slots   (SiteBookingController::slots)
 *     POST {url}/site/booking         (SiteBookingController::book)
 *     POST {url}/site/appointment     (SiteController::requestAppointment)
 * - local: the same rules run against the demo data in this browser, so the
 *   site and dashboard behave the way they will once connected.
 */
import { db, nextId, todayISO, type DB } from '../store'
import { isLive, csrfToken } from './live'
import type { BookingPayload, BookingResult, Doctor, RequestPayload } from './types'
import { egyptE164, fromMinutes, parseSlot, slotOf, toMinutes } from './time'

/** '' (same domain) when MazMed serves this site; otherwise the URL set in Settings or VITE_MAZMED_URL. */
export const mazmedUrl = () => isLive ? '' : (db.get().settings.mazmed_url || import.meta.env.VITE_MAZMED_URL || '').replace(/\/$/, '')
export const isRemote = () => isLive || !!mazmedUrl()

/* ---------- local engine (mirrors AppointmentBooker::freeSlots) ---------- */

function duration(d: DB, doctor: Doctor, serviceIds: number[]) {
  const mins = d.services.filter((s) => serviceIds.includes(s.id)).reduce((a, s) => a + s.service_time, 0)
  const gap = doctor.session_gap || 30
  return Math.max(gap, Math.ceil((mins || gap) / gap) * gap)
}

function localSlots(doctorId: number, date: string, serviceIds: number[], branchId?: number | null): string[] {
  const d = db.get()
  const doctor = d.doctors.find((x) => x.id === doctorId)
  if (!doctor || !doctor.online_booking) return []
  const dow = new Date(date + 'T00:00:00').getDay()
  const len = duration(d, doctor, serviceIds)
  const gap = doctor.session_gap || 30
  const nowMins = date === todayISO() ? new Date().getHours() * 60 + new Date().getMinutes() + 60 : -1
  const taken = d.appointments
    .filter((a) => a.doctor_id === doctorId && a.date === date && !['cancelled', 'cancelled_by_doctor', 'rescheduled'].includes(a.status))
    .map((a) => [toMinutes(a.from_time, a.from_time_type), toMinutes(a.to_time, a.to_time_type)])
  const out: string[] = []
  for (const w of doctor.week_days.filter((w) => w.day_of_week === dow && (!branchId || !w.branch_id || w.branch_id === branchId))) {
    const start = toMinutes(w.start_time, w.start_time_type)
    const end = toMinutes(w.end_time, w.end_time_type)
    for (let s = start; s + len <= end; s += gap) {
      if (s <= nowMins) continue
      if (taken.some(([a, b]) => s < b && s + len > a)) continue
      out.push(slotOf(s, s + len))
    }
  }
  return out
}

function localBook(p: BookingPayload): BookingResult {
  const phone = egyptE164(p.phone)
  const ar = document.documentElement.lang === 'ar'
  if (!phone) return { ok: false, message: ar ? 'اكتب رقم موبايل مصري صحيح.' : 'Enter a valid Egyptian mobile number.' }
  if (!localSlots(p.doctor_id, p.date, p.services, p.branch_id).includes(p.slot)) return { ok: false, message: ar ? 'الموعد ده اتحجز لسه. اختار موعد تاني.' : 'This time slot was just taken. Please pick another.' }
  let reference = ''
  let doctorName = ''
  db.set((d) => {
    let patient = d.patients.find((x) => x.phone_e164 === phone)
    if (!patient) {
      patient = {
        id: nextId(d.patients), patient_unique_id: 'P' + (1000 + nextId(d.patients)), name: p.name.trim(), phone: p.phone.trim(), phone_e164: phone,
        email: p.email || null, gender: p.gender === '2' ? 2 : 1, dob: p.dob || null, source: 'website', notes: '', tags: ['new'], created_at: todayISO(),
      }
      d.patients.unshift(patient)
    }
    const [from, to] = parseSlot(p.slot)
    const f = fromMinutes(from), t = fromMinutes(to)
    reference = Math.random().toString(36).slice(2, 10).toUpperCase()
    const doctor = d.doctors.find((x) => x.id === p.doctor_id)!
    doctorName = doctor.user.full_name
    const ids = d.services.filter((s) => p.services.includes(s.id)).map((s) => s.id)
    const appt = {
      id: nextId(d.appointments), appointment_unique_id: reference, patient_id: patient.id, doctor_id: doctor.id, branch_id: p.branch_id ?? 1,
      date: p.date, from_time: f.time, from_time_type: f.type, to_time: t.time, to_time_type: t.type, status: 'booked' as const,
      service_ids: ids, description: p.notes || null, total_charge: d.services.filter((s) => ids.includes(s.id)).reduce((a, s) => a + s.charges, 0),
      source: 'website' as const, resource_id: null,
    }
    d.appointments.push(appt)
    // Like MazMed: the booking also shows in the leads pipeline, already won.
    d.enquiries.unshift({
      id: nextId(d.enquiries), name: p.name.trim(), phone: p.phone.trim(), email: p.email || null, subject: 'Online booking', message: reference,
      status: 'booked', source: 'website', priority: 'normal', form_name: 'Online booking', service_id: ids[0] ?? null, doctor_id: doctor.id,
      branch_id: appt.branch_id, preferred_date: p.date, preferred_time: null, patient_id: patient.id, appointment_id: appt.id, created_at: new Date().toISOString(),
    })
  })
  const when = new Date(p.date + 'T00:00:00').toLocaleDateString(ar ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + p.slot.split(' - ')[0]
  const docName = ar ? db.get().doctors.find((x) => x.id === p.doctor_id)?.full_name_ar || doctorName : doctorName
  return {
    ok: true, reference, pay_url: null,
    message: ar ? `تم حجز موعدك ${when} مع ${docName}. رقم الحجز ${reference}. هيوصلك تأكيد على الموبايل.` : `Booked for ${when} with ${docName}. Your reference is ${reference}. A confirmation is on its way to your mobile.`,
  }
}

function localRequest(p: RequestPayload) {
  db.set((d) => {
    d.enquiries.unshift({
      id: nextId(d.enquiries), name: p.name.trim(), phone: p.phone.trim(), email: null,
      subject: p.preferred_date ? 'Appointment request' : 'Website contact', message: p.message || '', status: 'new', source: 'website',
      priority: p.preferred_date ? 'high' : 'normal', form_name: p.preferred_date ? 'Appointment request' : 'Contact',
      service_id: p.service_id ?? null, doctor_id: p.doctor_id ?? null, branch_id: p.branch_id ?? null,
      preferred_date: p.preferred_date ?? null, preferred_time: p.preferred_time ?? null, patient_id: null, appointment_id: null,
      created_at: new Date().toISOString(),
    })
  })
  return { ok: true, message: 'Thank you — we will call you within working hours.' }
}

/* ---------- remote (MazMed) ---------- */

async function post(path: string, body: Record<string, unknown>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) v.forEach((x) => fd.append(`${k}[]`, String(x)))
    else fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
  }
  // On the clinic's own domain the page carries MazMed's CSRF token; the session cookie goes with it.
  if (isLive) fd.append('_token', csrfToken())
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
  if (isLive) headers['X-CSRF-TOKEN'] = csrfToken()
  const res = await fetch(mazmedUrl() + path, { method: 'POST', body: fd, credentials: isLive ? 'same-origin' : 'include', headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.ok === false) {
    const first = json.errors ? (Object.values(json.errors).flat()[0] as string) : undefined
    return { ok: false, message: json.message || first || 'Could not send. Please try again.' }
  }
  return { ok: true, ...json }
}

/* ---------- public API used by the site ---------- */

export const mazmed = {
  async slots(args: { doctor_id: number; date: string; services: number[]; branch_id?: number | null }): Promise<string[]> {
    if (!isRemote()) return localSlots(args.doctor_id, args.date, args.services, args.branch_id)
    const q = new URLSearchParams({ doctor_id: String(args.doctor_id), date: args.date })
    args.services.forEach((s) => q.append('services[]', String(s)))
    if (args.branch_id) q.append('branch_id', String(args.branch_id))
    try {
      const res = await fetch(`${mazmedUrl()}/site/booking/slots?${q}`, { headers: { Accept: 'application/json' }, credentials: isLive ? 'same-origin' : 'include' })
      return ((await res.json()).slots as string[]) || []
    } catch { return [] }
  },
  async book(p: BookingPayload): Promise<BookingResult> {
    if (!isRemote()) return localBook(p)
    return post('/site/booking', { ...p }) as Promise<BookingResult>
  },
  async request(p: RequestPayload): Promise<{ ok: boolean; message: string }> {
    if (!isRemote()) return localRequest(p)
    return post('/site/appointment', { ...p }) as Promise<{ ok: boolean; message: string }>
  },
}
