/** Time helpers in MazMed's 12-hour format ("04:30" + "PM", slots like "04:30 PM - 05:00 PM"). */

export const toMinutes = (time: string, type: 'AM' | 'PM') => {
  const [h, m] = time.split(':').map(Number)
  return ((h % 12) + (type === 'PM' ? 12 : 0)) * 60 + m
}

export const fromMinutes = (mins: number): { time: string; type: 'AM' | 'PM' } => {
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const type: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return { time: `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`, type }
}

export const label = (mins: number) => { const t = fromMinutes(mins); return `${t.time} ${t.type}` }

/** "04:30 PM - 05:00 PM" → [270+720, 300+720] minutes */
export const parseSlot = (slot: string): [number, number] => {
  const [a, b] = slot.split('-').map((s) => s.trim())
  const p = (s: string) => { const [t, ty] = s.split(' '); return toMinutes(t, ty as 'AM' | 'PM') }
  return [p(a), p(b)]
}

export const slotOf = (from: number, to: number) => `${label(from)} - ${label(to)}`

/** 24h "HH:MM" for <input type="time"> */
export const to24 = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
export const from24 = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }

/** Egyptian mobile → E.164 (+201XXXXXXXXX), like MazMed's EgyptianPhone::toE164. Arabic-Indic digits allowed. */
export function egyptE164(input: string): string | null {
  const latin = input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[^\d+]/g, '')
  const m = latin.match(/^(?:\+?20|0020)?0?(1[0125]\d{8})$/)
  return m ? '+20' + m[1] : null
}
