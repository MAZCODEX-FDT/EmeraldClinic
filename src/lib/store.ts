import { useSyncExternalStore } from 'react'
import type {
  ServiceCategory, Service, Specialization, Doctor, Branch, Resource, Faq, Patient, Appointment,
  Enquiry, Review, DentalChartEntry, TreatmentPlan, Invoice, SiteSettings,
} from './mazmed/types'
import { seed } from './seed'
import { page, liveTables } from './mazmed/live'

export * from './mazmed/types'

/** Local mirror of the MazMed tables the website and demo dashboard use. */
export type DB = {
  version: number
  categories: ServiceCategory[]; services: Service[]; specializations: Specialization[]; doctors: Doctor[]
  branches: Branch[]; resources: Resource[]; faqs: Faq[]
  patients: Patient[]; appointments: Appointment[]; enquiries: Enquiry[]; reviews: Review[]
  chart: DentalChartEntry[]; plans: TreatmentPlan[]; invoices: Invoice[]
  settings: SiteSettings
}

const KEY = 'emerald.db'
const VERSION = 10

function load(): DB {
  // Served by MazMed: the clinic's real doctors, services and branches, nothing kept in the browser.
  if (page) return { ...seed(VERSION), ...liveTables(page) }
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw) as DB
      if (d.version === VERSION) return d
    }
  } catch { /* ignore */ }
  return seed(VERSION)
}

let state: DB = load()
const listeners = new Set<() => void>()
const persist = () => { if (page) return; try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota / private */ } }

export const db = {
  get: () => state,
  set(recipe: (d: DB) => void) {
    const next = structuredClone(state)
    recipe(next)
    state = next
    persist()
    listeners.forEach((l) => l())
  },
  reset() { state = seed(VERSION); persist(); listeners.forEach((l) => l()) },
  subscribe(l: () => void) {
    listeners.add(l)
    const onStorage = (e: StorageEvent) => { if (!page && e.key === KEY) { state = load(); l() } }
    window.addEventListener('storage', onStorage)
    return () => { listeners.delete(l); window.removeEventListener('storage', onStorage) }
  },
}

/** Select a slice by reference (never build new arrays in the selector). */
export function useDB<T>(select: (d: DB) => T): T {
  return useSyncExternalStore(db.subscribe, () => select(state))
}

export const nextId = (rows: { id: number }[]) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1
export const todayISO = () => toISO(new Date())
export function toISO(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export function addDays(iso: string, n: number) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return toISO(d) }
export const money = (n: number, lang: 'en' | 'ar' = 'en') =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 0 }).format(n) + (lang === 'ar' ? ' ج.م' : ' EGP')

/** Bilingual MazMed column: loc(service, 'name', lang) → name_ar in Arabic when filled. */
export function loc<T extends object>(row: T, key: string, lang: 'en' | 'ar'): string {
  const r = row as Record<string, unknown>
  return String((lang === 'ar' && r[key + '_ar']) || r[key] || '')
}
export const doctorName = (d: Doctor, lang: 'en' | 'ar') => (lang === 'ar' ? d.full_name_ar || d.user.full_name : d.user.full_name)
export const mainBranch = (d: DB) => d.branches.find((b) => b.is_main) ?? d.branches[0]
