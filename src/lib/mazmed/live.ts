/**
 * Running inside MazMed (the clinic's own domain): MazMed serves this site and writes the
 * clinic's live data into the page as window.__MAZMED__ (App\Services\Sites\ClinicSiteData).
 * The website then shows MazMed's doctors, services and branches, and its forms post to
 * MazMed's booking routes on the same domain with the page's CSRF token.
 */
import type { Branch, Doctor, Faq, Review, Service, ServiceCategory, Specialization } from './types'

type LiveService = Omit<Service, 'icon' | 'image'> & { image: string | null }
type LiveDoctor = Omit<Doctor, 'title'> & { title: string; title_ar: string; branch_ids: number[] }

export type MazmedPage = {
  version: number
  clinic: { name: string; name_ar: string | null; logo: string | null; language: string }
  settings: { phone: string | null; email: string | null; address: string | null; whatsapp: string | null; instagram: string | null; facebook: string | null; tiktok: string | null; youtube: string | null }
  categories: Pick<ServiceCategory, 'id' | 'name' | 'name_ar' | 'slug'>[]
  services: LiveService[]
  specializations: (Specialization & { slug: string })[]
  doctors: LiveDoctor[]
  branches: (Omit<Branch, 'is_active'> & { latitude: number | null; longitude: number | null })[]
  faqs: Faq[]
  reviews: { id: number; name: string; review: string; rating: number; doctor_id: number | null; reply: string | null; created_at: string | null }[]
  modules: { online_booking: boolean; patient_portal: boolean }
  routes: { slots: string; booking: string; appointment: string; form: string; login: string; portal: string | null }
}

declare global {
  interface Window { __MAZMED__?: MazmedPage }
}

export const page: MazmedPage | undefined = typeof window !== 'undefined' ? window.__MAZMED__ : undefined
export const isLive = !!page

export const csrfToken = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''

/** Icon for a MazMed service (MazMed keeps photos, not the site's line icons). */
function iconFor(s: { name: string; slug: string }): string {
  const t = `${s.slug} ${s.name}`.toLowerCase()
  const rules: [RegExp, string][] = [
    [/implant/, 'implant'], [/root|canal|endo/, 'rootcanal'], [/crown|bridge/, 'crown'], [/whiten|bleach/, 'whitening'],
    [/veneer|smile|cosmetic/, 'veneer'], [/align|ortho|brace/, 'aligner'], [/kid|child|pedi/, 'kids'], [/wisdom|extract|surg/, 'extraction'],
    [/fill|composite/, 'filling'], [/check|clean|scal|exam|consult/, 'checkup'],
  ]
  return rules.find(([r]) => r.test(t))?.[1] ?? 'tooth'
}

/** The site's tables, filled from MazMed instead of the demo data. */
export function liveTables(p: MazmedPage) {
  return {
    categories: p.categories.map((c, i): ServiceCategory => ({ ...c, sort_order: i, is_active: true, show_on_website: true })),
    services: p.services.map((s): Service => ({ ...s, icon: iconFor(s), image: s.image ?? undefined, faqs: s.faqs ?? [] }) as Service),
    specializations: p.specializations.map(({ id, name, name_ar }) => ({ id, name, name_ar: name_ar ?? name })),
    doctors: p.doctors.map((d): Doctor => ({ ...d, title: d.title, full_name_ar: d.full_name_ar ?? d.user.full_name }) as Doctor),
    branches: p.branches.map((b): Branch => ({
      ...b, name_ar: b.name_ar ?? b.name, address: b.address ?? '', address_ar: b.address_ar ?? b.address ?? '', phone: b.phone ?? p.settings.phone ?? '',
      whatsapp: b.whatsapp ?? '', email: b.email ?? p.settings.email ?? '', map_url: b.map_url ?? '', hours: b.hours ?? '', hours_ar: b.hours_ar ?? b.hours ?? '', is_active: true,
    })),
    faqs: p.faqs.map((f) => ({ ...f, question_ar: f.question_ar ?? f.question, answer_ar: f.answer_ar ?? f.answer })),
    reviews: p.reviews.map((r): Review => ({
      id: r.id, patient_id: null, name: r.name, doctor_id: r.doctor_id, service_id: null, rating: r.rating, review: r.review,
      is_published: true, reply: r.reply, created_at: r.created_at ?? '',
    })),
    settings: { instagram: p.settings.instagram ?? '', facebook: p.settings.facebook ?? '', mazmed_url: '' },
  }
}
