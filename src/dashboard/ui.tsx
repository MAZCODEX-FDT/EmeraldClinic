import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { gsap } from '@/lib/gsap'
import type { AppointmentStatus, EnquiryStatus, PlanItemStatus, PlanStatus } from '@/lib/store'

export const useTr = () => {
  const { lang } = useLang()
  return (en: string, ar: string) => (lang === 'ar' ? ar : en)
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-deep md:text-4xl">{title}</h1>
        {sub && <p className="mt-1.5 text-sm text-stone">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Btn({ children, variant = 'primary', className = '', ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'soft' }) {
  const v = { primary: 'bg-deep text-ivory hover:bg-emerald', ghost: 'border border-deep/15 text-deep hover:bg-deep/5', soft: 'bg-jade/50 text-deep hover:bg-jade' }[variant]
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${v} ${className}`}>{children}</button>
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-dash p-5 md:p-6 ${className}`}>{children}</div>
}

const apptColors: Record<AppointmentStatus, string> = {
  booked: 'bg-jade/60 text-deep', checked_in: 'bg-emerald text-ivory', completed: 'bg-deep text-ivory',
  cancelled: 'bg-stone/10 text-stone line-through', cancelled_by_doctor: 'bg-stone/10 text-stone line-through',
  no_show: 'bg-beige text-charcoal', rescheduled: 'bg-stone/15 text-charcoal',
}
/** MazMed Appointment statuses */
export const apptLabel = (s: AppointmentStatus, ar: boolean) =>
  (ar ? { booked: 'محجوز', checked_in: 'وصل', completed: 'تم', cancelled: 'ملغي', cancelled_by_doctor: 'ألغاه الطبيب', no_show: 'لم يحضر', rescheduled: 'تم تأجيله' }
    : { booked: 'Booked', checked_in: 'Checked in', completed: 'Completed', cancelled: 'Cancelled', cancelled_by_doctor: 'Cancelled by doctor', no_show: 'No-show', rescheduled: 'Rescheduled' })[s]
export function ApptBadge({ s }: { s: AppointmentStatus }) {
  const { lang } = useLang()
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium whitespace-nowrap ${apptColors[s]}`}>{apptLabel(s, lang === 'ar')}</span>
}
/** MazMed Enquiry (lead) statuses */
const leadColors: Record<EnquiryStatus, string> = { new: 'bg-emerald text-ivory', contacted: 'bg-jade/60 text-deep', qualified: 'bg-beige text-charcoal', booked: 'bg-deep text-ivory', lost: 'bg-stone/15 text-stone', spam: 'bg-stone/10 text-stone line-through' }
export const leadLabel = (s: EnquiryStatus, ar: boolean) =>
  (ar ? { new: 'جديد', contacted: 'تم التواصل', qualified: 'مؤهل', booked: 'اتحجز', lost: 'خسرناه', spam: 'سبام' }
    : { new: 'New', contacted: 'Contacted', qualified: 'Qualified', booked: 'Booked', lost: 'Lost', spam: 'Spam' })[s]
export function ReqBadge({ s }: { s: EnquiryStatus }) {
  const { lang } = useLang()
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${leadColors[s]}`}>{leadLabel(s, lang === 'ar')}</span>
}
/** MazMed TreatmentPlanItem statuses */
export function PlanBadge({ s }: { s: PlanItemStatus }) {
  const tr = useTr()
  const m = { planned: ['bg-beige text-charcoal', tr('Planned', 'مخطط')], in_progress: ['bg-jade/60 text-deep', tr('In progress', 'جاري')], done: ['bg-deep text-ivory', tr('Done', 'تم')], cancelled: ['bg-stone/10 text-stone', tr('Cancelled', 'ملغي')] }[s]
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${m[0]}`}>{m[1]}</span>
}
/** MazMed TreatmentPlan statuses */
export const planLabel = (s: PlanStatus, ar: boolean) =>
  (ar ? { draft: 'مسودة', quoted: 'متسعّرة', accepted: 'موافق عليها', in_progress: 'جارية', completed: 'خلصت', declined: 'مرفوضة', cancelled: 'ملغية' }
    : { draft: 'Draft', quoted: 'Quoted', accepted: 'Accepted', in_progress: 'In progress', completed: 'Completed', declined: 'Declined', cancelled: 'Cancelled' })[s]
/** MazMed PaymentMethod keys */
export const methodLabel = (m: string, ar: boolean) =>
  (ar ? { cash: 'كاش', card_pos: 'فيزا', wallet: 'محفظة', instapay: 'إنستاباي', bank_transfer: 'تحويل بنكي' } : { cash: 'Cash', card_pos: 'Card', wallet: 'Wallet', instapay: 'InstaPay', bank_transfer: 'Bank transfer' } as Record<string, string>)[m] ?? m

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    gsap.fromTo(ref.current, { y: 30, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 })
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-deeper/40 p-0 backdrop-blur-sm md:items-center md:p-6" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal aria-label={title} onClick={(e) => e.stopPropagation()} data-lenis-prevent
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-ivory p-6 shadow-2xl md:rounded-3xl ${wide ? 'md:max-w-3xl' : 'md:max-w-lg'}`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-deep">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-deep/5"><X className="size-4" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-charcoal/70">{label}</span>{children}</label>
}
export const inputCls = 'w-full rounded-xl border border-deep/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-emerald'

export function Empty({ children }: { children: ReactNode }) {
  return <div className="grid place-items-center rounded-2xl border border-dashed border-deep/15 py-14 text-sm text-stone">{children}</div>
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald' : 'bg-stone/30'}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${on ? 'start-[1.375rem]' : 'start-0.5'}`} />
    </button>
  )
}

export function fmtDate(iso: string, lang: 'en' | 'ar', opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', opts)
}
