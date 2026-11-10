import type { TreatmentPlan, TreatmentPlanItem } from '@/lib/store'

/** The option a plan is priced on: the accepted one, else the recommended one, else the first. */
export const activeOption = (p: TreatmentPlan) =>
  p.options.find((o) => o.id === p.accepted_option_id) ?? p.options.find((o) => o.is_recommended) ?? p.options[0]

export const itemTotal = (i: TreatmentPlanItem) => Math.max(0, i.unit_price * i.qty - i.discount)

/** MazMed: option total = items (not cancelled) − option discount */
export function optionTotal(p: TreatmentPlan, onlyOpen = false) {
  const o = activeOption(p)
  if (!o) return 0
  const items = o.items.filter((i) => i.status !== 'cancelled' && (!onlyOpen || i.status !== 'done'))
  return Math.max(0, items.reduce((t, i) => t + itemTotal(i), 0) - (onlyOpen ? 0 : o.discount))
}

export const OPEN_PLAN = ['draft', 'quoted', 'accepted', 'in_progress'] as const
export const isOpen = (p: TreatmentPlan) => (OPEN_PLAN as readonly string[]).includes(p.status)
