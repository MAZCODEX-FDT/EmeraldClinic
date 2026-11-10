import type { DentalChartEntry, ToothCondition } from '@/lib/store'

/** MazMed ToothConditions::CONDITIONS, with chart colours in the Emerald palette. */
export const CONDITIONS: Record<ToothCondition, { en: string; ar: string; fill: string; stroke: string }> = {
  caries: { en: 'Caries', ar: 'تسوس', fill: '#2B2F2E', stroke: '#2B2F2E' },
  fracture: { en: 'Fracture', ar: 'كسر', fill: '#E9DFCF', stroke: '#2B2F2E' },
  periapical: { en: 'Periapical lesion', ar: 'التهاب حول الجذر', fill: '#E9DFCF', stroke: '#8C8F8D' },
  impacted: { en: 'Impacted', ar: 'مدفونة', fill: '#F4F6F4', stroke: '#8C8F8D' },
  missing: { en: 'Missing', ar: 'مفقودة', fill: 'transparent', stroke: '#8C8F8D' },
  filling: { en: 'Filling', ar: 'حشو', fill: '#BFE3D3', stroke: '#1F7A5C' },
  sealant: { en: 'Sealant', ar: 'سيلانت', fill: '#EAF1ED', stroke: '#1F7A5C' },
  inlay_onlay: { en: 'Inlay / onlay', ar: 'إنلاي / أونلاي', fill: '#BFE3D3', stroke: '#0E4D3C' },
  rct: { en: 'Root canal', ar: 'علاج عصب', fill: '#1F7A5C', stroke: '#0E4D3C' },
  post_core: { en: 'Post & core', ar: 'وتد', fill: '#1F7A5C', stroke: '#093629' },
  crown: { en: 'Crown', ar: 'تاج', fill: '#0E4D3C', stroke: '#093629' },
  veneer: { en: 'Veneer', ar: 'فينير', fill: '#FFFFFF', stroke: '#0E4D3C' },
  bridge_abutment: { en: 'Bridge abutment', ar: 'دعامة كوبري', fill: '#0E4D3C', stroke: '#BFE3D3' },
  bridge_pontic: { en: 'Bridge pontic', ar: 'جسم كوبري', fill: '#125A47', stroke: '#BFE3D3' },
  implant: { en: 'Implant', ar: 'زراعة', fill: '#125A47', stroke: '#BFE3D3' },
  extraction: { en: 'Extraction', ar: 'خلع', fill: '#F4F6F4', stroke: '#2B2F2E' },
}

export const ENTRY_STATUS = { existing: ['Existing', 'موجود'], planned: ['Planned', 'مخطط'], completed: ['Completed', 'تم'] } as const

const HEALTHY = { fill: '#FFFFFF', stroke: '#BFE3D3' }

/** What a tooth shows on the chart: the latest existing/completed entry. Planned entries appear as a marker. */
export function toothLook(entries: DentalChartEntry[], fdi: number) {
  const done = entries.filter((e) => e.tooth === fdi && e.status !== 'planned')
  const top = done[done.length - 1]
  return {
    condition: top?.condition,
    ...(top ? CONDITIONS[top.condition] : HEALTHY),
    planned: entries.some((e) => e.tooth === fdi && e.status === 'planned'),
    missing: done.some((e) => e.condition === 'missing' || e.condition === 'extraction'),
  }
}
