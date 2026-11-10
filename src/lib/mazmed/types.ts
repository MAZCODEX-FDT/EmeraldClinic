/**
 * Data shapes that mirror MazMed's models (MAZCODEX-FDT/MazMed, app/Models).
 * Field names match MazMed so the site can switch from local demo data to the
 * clinic's MazMed instance without remapping. Fields marked "site:" exist only
 * on the website (images, icons) and have no MazMed column.
 */

/** MazMed ServiceCategory */
export type ServiceCategory = {
  id: number; name: string; name_ar: string; slug: string
  sort_order: number; is_active: boolean; show_on_website: boolean
}

export type ServiceFaq = { question: string; question_ar: string; answer: string; answer_ar: string }

/** MazMed Service */
export type Service = {
  id: number; category_id: number | null
  name: string; name_ar: string; slug: string
  charges: number; service_time: number; status: boolean
  short_description: string; short_description_ar: string
  description: string; description_ar: string
  preparation: string; preparation_ar: string
  aftercare: string; aftercare_ar: string
  online_booking: boolean; show_on_website: boolean; is_featured: boolean; sort_order: number
  faqs: ServiceFaq[]; related_service_ids: number[]
  /** site: */ icon: string
  /** site: */ image?: string
}

/** MazMed Specialization */
export type Specialization = { id: number; name: string; name_ar: string }

/** MazMed WeekDay (a doctor's working hours on one day of the week). day_of_week: 0 = Sunday … 6 = Saturday */
export type WeekDay = {
  day_of_week: number; start_time: string; start_time_type: 'AM' | 'PM'; end_time: string; end_time_type: 'AM' | 'PM'; branch_id: number | null
}

/** MazMed Doctor (+ its user, specialisations, service_doctor links and session) */
export type Doctor = {
  id: number
  user: { full_name: string; profile_image: string | null; status: 1 | 0 }
  /** site: Arabic display name (MazMed stores one full_name) */ full_name_ar: string
  title: string; slug: string
  bio: string; bio_ar: string; experience: string
  specialization_ids: number[]; service_ids: number[]
  languages: string[]
  show_on_website: boolean; accepts_new_patients: boolean; online_booking: boolean
  sort_order: number; color: string
  /** MazMed DoctorSession.session_gap (minutes) */ session_gap: number
  week_days: WeekDay[]
}

/** MazMed Branch */
export type Branch = {
  id: number; name: string; name_ar: string; address: string; address_ar: string
  phone: string; whatsapp: string; email: string; map_url: string
  hours: string; hours_ar: string; is_main: boolean; is_active: boolean
}

/** MazMed Patient (flattened from patient + user) */
export type Patient = {
  id: number; patient_unique_id: string
  name: string; phone: string; phone_e164: string; email: string | null
  /** 1 = male, 2 = female (MazMed) */ gender: 1 | 2; dob: string | null
  source: 'website' | 'desk' | 'phone' | 'whatsapp'
  notes: string; tags: string[]; created_at: string
}

export const APPOINTMENT_STATUSES = ['booked', 'checked_in', 'completed', 'cancelled', 'cancelled_by_doctor', 'no_show', 'rescheduled'] as const
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number]

/** MazMed Appointment */
export type Appointment = {
  id: number; appointment_unique_id: string
  patient_id: number; doctor_id: number; branch_id: number | null
  date: string; from_time: string; from_time_type: 'AM' | 'PM'; to_time: string; to_time_type: 'AM' | 'PM'
  status: AppointmentStatus; service_ids: number[]; description: string | null
  total_charge: number; source: 'website' | 'desk' | 'phone' | 'whatsapp'
  /** MazMed ClinicResource (chair) */ resource_id: number | null
}

export const ENQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'booked', 'lost', 'spam'] as const
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

/** MazMed Enquiry (leads pipeline: contact forms, appointment requests, online bookings) */
export type Enquiry = {
  id: number; name: string; phone: string; email: string | null
  subject: string; message: string; status: EnquiryStatus
  source: 'website' | 'whatsapp' | 'phone' | 'facebook' | 'instagram'
  priority: 'normal' | 'high'; form_name: string
  service_id: number | null; doctor_id: number | null; branch_id: number | null
  preferred_date: string | null; preferred_time: 'morning' | 'afternoon' | 'evening' | null
  patient_id: number | null; appointment_id: number | null; created_at: string
}

/** MazMed Review */
export type Review = {
  id: number; patient_id: number | null; /** site: display name the patient agreed to */ name: string
  doctor_id: number | null; service_id: number | null
  rating: number; review: string; is_published: boolean; reply: string | null; created_at: string
}

/** MazMed Faq */
export type Faq = { id: number; question: string; question_ar: string; answer: string; answer_ar: string }

/** MazMed ToothConditions::CONDITIONS keys */
export const TOOTH_CONDITIONS = ['caries', 'fracture', 'periapical', 'impacted', 'missing', 'filling', 'sealant', 'inlay_onlay', 'rct', 'post_core', 'crown', 'veneer', 'bridge_abutment', 'bridge_pontic', 'implant', 'extraction'] as const
export type ToothCondition = (typeof TOOTH_CONDITIONS)[number]

/** MazMed DentalChartEntry */
export type DentalChartEntry = {
  id: number; patient_id: number; tooth: number; surfaces: string[]
  condition: ToothCondition; status: 'existing' | 'planned' | 'completed'
  material: string | null; notes: string | null
}

export const PLAN_STATUSES = ['draft', 'quoted', 'accepted', 'in_progress', 'completed', 'declined', 'cancelled'] as const
export type PlanStatus = (typeof PLAN_STATUSES)[number]
export type PlanItemStatus = 'planned' | 'in_progress' | 'done' | 'cancelled'

/** MazMed TreatmentPlan → TreatmentPlanOption → TreatmentPlanItem */
export type TreatmentPlanItem = {
  id: number; phase: 1 | 2 | 3; service_id: number; site: string | null
  qty: number; unit_price: number; discount: number; status: PlanItemStatus
}
export type TreatmentPlanOption = { id: number; name: string; is_recommended: boolean; discount: number; items: TreatmentPlanItem[] }
export type TreatmentPlan = {
  id: number; reference: string; patient_id: number; doctor_id: number
  title: string; status: PlanStatus; valid_until: string | null
  accepted_option_id: number | null; notes: string; options: TreatmentPlanOption[]; created_at: string
}

/** MazMed PaymentMethod keys (DESK_KINDS) */
export const PAYMENT_METHODS = ['cash', 'card_pos', 'wallet', 'instapay', 'bank_transfer'] as const
export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]

/** MazMed Invoice + InvoicePayment */
export type InvoiceLine = { description: string; unit_price: number; quantity: number }
export type Invoice = {
  id: number; number: string; patient_id: number; appointment_id: number | null
  lines: InvoiceLine[]; discount: number; status: 'unpaid' | 'partial' | 'paid'; created_at: string
  payments: { id: number; method: PaymentMethodKey; amount: number; reference: string | null; paid_at: string }[]
}

/** MazMed ClinicResource (treatment chairs) */
export type Resource = { id: number; name: string; name_ar: string }

/** Website integration settings (no MazMed column) */
export type SiteSettings = {
  instagram: string; facebook: string
  /** MazMed instance URL, e.g. https://emerald.mazmed.net — empty = local demo data */
  mazmed_url: string
}

/* ---- Website ↔ MazMed request payloads (exact field names of MazMed's public endpoints) ---- */

/** POST /site/booking (SiteBookingController::book) */
export type BookingPayload = {
  name: string; phone: string; email?: string; gender?: '1' | '2'; dob?: string
  doctor_id: number; date: string; slot: string; services: number[]; branch_id?: number | null
  create_account?: boolean; password?: string; notes?: string; coupon?: string; consent: boolean
  /** honeypot */ website?: string; form_started_at?: number
}
export type BookingResult = { ok: boolean; message: string; reference?: string; pay_url?: string | null }

/** POST /site/appointment (SiteController::requestAppointment) — used by the contact page */
export type RequestPayload = {
  name: string; phone: string; service_id?: number | null; doctor_id?: number | null; branch_id?: number | null
  preferred_date?: string | null; preferred_time?: 'morning' | 'afternoon' | 'evening' | null; message?: string; consent: boolean
}
