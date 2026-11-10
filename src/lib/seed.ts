import type {
  ServiceCategory, Service, Specialization, Doctor, Branch, Patient, Appointment, AppointmentStatus, Enquiry,
  Review, Faq, DentalChartEntry, ToothCondition, TreatmentPlan, Invoice, Resource, PaymentMethodKey,
} from './mazmed/types'
import type { DB } from './store'
import { fromMinutes } from './mazmed/time'

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dayOffset = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }

export const categories: ServiceCategory[] = [
  { id: 1, name: 'Preventive', name_ar: 'وقائي', slug: 'preventive', sort_order: 1, is_active: true, show_on_website: true },
  { id: 2, name: 'Restorative', name_ar: 'ترميمي', slug: 'restorative', sort_order: 2, is_active: true, show_on_website: true },
  { id: 3, name: 'Cosmetic', name_ar: 'تجميلي', slug: 'cosmetic', sort_order: 3, is_active: true, show_on_website: true },
  { id: 4, name: 'Surgical', name_ar: 'جراحي', slug: 'surgical', sort_order: 4, is_active: true, show_on_website: true },
  { id: 5, name: 'Orthodontics', name_ar: 'تقويم', slug: 'orthodontics', sort_order: 5, is_active: true, show_on_website: true },
  { id: 6, name: 'Children', name_ar: 'أطفال', slug: 'children', sort_order: 6, is_active: true, show_on_website: true },
]

const svc = (s: Partial<Service> & Pick<Service, 'id' | 'name' | 'name_ar' | 'slug' | 'category_id' | 'charges' | 'service_time' | 'icon'>): Service => ({
  status: true, online_booking: true, show_on_website: true, is_featured: false, sort_order: s.id, faqs: [], related_service_ids: [],
  short_description: '', short_description_ar: '', description: '', description_ar: '', preparation: '', preparation_ar: '', aftercare: '', aftercare_ar: '',
  ...s,
})

export const services: Service[] = [
  svc({
    id: 1, category_id: 1, slug: 'checkup-cleaning', icon: 'checkup', image: '/img/scan.webp', charges: 900, service_time: 45, is_featured: true,
    name: 'Check-up & Cleaning', name_ar: 'كشف وتنظيف جير',
    short_description: 'A full digital exam, scaling and polishing — the calm start of every plan.', short_description_ar: 'كشف كامل بالأشعة الرقمية، تنظيف جير وتلميع — البداية الهادية لأي خطة.',
    description: 'We look at every tooth, the gums and the bite, take low-dose digital X-rays when needed, then clean and polish. You leave with a clear picture of your mouth and a written list of what needs attention — and what does not.',
    description_ar: 'بنبص على كل سنة واللثة والـbite، وناخد أشعة رقمية بجرعة قليلة لو محتاجين، وبعدها تنظيف وتلميع. هتمشي وانت فاهم بقك كويس، ومعاك ورقة مكتوب فيها اللي محتاج متابعة — واللي مش محتاج.',
    preparation: 'Bring any old X-rays and a list of medicines you take. Eat normally before your visit.', preparation_ar: 'هات أي أشعة قديمة وقائمة بالأدوية اللي بتاخدها. كُل عادي قبل الزيارة.',
    aftercare: 'Your gums may feel slightly sensitive for a day. Brush gently and avoid very cold drinks.', aftercare_ar: 'ممكن اللثة تكون حساسة شوية يوم واحد. افرش بهدوء وابعد عن المشروبات الساقعة جدًا.',
    faqs: [{ question: 'How often should I have a check-up?', question_ar: 'المفروض أكشف كل قد إيه؟', answer: 'Every six months for most people; we will tell you if you need it sooner.', answer_ar: 'كل ٦ شهور لأغلب الناس، وهنقولك لو محتاج أقرب من كده.' }],
    related_service_ids: [2, 6],
  }),
  svc({
    id: 2, category_id: 2, slug: 'tooth-coloured-fillings', icon: 'filling', charges: 1200, service_time: 45,
    name: 'Tooth-coloured Fillings', name_ar: 'حشو تجميلي',
    short_description: 'Composite fillings matched to your shade, placed with minimal drilling.', short_description_ar: 'حشو كومبوزيت بلون سنتك، بأقل حفر ممكن.',
    description: 'We remove only the decayed part, keep as much natural tooth as possible and rebuild it in layers of composite matched to your exact shade.',
    description_ar: 'بنشيل التسوس بس، ونحافظ على أكبر جزء من السنة الطبيعية، ونبني الحشو طبقات بلون مطابق لسنتك.',
    preparation: 'No special preparation. Tell us if local anaesthesia has ever bothered you.', preparation_ar: 'مفيش تحضير خاص. قولنا لو البنج قبل كده ضايقك.',
    aftercare: 'Wait until the numbness wears off before eating. Mild sensitivity for a few days is normal.', aftercare_ar: 'استنى لحد ما البنج يروح قبل الأكل. حساسية بسيطة كام يوم طبيعية.',
    related_service_ids: [3, 1],
  }),
  svc({
    id: 3, category_id: 2, slug: 'root-canal', icon: 'rootcanal', image: '/img/tooth-cut.webp', charges: 3500, service_time: 75, is_featured: true,
    name: 'Root Canal Treatment', name_ar: 'علاج العصب',
    short_description: 'Microscope-guided endodontics so we can save the tooth, not pull it.', short_description_ar: 'علاج عصب بالميكروسكوب علشان نحافظ على السنة بدل ما نخلعها.',
    description: 'Saving your natural tooth is always our first option. With rotary files, apex locators and magnification, most root canals are done in one or two comfortable visits.',
    description_ar: 'الحفاظ على سنتك الطبيعية دايمًا أول اختيار عندنا. بالأدوات الدوارة وجهاز تحديد طول القناة والتكبير، أغلب حالات العصب بتخلص في زيارة أو اتنين مريحين.',
    preparation: 'Take your usual medicines. If the tooth is swollen, call us — you may need antibiotics first.', preparation_ar: 'خد أدويتك العادية. لو السنة وارمة كلمنا — ممكن تحتاج مضاد حيوي الأول.',
    aftercare: 'Chew on the other side until the final filling or crown is placed. Some tenderness for 2–3 days is normal.', aftercare_ar: 'امضغ على الناحية التانية لحد الحشو النهائي أو الكراون. ألم بسيط ٢–٣ أيام طبيعي.',
    faqs: [{ question: 'Is a root canal painful?', question_ar: 'علاج العصب بيوجع؟', answer: 'With modern anaesthesia it usually feels like a long filling.', answer_ar: 'مع البنج الحديث غالبًا بيكون زي حشو طويل.' }, { question: 'Will I need a crown afterwards?', question_ar: 'هحتاج كراون بعدها؟', answer: 'Back teeth usually do; we will show you why on the X-ray.', answer_ar: 'الضروس الخلفية غالبًا أيوه، وهنوريك السبب على الأشعة.' }],
    related_service_ids: [4, 2],
  }),
  svc({
    id: 4, category_id: 2, slug: 'crowns-bridges', icon: 'crown', image: '/img/crown.webp', charges: 4500, service_time: 60,
    name: 'Crowns & Bridges', name_ar: 'تركيبات وكراون',
    short_description: 'Zirconia and E-max restorations, designed digitally for a natural fit.', short_description_ar: 'تركيبات زيركون وإي ماكس متصممة ديجيتال علشان تركب طبيعي.',
    description: 'When a tooth is too weak for a filling, a crown protects it for years. We scan, design and try in before cementing — nothing is final until you are happy.',
    description_ar: 'لما السنة تكون ضعيفة على الحشو، الكراون بيحميها لسنين. بنعمل مسح ديجيتال وتصميم وتجربة قبل التثبيت — مفيش حاجة بتتثبت غير لما تكون مرتاح.',
    preparation: 'Two visits: preparation and scan, then try-in and cementation.', preparation_ar: 'زيارتين: تجهيز ومسح، وبعدين تجربة وتثبيت.',
    aftercare: 'Avoid sticky food on the temporary crown. Floss by sliding the thread out sideways.', aftercare_ar: 'ابعد عن الأكل اللازق على الكراون المؤقت. استخدم الخيط واسحبه من الجنب.',
    related_service_ids: [3, 5],
  }),
  svc({
    id: 5, category_id: 4, slug: 'dental-implants', icon: 'implant', image: '/img/implant-cut.webp', charges: 18000, service_time: 90, is_featured: true,
    name: 'Dental Implants', name_ar: 'زراعة الأسنان',
    short_description: 'Guided implant placement when a tooth truly cannot be saved.', short_description_ar: 'زراعة بدليل جراحي لما السنة فعلًا مينفعش تتنقذ.',
    description: 'Only when saving the tooth is not possible do we plan an implant — with a 3D scan, a guided surgery and a clear timeline written in your plan from day one.',
    description_ar: 'بنلجأ للزراعة بس لما الحفاظ على السنة يبقى مش ممكن — بأشعة ثلاثية الأبعاد وجراحة بدليل، والمدة كلها مكتوبة في خطتك من أول يوم.',
    preparation: 'A 3D CBCT scan and a planning visit come first. Tell us about blood thinners or diabetes.', preparation_ar: 'أول حاجة أشعة ثلاثية الأبعاد وزيارة تخطيط. قولنا لو بتاخد مسيلات أو عندك سكر.',
    aftercare: 'Cold compresses for the first day, soft food for a week, and no smoking while it heals.', aftercare_ar: 'كمادات ساقعة أول يوم، أكل طري لمدة أسبوع، وممنوع التدخين لحد ما يلتئم.',
    faqs: [{ question: 'How long does an implant take?', question_ar: 'الزراعة بتاخد وقت قد إيه؟', answer: 'Usually about three months from placement to the final crown.', answer_ar: 'غالبًا حوالي ٣ شهور من الزراعة للكراون النهائي.' }],
    related_service_ids: [4, 10],
  }),
  svc({
    id: 6, category_id: 3, slug: 'teeth-whitening', icon: 'whitening', image: '/img/smile.webp', charges: 3000, service_time: 60,
    name: 'Teeth Whitening', name_ar: 'تبييض الأسنان',
    short_description: 'In-clinic whitening with sensitivity care — natural shades, not chalk white.', short_description_ar: 'تبييض في العيادة مع حماية من الحساسية — درجات طبيعية مش أبيض مبالغ فيه.',
    description: 'We check that your teeth and gums are healthy first, agree on a realistic target shade together, then whiten in a single comfortable session.',
    description_ar: 'بنتأكد الأول إن سنانك ولثتك سليمين، ونتفق سوا على درجة واقعية، وبعدها التبييض في جلسة واحدة مريحة.',
    preparation: 'A cleaning before whitening gives the best result.', preparation_ar: 'تنظيف الجير قبل التبييض بيدي أحسن نتيجة.',
    aftercare: 'Avoid coffee, tea and coloured food for 48 hours.', aftercare_ar: 'ابعد عن القهوة والشاي والأكل الملوّن ٤٨ ساعة.',
    related_service_ids: [1, 7],
  }),
  svc({
    id: 7, category_id: 3, slug: 'smile-design-veneers', icon: 'veneer', image: '/img/smile.webp', charges: 6000, service_time: 90, is_featured: true,
    name: 'Smile Design & Veneers', name_ar: 'تصميم الابتسامة والفينير',
    short_description: 'Digital smile design with a mock-up you can see before anything is touched.', short_description_ar: 'تصميم ابتسامة ديجيتال وتجربة مؤقتة تشوفها قبل ما نلمس أي سنة.',
    description: 'We design your smile on screen, try it in your mouth as a temporary mock-up, and only then prepare minimal-thickness veneers.',
    description_ar: 'بنصمم ابتسامتك على الشاشة، وتجربها في بقك كتجربة مؤقتة، وبعدها بس نجهز فينير بأقل سُمك.',
    preparation: 'Bring photos of smiles you like. The first visit is photos and a digital design.', preparation_ar: 'هات صور ابتسامات عاجباك. أول زيارة صور وتصميم ديجيتال.',
    aftercare: 'Avoid biting hard objects with your front teeth. A night guard is recommended if you grind.', aftercare_ar: 'ابعد عن العض على حاجات صلبة بالسنان الأمامية. واقي ليلي لو بتجز على سنانك.',
    related_service_ids: [6, 8],
  }),
  svc({
    id: 8, category_id: 5, slug: 'clear-aligners', icon: 'aligner', image: '/img/aligner-life.webp', charges: 45000, service_time: 45, is_featured: true,
    name: 'Clear Aligners', name_ar: 'التقويم الشفاف',
    short_description: 'Invisible orthodontics planned in 3D, with check-ins every 6–8 weeks.', short_description_ar: 'تقويم شفاف متخطط ثلاثي الأبعاد، ومتابعة كل ٦–٨ أسابيع.',
    description: 'You see the full movement of your teeth before you start. Aligners are removable, discreet and reviewed regularly so the plan stays on track.',
    description_ar: 'بتشوف حركة سنانك كلها قبل ما تبدأ. التقويم الشفاف بيتشال ويتركب، مش باين، وبنتابعه بانتظام علشان الخطة تمشي صح.',
    preparation: 'A scan, photos and X-rays at the first visit — no impressions.', preparation_ar: 'مسح وصور وأشعة في أول زيارة — من غير طبعات.',
    aftercare: 'Wear aligners 20–22 hours a day and clean them every morning and night.', aftercare_ar: 'البس التقويم ٢٠–٢٢ ساعة في اليوم ونضفه الصبح وبالليل.',
    related_service_ids: [7, 1],
  }),
  svc({
    id: 9, category_id: 6, slug: 'kids-dentistry', icon: 'kids', image: '/img/kids.webp', charges: 700, service_time: 30, is_featured: true,
    name: "Children's Dentistry", name_ar: 'أسنان الأطفال',
    short_description: 'Gentle first visits, fissure sealants and fluoride — no fear, no rush.', short_description_ar: 'أول زيارات هادية، سد شقوق وفلورايد — من غير خوف ولا استعجال.',
    description: 'The first visits are about trust. We explain everything to your child in their language, and keep treatment short and calm.',
    description_ar: 'أول الزيارات هدفها الثقة. بنشرح لطفلك كل حاجة بلغته، والعلاج بيكون قصير وهادي.',
    preparation: 'Talk about the visit positively at home. Morning or after-school slots work best.', preparation_ar: 'اتكلم عن الزيارة بشكل إيجابي في البيت. مواعيد بعد المدرسة بتبقى أحسن.',
    aftercare: 'After fluoride, no eating or drinking for 30 minutes.', aftercare_ar: 'بعد الفلورايد، ممنوع الأكل والشرب ٣٠ دقيقة.',
    related_service_ids: [1],
  }),
  svc({
    id: 10, category_id: 4, slug: 'wisdom-tooth', icon: 'extraction', charges: 2500, service_time: 60,
    name: 'Wisdom Tooth Surgery', name_ar: 'خلع ضرس العقل',
    short_description: 'Careful surgical removal when a wisdom tooth is causing real problems.', short_description_ar: 'خلع جراحي بعناية لما ضرس العقل يكون عامل مشكلة حقيقية.',
    description: 'Not every wisdom tooth needs to go. When it does, we plan with X-rays, keep the procedure gentle and give you clear written aftercare.',
    description_ar: 'مش كل ضرس عقل لازم يتخلع. ولو لازم، بنخطط بالأشعة، والعملية بتكون هادية، ومعاك تعليمات مكتوبة بعدها.',
    preparation: 'Eat a light meal before. Arrange for someone to take you home if you are anxious.', preparation_ar: 'كُل وجبة خفيفة قبلها. خلي حد يروحك لو قلقان.',
    aftercare: 'Bite on gauze for 30 minutes, cold compresses, soft food, and no rinsing for 24 hours.', aftercare_ar: 'اعض على الشاش ٣٠ دقيقة، كمادات ساقعة، أكل طري، ومن غير مضمضة ٢٤ ساعة.',
    related_service_ids: [5],
  }),
]

export const specializations: Specialization[] = [
  { id: 1, name: 'Endodontics', name_ar: 'علاج الجذور' },
  { id: 2, name: 'Restorative Dentistry', name_ar: 'طب الأسنان الترميمي' },
  { id: 3, name: 'Implantology', name_ar: 'زراعة الأسنان' },
  { id: 4, name: 'Cosmetic Dentistry', name_ar: 'تجميل الأسنان' },
  { id: 5, name: 'Orthodontics', name_ar: 'تقويم الأسنان' },
  { id: 6, name: 'Pediatric Dentistry', name_ar: 'أسنان الأطفال' },
]

const hours = (days: number[]): Doctor['week_days'] =>
  days.map((d) => ({ day_of_week: d, start_time: '12:00', start_time_type: 'PM', end_time: '10:00', end_time_type: 'PM', branch_id: 1 }))

// Two doctors to start with — names, bios and photos are placeholders until the clinic sends its own.
export const doctors: Doctor[] = [
  {
    id: 1, user: { full_name: 'Dr. Youssef Mansour', profile_image: '/img/dr-youssef-cut.webp', status: 1 }, full_name_ar: 'د. يوسف منصور',
    title: 'Founder · Endodontics, Restorative & Implants', slug: 'youssef-mansour',
    bio: 'Believes the best tooth is the one you were born with. Leads every treatment-planning meeting and places implants only when saving the tooth is no longer possible.',
    bio_ar: 'مؤمن إن أحسن سنة هي اللي اتولدت بيها. بيقود كل اجتماعات تخطيط العلاج، وبيزرع بس لما الحفاظ على السنة يبقى مش ممكن.',
    experience: '14', specialization_ids: [1, 2, 3], service_ids: [1, 2, 3, 4, 5, 10], languages: ['ar', 'en'],
    show_on_website: true, accepts_new_patients: true, online_booking: true, sort_order: 1, color: '#0E4D3C', session_gap: 30,
    week_days: hours([6, 0, 1, 2, 3]),
  },
  {
    id: 2, user: { full_name: 'Dr. Nour El-Hady', profile_image: '/img/dr-nour-cut.webp', status: 1 }, full_name_ar: 'د. نور الهادي',
    title: 'Cosmetic Dentistry, Orthodontics & Children', slug: 'nour-el-hady',
    bio: 'Designs smiles that look like you on a good day — never like a filter — and turns first visits for children into good memories.',
    bio_ar: 'بتصمم ابتسامات شبهك في أحلى يوم — مش شبه فلتر — وبتخلي أول زيارة للأطفال ذكرى حلوة.',
    experience: '9', specialization_ids: [4, 5, 6], service_ids: [1, 2, 6, 7, 8, 9], languages: ['ar', 'en'],
    show_on_website: true, accepts_new_patients: true, online_booking: true, sort_order: 2, color: '#1F7A5C', session_gap: 30,
    week_days: hours([0, 1, 2, 3, 4]),
  },
]

export const branches: Branch[] = [{
  id: 1, name: 'Emerald Dental Clinic — Nasr City', name_ar: 'إميرالد لطب الأسنان — مدينة نصر',
  address: 'Nasr City, Cairo', address_ar: 'مدينة نصر، القاهرة',
  phone: '+20 10 0000 0000', whatsapp: '+201000000000', email: 'hello@emeralddental.eg',
  map_url: 'https://maps.google.com/?q=Nasr+City+Cairo',
  hours: 'Sat – Thu · 12 PM – 10 PM', hours_ar: 'السبت – الخميس · ١٢ ظهرًا – ١٠ مساءً', is_main: true, is_active: true,
}]

export const resources: Resource[] = [
  { id: 1, name: 'Chair 1', name_ar: 'كرسي ١' }, { id: 2, name: 'Chair 2', name_ar: 'كرسي ٢' }, { id: 3, name: 'Chair 3', name_ar: 'كرسي ٣' },
]

export const faqs: Faq[] = [
  { id: 1, question: 'Will you tell me the cost before treatment?', question_ar: 'هتقولولي التكلفة قبل العلاج؟', answer: 'Yes. Every plan is written with its estimated cost before we begin, and it never changes without your agreement.', answer_ar: 'أيوه. كل خطة مكتوب فيها التكلفة التقديرية قبل ما نبدأ، ومبتتغيرش غير بموافقتك.' },
  { id: 2, question: 'Do you always recommend implants?', question_ar: 'هل دايمًا بتنصحوا بالزراعة؟', answer: 'No. We try to save your tooth first. An implant is only planned when keeping the tooth is genuinely not possible.', answer_ar: 'لأ. بنحاول نحافظ على سنتك الأول. الزراعة بنخطط لها بس لما الحفاظ على السنة يبقى مش ممكن فعلًا.' },
  { id: 3, question: 'I am anxious about dentists. Can you help?', question_ar: 'أنا بخاف من دكتور الأسنان. تقدروا تساعدوني؟', answer: 'Tell us when you book. We plan longer appointments, explain each step and stop whenever you raise your hand.', answer_ar: 'قولنا وانت بتحجز. بنخلي الميعاد أطول، ونشرح كل خطوة، ونوقف أول ما ترفع إيدك.' },
  { id: 4, question: 'Do you treat children?', question_ar: 'بتعالجوا أطفال؟', answer: 'Yes — gentle first visits, fissure sealants, fluoride and orthodontic assessment.', answer_ar: 'أيوه — زيارات أولى هادية، سد شقوق، فلورايد، وتقييم تقويم.' },
  { id: 5, question: 'What are your working hours?', question_ar: 'مواعيد العيادة إيه؟', answer: 'Saturday to Thursday, 12 PM to 10 PM. Friday we rest.', answer_ar: 'من السبت للخميس، من ١٢ الظهر لـ ١٠ بالليل. الجمعة إجازة.' },
]

const names: [string, 1 | 2][] = [
  ['Ahmed Samir', 1], ['Mona Fawzy', 2], ['Omar Khaled', 1], ['Salma Hassan', 2], ['Mahmoud Ezzat', 1], ['Heba Mostafa', 2],
  ['Tarek Nabil', 1], ['Yasmine Adly', 2], ['Mostafa Ragab', 1], ['Nada Sherif', 2], ['Hany Gamal', 1], ['Rania Tawfik', 2],
  ['Ziad Ashraf', 1], ['Farida Lotfy', 2], ['Karim Abdelaziz', 1], ['Dina Morsy', 2],
]

export function seed(version: number): DB {
  const r = rng(20261110)
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]
  const now = new Date()
  const teeth = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48]

  const patients: Patient[] = names.map(([name, gender], i) => {
    const local = '01' + pick(['0', '1', '2', '5']) + String(Math.floor(10000000 + r() * 89999999))
    const created = new Date(now); created.setDate(created.getDate() - Math.floor(r() * 200) - 5)
    return {
      id: i + 1, patient_unique_id: 'P' + String(1000 + i), name, phone: local, phone_e164: '+2' + local,
      email: i % 3 === 0 ? name.toLowerCase().replace(' ', '.') + '@mail.com' : null, gender,
      dob: `${1965 + Math.floor(r() * 45)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`,
      source: pick(['website', 'desk', 'phone', 'whatsapp'] as const), created_at: iso(created),
      notes: i === 1 ? 'Anxious patient — explain each step.' : i === 4 ? 'Penicillin allergy.' : '',
      tags: i === 1 ? ['anxious'] : i === 4 ? ['allergy'] : i % 5 === 0 ? ['vip'] : [],
    }
  })

  // Dental chart (MazMed DentalChartEntry) and treatment plans
  const chart: DentalChartEntry[] = []
  const plans: TreatmentPlan[] = []
  let cid = 1, pid = 1, iid = 1
  const existing: ToothCondition[] = ['filling', 'rct', 'crown', 'implant', 'sealant']
  for (const p of patients) {
    const n = 1 + Math.floor(r() * 3)
    for (let k = 0; k < n; k++) chart.push({ id: cid++, patient_id: p.id, tooth: pick(teeth), surfaces: [], condition: pick(existing), status: 'existing', material: null, notes: null })
    const findings: { tooth: number; condition: ToothCondition; service: number }[] = []
    if (r() > 0.4) findings.push({ tooth: pick([16, 26, 36, 46, 17, 47]), condition: 'periapical', service: 3 })
    if (r() > 0.5) findings.push({ tooth: pick([14, 15, 24, 25, 34, 44]), condition: 'caries', service: 2 })
    if (r() > 0.75) findings.push({ tooth: pick([36, 46, 26]), condition: 'missing', service: 5 })
    for (const f of findings) chart.push({ id: cid++, patient_id: p.id, tooth: f.tooth, surfaces: f.condition === 'caries' ? ['O'] : [], condition: f.condition, status: 'existing', material: null, notes: null })
    if (findings.length) {
      const doctor = findings.some((f) => [6, 7, 8, 9].includes(f.service)) ? 2 : 1
      const status = pick(['quoted', 'accepted', 'in_progress', 'quoted'] as const)
      plans.push({
        id: pid, reference: 'TP-' + String(2400 + pid), patient_id: p.id, doctor_id: doctor, title: 'Treatment plan', status,
        valid_until: dayOffset(30), accepted_option_id: status === 'quoted' ? null : pid * 10, notes: '', created_at: dayOffset(-Math.floor(r() * 40)),
        options: [{
          id: pid * 10, name: 'Recommended', is_recommended: true, discount: 0,
          items: findings.flatMap((f, j) => {
            const items = [{ id: iid++, phase: (f.service === 3 ? 1 : f.service === 2 ? 2 : 3) as 1 | 2 | 3, service_id: f.service, site: String(f.tooth), qty: 1, unit_price: services.find((s) => s.id === f.service)!.charges, discount: 0, status: (status === 'in_progress' && j === 0 ? 'in_progress' : 'planned') as 'planned' | 'in_progress' }]
            if (f.service === 3 && [16, 26, 36, 46, 17, 47].includes(f.tooth)) items.push({ id: iid++, phase: 3, service_id: 4, site: String(f.tooth), qty: 1, unit_price: 4500, discount: 0, status: 'planned' })
            return items
          }),
        }],
      })
      pid++
    }
  }

  const appointments: Appointment[] = []
  const invoices: Invoice[] = []
  let aid = 1, inv = 1
  for (let off = -28; off <= 12; off++) {
    const date = dayOffset(off)
    const dow = new Date(date + 'T00:00:00').getDay()
    if (dow === 5) continue
    const busy: { d: number; s: number; e: number; c: number }[] = []
    const count = off === 0 ? 7 : 2 + Math.floor(r() * 5)
    for (let k = 0; k < count; k++) {
      const doc = doctors.filter((d) => d.week_days.some((w) => w.day_of_week === dow))
      if (!doc.length) break
      const d = pick(doc)
      const sid = pick(d.service_ids)
      const s = services.find((x) => x.id === sid)!
      const dur = Math.max(d.session_gap, Math.ceil(s.service_time / d.session_gap) * d.session_gap)
      let start = -1
      for (let tries = 0; tries < 12; tries++) {
        const c = 12 * 60 + Math.floor(r() * 18) * 30
        if (c + dur > 22 * 60) continue
        if (!busy.some((b) => b.d === d.id && c < b.e && c + dur > b.s)) { start = c; break }
      }
      if (start < 0) continue
      const chair = [1, 2, 3].find((ch) => !busy.some((b) => b.c === ch && start < b.e && start + dur > b.s)) ?? 1
      busy.push({ d: d.id, s: start, e: start + dur, c: chair })
      const p = pick(patients)
      let status: AppointmentStatus = 'booked'
      if (off < 0) status = r() > 0.9 ? 'no_show' : r() > 0.94 ? 'cancelled' : 'completed'
      else if (off === 0) status = start < 15 * 60 ? 'completed' : start < 17 * 60 ? 'checked_in' : 'booked'
      const f = fromMinutes(start), t = fromMinutes(start + dur)
      const a: Appointment = {
        id: aid, appointment_unique_id: Math.random().toString(36).slice(2, 10).toUpperCase(), patient_id: p.id, doctor_id: d.id, branch_id: 1,
        date, from_time: f.time, from_time_type: f.type, to_time: t.time, to_time_type: t.type, status, service_ids: [sid], description: null,
        total_charge: s.charges, source: pick(['website', 'desk', 'phone', 'whatsapp'] as const), resource_id: chair,
      }
      appointments.push(a)
      if (status === 'completed') {
        const paid = r() > 0.25 ? s.charges : Math.round(s.charges * 0.5 / 50) * 50
        invoices.push({
          id: inv, number: 'INV-' + String(5000 + inv), patient_id: p.id, appointment_id: aid, lines: [{ description: s.name, unit_price: s.charges, quantity: 1 }],
          discount: 0, status: paid >= s.charges ? 'paid' : 'partial', created_at: date,
          payments: [{ id: inv, method: pick(['cash', 'card_pos', 'instapay', 'wallet'] as PaymentMethodKey[]), amount: paid, reference: null, paid_at: date }],
        })
        inv++
      }
      aid++
    }
  }

  const enquiries: Enquiry[] = [
    { name: 'Mariam Fathy', svc: 7, msg: 'عايزة أعرف لو ينفع أعمل تجربة مؤقتة الأول', src: 'website', st: 'new', form: 'Appointment request', time: 'evening' },
    { name: 'Hossam Adel', svc: 3, msg: 'Pain in lower left molar since 3 days', src: 'whatsapp', st: 'new', form: 'Appointment request', time: 'afternoon' },
    { name: 'Nourhan Said', svc: 9, msg: 'ابني عنده ٦ سنين وأول زيارة', src: 'website', st: 'contacted', form: 'Appointment request', time: 'afternoon' },
    { name: 'Amr Zaki', svc: 5, msg: 'Missing tooth, want a consultation', src: 'phone', st: 'qualified', form: 'Contact', time: null },
    { name: 'Reem Ibrahim', svc: 6, msg: 'هل التبييض بيعمل حساسية؟', src: 'website', st: 'new', form: 'Contact', time: null },
    { name: 'Adham Youssef', svc: 8, msg: 'هل التقويم الشفاف مناسب لحالتي؟', src: 'instagram', st: 'lost', form: 'Contact', time: null },
  ].map((x, i) => ({
    id: i + 1, name: x.name, phone: '010' + String(10000000 + i * 1234567).slice(0, 8), email: null,
    subject: x.form === 'Contact' ? 'Website contact' : 'Appointment request', message: x.msg, status: x.st as Enquiry['status'],
    source: x.src as Enquiry['source'], priority: x.form === 'Contact' ? 'normal' : 'high', form_name: x.form,
    service_id: x.svc, doctor_id: null, branch_id: 1, preferred_date: x.time ? dayOffset(1 + (i % 4)) : null,
    preferred_time: x.time as Enquiry['preferred_time'], patient_id: null, appointment_id: null,
    created_at: new Date(now.getTime() - i * 3.6e6 * 5).toISOString(),
  }))

  const reviews: Review[] = [
    { name: 'Mona F.', review: 'أول مرة دكتور يشرحلي الخطة كلها ويكتبهالي قبل ما يبدأ. حسيت إني فاهمة وفي أمان.', service_id: 3, doctor_id: 1 },
    { name: 'Omar K.', review: 'They saved a tooth two other clinics told me to pull. Calm, honest, zero pressure.', service_id: 3, doctor_id: 1 },
    { name: 'Salma H.', review: 'المكان هادي جدًا والتعامل محترم، وابني دخل الكشف وهو بيضحك.', service_id: 9, doctor_id: 2 },
    { name: 'Tarek N.', review: 'The written plan with costs up front made the implant decision easy.', service_id: 5, doctor_id: 1 },
    { name: 'Yasmine A.', review: 'عملت تجربة مؤقتة للفينير وشفت النتيجة قبل أي حاجة. النتيجة طبيعية جدًا.', service_id: 7, doctor_id: 2 },
    { name: 'Hany G.', review: 'On time, spotless, and they actually listen. Best dental visit I have had.', service_id: 1, doctor_id: 1 },
    { name: 'Rania T.', review: 'كنت بخاف من الدكتور جدًا، هنا راحتي كانت أولوية بجد.', service_id: 2, doctor_id: 2 },
    { name: 'Ziad A.', review: 'Aligner check-ins are quick and the progress photos keep me motivated.', service_id: 8, doctor_id: 2 },
  ].map((x, i) => ({ id: i + 1, patient_id: null, name: x.name, doctor_id: x.doctor_id, service_id: x.service_id, rating: i === 6 ? 4 : 5, review: x.review, is_published: i !== 7, reply: null, created_at: dayOffset(-3 - i * 6) }))

  return {
    version, categories, services, specializations, doctors, branches, resources, faqs,
    patients, appointments, enquiries, reviews, chart, plans, invoices,
    settings: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', mazmed_url: '' },
  }
}
