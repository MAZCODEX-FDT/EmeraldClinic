import { useSyncExternalStore } from 'react'
import type { Bi } from './i18n'
import { seed } from './seed'

export type Category = 'preventive' | 'restorative' | 'cosmetic' | 'surgical' | 'ortho' | 'pediatric'
export type Service = {
  id: string; slug: string; icon: string; category: Category
  name: Bi; short: Bi; long: Bi; steps: Bi[]
  duration: number; sessions: Bi; price: number; visible: boolean
}
export type Doctor = {
  id: string; name: Bi; role: Bi; bio: Bi; initials: string
  services: string[]; days: number[]; color: string; visible: boolean; years: number
}
export type ToothState = 'healthy' | 'caries' | 'filling' | 'rootcanal' | 'crown' | 'implant' | 'missing' | 'watch'
export type PlanStatus = 'planned' | 'in-progress' | 'done'
export type PlanItem = { id: string; tooth?: number; serviceId: string; note: string; cost: number; status: PlanStatus }
export type Patient = {
  id: string; name: string; phone: string; gender: 'm' | 'f'; dob: string; email?: string
  notes: string; createdAt: string; teeth: Record<number, ToothState>; plan: PlanItem[]
  planApproved: boolean; tags: string[]
}
export type ApptStatus = 'booked' | 'confirmed' | 'arrived' | 'in-chair' | 'done' | 'no-show' | 'cancelled'
export type Appointment = {
  id: string; patientId: string; doctorId: string; serviceId: string
  date: string; time: string; duration: number; chair: number; status: ApptStatus; notes: string
}
export type RequestStatus = 'new' | 'contacted' | 'booked' | 'declined'
export type BookingRequest = {
  id: string; name: string; phone: string; serviceId: string; doctorId?: string
  date: string; time: string; message: string; createdAt: string; status: RequestStatus; source: 'website' | 'whatsapp' | 'phone'
}
export type Review = { id: string; name: string; text: string; lang: 'ar' | 'en'; rating: number; visible: boolean; date: string; serviceId?: string }
export type Payment = { id: string; patientId: string; amount: number; method: 'cash' | 'card' | 'instapay'; date: string; note: string }
export type Settings = {
  phone: string; whatsapp: string; email: string; address: Bi; hours: Bi
  mapUrl: string; chairs: number; instagram: string; facebook: string
}
export type DB = {
  version: number; services: Service[]; doctors: Doctor[]; patients: Patient[]
  appointments: Appointment[]; requests: BookingRequest[]; reviews: Review[]
  payments: Payment[]; settings: Settings
}

const KEY = 'emerald.db'
const VERSION = 4

function load(): DB {
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

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota / private */ }
}

export const db = {
  get: () => state,
  set(recipe: (d: DB) => void) {
    const next = structuredClone(state)
    recipe(next)
    state = next
    persist()
    listeners.forEach((l) => l())
  },
  reset() {
    state = seed(VERSION)
    persist()
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) { state = load(); l() } }
    window.addEventListener('storage', onStorage)
    return () => { listeners.delete(l); window.removeEventListener('storage', onStorage) }
  },
}

export function useDB<T>(select: (d: DB) => T): T {
  return useSyncExternalStore(db.subscribe, () => select(state))
}

export const uid = (p = '') => p + Math.random().toString(36).slice(2, 9)
export const todayISO = () => toISO(new Date())
export function toISO(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
export function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return toISO(d)
}
export const money = (n: number, lang: 'en' | 'ar' = 'en') =>
  new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 0 }).format(n) + (lang === 'ar' ? ' ج.م' : ' EGP')
