import type { DB, Service, Doctor, Patient, Appointment, BookingRequest, Review, Payment, ToothState, ApptStatus } from './store'

// Deterministic PRNG so the demo data looks the same on every first load.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const iso = (d: Date) => {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}
const dayOffset = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }

export const services: Service[] = [
  {
    id: 's-checkup', slug: 'checkup-cleaning', icon: 'checkup', category: 'preventive', duration: 45, price: 900, visible: true,
    name: { en: 'Check-up & Cleaning', ar: 'كشف وتنظيف جير' },
    short: { en: 'A full digital exam, scaling and polishing — the calm start of every plan.', ar: 'كشف كامل بالأشعة الرقمية، تنظيف جير وتلميع — البداية الهادية لأي خطة.' },
    long: {
      en: 'We look at every tooth, the gums and the bite, take low-dose digital X-rays when needed, then clean and polish. You leave with a clear picture of your mouth and a written list of what needs attention — and what does not.',
      ar: 'بنبص على كل سنة واللثة والـbite، وناخد أشعة رقمية بجرعة قليلة لو محتاجين، وبعدها تنظيف وتلميع. هتمشي وانت فاهم بقك كويس، ومعاك ورقة مكتوب فيها اللي محتاج متابعة — واللي مش محتاج.',
    },
    steps: [
      { en: 'Conversation about what bothers you', ar: 'كلام هادي عن اللي مضايقك' },
      { en: 'Digital exam & X-rays', ar: 'كشف وأشعة رقمية' },
      { en: 'Scaling & polishing', ar: 'تنظيف جير وتلميع' },
      { en: 'Written findings', ar: 'تقرير مكتوب بالنتيجة' },
    ],
    sessions: { en: '1 visit', ar: 'زيارة واحدة' },
  },
  {
    id: 's-filling', slug: 'tooth-coloured-fillings', icon: 'filling', category: 'restorative', duration: 45, price: 1200, visible: true,
    name: { en: 'Tooth-coloured Fillings', ar: 'حشو تجميلي' },
    short: { en: 'Composite fillings matched to your shade, placed with minimal drilling.', ar: 'حشو composite بلون سنتك، بأقل حفر ممكن.' },
    long: {
      en: 'We remove only the decayed part, keep as much natural tooth as possible and rebuild it in layers of composite matched to your exact shade.',
      ar: 'بنشيل التسوس بس، ونحافظ على أكبر جزء من السنة الطبيعية، ونبني الحشو طبقات بلون مطابق لسنتك.',
    },
    steps: [
      { en: 'Shade matching', ar: 'اختيار اللون' },
      { en: 'Gentle numbing', ar: 'بنج مريح' },
      { en: 'Minimal removal of decay', ar: 'إزالة التسوس بأقل حفر' },
      { en: 'Layered composite & bite check', ar: 'حشو طبقات وضبط الـbite' },
    ],
    sessions: { en: '1 visit', ar: 'زيارة واحدة' },
  },
  {
    id: 's-rootcanal', slug: 'root-canal', icon: 'rootcanal', category: 'restorative', duration: 75, price: 3500, visible: true,
    name: { en: 'Root Canal Treatment', ar: 'علاج عصب (Root Canal)\u200F' },
    short: { en: 'Microscope-guided endodontics so we can save the tooth, not pull it.', ar: 'علاج عصب بالميكروسكوب علشان نحافظ على السنة بدل ما نخلعها.' },
    long: {
      en: 'Saving your natural tooth is always our first option. With rotary files, apex locators and magnification, most root canals are done in one or two comfortable visits.',
      ar: 'الحفاظ على سنتك الطبيعية دايمًا أول اختيار عندنا. بالـrotary files والـapex locator والتكبير، أغلب حالات العصب بتخلص في زيارة أو اتنين مريحين.',
    },
    steps: [
      { en: 'Diagnosis with X-ray', ar: 'تشخيص بالأشعة' },
      { en: 'Cleaning the canals', ar: 'تنظيف القنوات' },
      { en: 'Sealing', ar: 'حشو القنوات' },
      { en: 'Protective build-up or crown', ar: 'حشو نهائي أو كراون للحماية' },
    ],
    sessions: { en: '1–2 visits', ar: '١–٢ زيارة' },
  },
  {
    id: 's-crown', slug: 'crowns-bridges', icon: 'crown', category: 'restorative', duration: 60, price: 4500, visible: true,
    name: { en: 'Crowns & Bridges', ar: 'تركيبات وكراون' },
    short: { en: 'Zirconia and E-max restorations, designed digitally for a natural fit.', ar: 'تركيبات زيركون وE-max متصممة ديجيتال علشان تركب طبيعي.' },
    long: {
      en: 'When a tooth is too weak for a filling, a crown protects it for years. We scan, design and try in before cementing — nothing is final until you are happy.',
      ar: 'لما السنة تكون ضعيفة على الحشو، الكراون بيحميها لسنين. بنعمل scan وتصميم وتجربة قبل التثبيت — مفيش حاجة بتتثبت غير لما تكون مرتاح.',
    },
    steps: [
      { en: 'Preparation', ar: 'تجهيز السنة' },
      { en: 'Digital scan', ar: 'Scan ديجيتال' },
      { en: 'Try-in', ar: 'تجربة' },
      { en: 'Final cementation', ar: 'التثبيت النهائي' },
    ],
    sessions: { en: '2 visits', ar: 'زيارتين' },
  },
  {
    id: 's-implant', slug: 'dental-implants', icon: 'implant', category: 'surgical', duration: 90, price: 18000, visible: true,
    name: { en: 'Dental Implants', ar: 'زراعة الأسنان' },
    short: { en: 'Guided implant placement when a tooth truly cannot be saved.', ar: 'زراعة بدليل جراحي لما السنة فعلًا مينفعش تتنقذ.' },
    long: {
      en: 'Only when saving the tooth is not possible do we plan an implant — with a 3D scan, a guided surgery and a clear timeline written in your plan from day one.',
      ar: 'بنلجأ للزراعة بس لما الحفاظ على السنة يبقى مش ممكن — بأشعة 3D وجراحة بدليل، والمدة كلها مكتوبة في خطتك من أول يوم.',
    },
    steps: [
      { en: '3D CBCT planning', ar: 'تخطيط بأشعة 3D' },
      { en: 'Guided placement', ar: 'زراعة بدليل جراحي' },
      { en: 'Healing period', ar: 'فترة التئام' },
      { en: 'Crown on implant', ar: 'تركيب الكراون' },
    ],
    sessions: { en: '3–4 visits over 3 months', ar: '٣–٤ زيارات على ٣ شهور' },
  },
  {
    id: 's-whitening', slug: 'teeth-whitening', icon: 'whitening', category: 'cosmetic', duration: 60, price: 3000, visible: true,
    name: { en: 'Teeth Whitening', ar: 'تبييض الأسنان' },
    short: { en: 'In-clinic whitening with sensitivity care — natural shades, not chalk white.', ar: 'تبييض في العيادة مع حماية من الحساسية — درجات طبيعية مش أبيض مبالغ فيه.' },
    long: {
      en: 'We check that your teeth and gums are healthy first, agree on a realistic target shade together, then whiten in a single comfortable session.',
      ar: 'بنتأكد الأول إن سنانك ولثتك سليمين، ونتفق سوا على درجة واقعية، وبعدها التبييض في جلسة واحدة مريحة.',
    },
    steps: [
      { en: 'Health check', ar: 'كشف' },
      { en: 'Shade goal', ar: 'تحديد الدرجة' },
      { en: 'Whitening session', ar: 'جلسة التبييض' },
      { en: 'Aftercare kit', ar: 'تعليمات وعناية بعدها' },
    ],
    sessions: { en: '1 visit', ar: 'زيارة واحدة' },
  },
  {
    id: 's-veneers', slug: 'smile-design-veneers', icon: 'veneer', category: 'cosmetic', duration: 90, price: 6000, visible: true,
    name: { en: 'Smile Design & Veneers', ar: 'تصميم الابتسامة (Veneers)\u200F' },
    short: { en: 'Digital smile design with a mock-up you can see before anything is touched.', ar: 'تصميم ابتسامة ديجيتال وMock-up تشوفه قبل ما نلمس أي سنة.' },
    long: {
      en: 'We design your smile on screen, try it in your mouth as a temporary mock-up, and only then prepare minimal-thickness veneers.',
      ar: 'بنصمم ابتسامتك على الشاشة، وتجربها في بقك كـmock-up مؤقت، وبعدها بس نجهز veneers بأقل سُمك.',
    },
    steps: [
      { en: 'Photos & smile analysis', ar: 'صور وتحليل الابتسامة' },
      { en: 'Digital design', ar: 'تصميم ديجيتال' },
      { en: 'Mock-up try-in', ar: 'تجربة Mock-up' },
      { en: 'Final veneers', ar: 'تركيب الـveneers' },
    ],
    sessions: { en: '3 visits', ar: '٣ زيارات' },
  },
  {
    id: 's-aligners', slug: 'clear-aligners', icon: 'aligner', category: 'ortho', duration: 45, price: 45000, visible: true,
    name: { en: 'Clear Aligners', ar: 'التقويم الشفاف' },
    short: { en: 'Invisible orthodontics planned in 3D, with check-ins every 6–8 weeks.', ar: 'تقويم شفاف متخطط 3D، ومتابعة كل ٦–٨ أسابيع.' },
    long: {
      en: 'You see the full movement of your teeth before you start. Aligners are removable, discreet and reviewed regularly so the plan stays on track.',
      ar: 'بتشوف حركة سنانك كلها قبل ما تبدأ. الـaligners بتتشال وتتركب، مش باينة، وبنتابعها بانتظام علشان الخطة تمشي صح.',
    },
    steps: [
      { en: 'Scan & photos', ar: 'Scan وصور' },
      { en: '3D movement plan', ar: 'خطة حركة 3D' },
      { en: 'Aligner series', ar: 'مراحل الـaligners' },
      { en: 'Retainers', ar: 'مثبت بعد التقويم' },
    ],
    sessions: { en: '6–18 months', ar: '٦–١٨ شهر' },
  },
  {
    id: 's-kids', slug: 'kids-dentistry', icon: 'kids', category: 'pediatric', duration: 30, price: 700, visible: true,
    name: { en: "Children's Dentistry", ar: 'أسنان الأطفال' },
    short: { en: 'Gentle first visits, fissure sealants and fluoride — no fear, no rush.', ar: 'أول زيارات هادية، سد شقوق وفلورايد — من غير خوف ولا استعجال.' },
    long: {
      en: 'The first visits are about trust. We explain everything to your child in their language, and keep treatment short and calm.',
      ar: 'أول الزيارات هدفها الثقة. بنشرح لطفلك كل حاجة بلغته، والعلاج بيكون قصير وهادي.',
    },
    steps: [
      { en: 'Meet the chair', ar: 'تعارف على الكرسي' },
      { en: 'Check-up', ar: 'كشف' },
      { en: 'Sealants & fluoride', ar: 'سد شقوق وفلورايد' },
      { en: 'Home routine', ar: 'روتين في البيت' },
    ],
    sessions: { en: '1 visit', ar: 'زيارة واحدة' },
  },
  {
    id: 's-wisdom', slug: 'wisdom-tooth', icon: 'extraction', category: 'surgical', duration: 60, price: 2500, visible: true,
    name: { en: 'Wisdom Tooth Surgery', ar: 'خلع ضرس العقل' },
    short: { en: 'Careful surgical removal when a wisdom tooth is causing real problems.', ar: 'خلع جراحي بعناية لما ضرس العقل يكون عامل مشكلة حقيقية.' },
    long: {
      en: 'Not every wisdom tooth needs to go. When it does, we plan with X-rays, keep the procedure gentle and give you clear written aftercare.',
      ar: 'مش كل ضرس عقل لازم يتخلع. ولو لازم، بنخطط بالأشعة، والعملية بتكون هادية، ومعاك تعليمات مكتوبة بعدها.',
    },
    steps: [
      { en: 'X-ray assessment', ar: 'تقييم بالأشعة' },
      { en: 'Comfortable anaesthesia', ar: 'بنج مريح' },
      { en: 'Gentle removal', ar: 'خلع بهدوء' },
      { en: 'Written aftercare', ar: 'تعليمات مكتوبة' },
    ],
    sessions: { en: '1 visit + check', ar: 'زيارة + متابعة' },
  },
]

// Placeholder doctors — names, bios and photos to be replaced with the clinic's real team.
export const doctors: Doctor[] = [
  {
    id: 'd-1', initials: 'YM', color: '#0E4D3C', years: 14, visible: true, days: [6, 0, 1, 2, 3],
    name: { en: 'Dr. Youssef Mansour', ar: 'د. يوسف منصور' },
    role: { en: 'Founder · Endodontics & Restorative', ar: 'المؤسس · علاج الجذور والترميم' },
    bio: { en: 'Believes the best tooth is the one you were born with. Leads every treatment-planning meeting.', ar: 'مؤمن إن أحسن سنة هي اللي اتولدت بيها. بيقود كل اجتماعات تخطيط العلاج.' },
    services: ['s-rootcanal', 's-filling', 's-crown', 's-checkup'],
  },
  {
    id: 'd-2', initials: 'NH', color: '#1F7A5C', years: 9, visible: true, days: [6, 1, 3, 4],
    name: { en: 'Dr. Nour El-Hady', ar: 'د. نور الهادي' },
    role: { en: 'Cosmetic Dentistry & Smile Design', ar: 'تجميل الأسنان وتصميم الابتسامة' },
    bio: { en: 'Designs smiles that look like you on a good day — never like a filter.', ar: 'بتصمم ابتسامات شبهك في أحلى يوم — مش شبه فلتر.' },
    services: ['s-veneers', 's-whitening', 's-crown', 's-filling'],
  },
  {
    id: 'd-3', initials: 'KS', color: '#125A47', years: 12, visible: true, days: [0, 2, 4],
    name: { en: 'Dr. Karim Saleh', ar: 'د. كريم صالح' },
    role: { en: 'Oral Surgery & Implantology', ar: 'جراحة الفم والزراعة' },
    bio: { en: 'Plans every implant in 3D first, and only places one when saving the tooth is no longer possible.', ar: 'بيخطط كل زراعة 3D الأول، وبيزرع بس لما إنقاذ السنة يبقى مش ممكن.' },
    services: ['s-implant', 's-wisdom'],
  },
  {
    id: 'd-4', initials: 'LA', color: '#2B2F2E', years: 7, visible: true, days: [6, 0, 1, 3],
    name: { en: 'Dr. Laila Adel', ar: 'د. ليلى عادل' },
    role: { en: 'Orthodontics & Pediatric', ar: 'تقويم وأسنان أطفال' },
    bio: { en: 'Turns first visits into good memories, and aligner plans into steady progress.', ar: 'بتخلي أول زيارة ذكرى حلوة، وخطة التقويم تقدّم ثابت.' },
    services: ['s-aligners', 's-kids', 's-checkup'],
  },
]

const names: [string, 'm' | 'f'][] = [
  ['Ahmed Samir', 'm'], ['Mona Fawzy', 'f'], ['Omar Khaled', 'm'], ['Salma Hassan', 'f'], ['Mahmoud Ezzat', 'm'],
  ['Heba Mostafa', 'f'], ['Tarek Nabil', 'm'], ['Yasmine Adly', 'f'], ['Mostafa Ragab', 'm'], ['Nada Sherif', 'f'],
  ['Hany Gamal', 'm'], ['Rania Tawfik', 'f'], ['Ziad Ashraf', 'm'], ['Farida Lotfy', 'f'], ['Karim Abdelaziz', 'm'],
  ['Dina Morsy', 'f'], ['Sherif Wahba', 'm'], ['Aya Soliman', 'f'],
]

export function seed(version: number): DB {
  const r = rng(20261110)
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const now = new Date()

  const states: ToothState[] = ['caries', 'filling', 'rootcanal', 'crown', 'missing', 'watch', 'implant']
  const allTeeth = [11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48]

  const patients: Patient[] = names.map(([name, gender], i) => {
    const teeth: Record<number, ToothState> = {}
    const n = 2 + Math.floor(r() * 5)
    for (let k = 0; k < n; k++) teeth[pick(allTeeth)] = pick(states)
    const plan = Object.entries(teeth)
      .filter(([, s]) => s === 'caries' || s === 'missing' || s === 'watch')
      .map(([tooth, s], j) => {
        const svc = s === 'caries' ? 's-filling' : s === 'missing' ? 's-implant' : 's-rootcanal'
        return {
          id: `pi-${i}-${j}`, tooth: Number(tooth), serviceId: svc, note: '',
          cost: services.find((x) => x.id === svc)!.price, status: (j === 0 && r() > 0.5 ? 'in-progress' : 'planned') as Patient['plan'][number]['status'],
        }
      })
    const created = new Date(now); created.setDate(created.getDate() - Math.floor(r() * 200) - 5)
    return {
      id: `p-${i + 1}`, name, gender,
      phone: '01' + pick(['0', '1', '2', '5']) + String(Math.floor(10000000 + r() * 89999999)),
      dob: `${1965 + Math.floor(r() * 45)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(r() * 9)}`,
      email: i % 3 === 0 ? name.toLowerCase().replace(' ', '.') + '@mail.com' : undefined,
      notes: i === 1 ? 'Anxious patient — prefers morning-after-noon slots, explain each step.' : i === 4 ? 'Penicillin allergy.' : '',
      createdAt: iso(created), teeth, plan, planApproved: r() > 0.4,
      tags: i === 1 ? ['anxious'] : i === 4 ? ['allergy'] : i % 5 === 0 ? ['vip'] : [],
    }
  })

  const appointments: Appointment[] = []
  const payments: Payment[] = []
  const slots = ['12:00', '12:45', '13:30', '14:30', '15:15', '16:00', '17:00', '18:00', '18:45', '19:30', '20:15', '21:00']
  let aid = 1
  for (let off = -28; off <= 12; off++) {
    const date = dayOffset(off)
    const dow = new Date(date + 'T00:00:00').getDay()
    if (dow === 5) continue // Friday off
    const count = off === 0 ? 8 : 3 + Math.floor(r() * 5)
    const busy: { c: number; s: number; e: number }[] = []
    for (let k = 0; k < count; k++) {
      const doc = pick(doctors)
      const svcId = pick(doc.services)
      const svc = services.find((s) => s.id === svcId)!
      const chair = 1 + (k % 3)
      const toM = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3))
      const free = (t: string) => !busy.some((b) => b.c === chair && toM(t) < b.e && toM(t) + svc.duration > b.s) && toM(t) + svc.duration <= 22 * 60
      const options = slots.filter(free)
      if (!options.length) continue
      const time = pick(options)
      busy.push({ c: chair, s: toM(time), e: toM(time) + svc.duration })
      const p = pick(patients)
      let status: ApptStatus = 'booked'
      if (off < 0) status = r() > 0.9 ? 'no-show' : r() > 0.95 ? 'cancelled' : 'done'
      else if (off === 0) status = time < '15:00' ? 'done' : time < '16:30' ? pick(['arrived', 'in-chair'] as ApptStatus[]) : 'confirmed'
      else status = r() > 0.5 ? 'confirmed' : 'booked'
      appointments.push({ id: `a-${aid++}`, patientId: p.id, doctorId: doc.id, serviceId: svcId, date, time, duration: svc.duration, chair, status, notes: '' })
      if (status === 'done') {
        payments.push({
          id: `pay-${aid}`, patientId: p.id, amount: Math.round((svc.price * (0.5 + r() * 0.5)) / 50) * 50,
          method: pick(['cash', 'card', 'instapay'] as Payment['method'][]), date, note: svc.name.en,
        })
      }
    }
  }

  const requests: BookingRequest[] = [
    { name: 'Mariam Fathy', svc: 's-veneers', msg: 'عايزة أعرف لو ينفع أعمل mock-up الأول', src: 'website' },
    { name: 'Hossam Adel', svc: 's-rootcanal', msg: 'Pain in lower left molar since 3 days', src: 'whatsapp' },
    { name: 'Nourhan Said', svc: 's-kids', msg: 'ابني عنده ٦ سنين وأول زيارة', src: 'website' },
    { name: 'Amr Zaki', svc: 's-implant', msg: 'Missing tooth, want a consultation', src: 'phone' },
    { name: 'Reem Ibrahim', svc: 's-whitening', msg: '', src: 'website' },
    { name: 'Adham Youssef', svc: 's-aligners', msg: 'هل التقويم الشفاف مناسب لحالتي؟', src: 'website' },
  ].map((x, i) => ({
    id: `r-${i + 1}`, name: x.name, phone: '010' + String(10000000 + i * 1234567).slice(0, 8), serviceId: x.svc,
    date: dayOffset(1 + (i % 4)), time: slots[(i * 3) % slots.length], message: x.msg,
    createdAt: new Date(now.getTime() - i * 3.6e6 * 5).toISOString(),
    status: (i < 4 ? 'new' : i === 4 ? 'contacted' : 'booked') as BookingRequest['status'], source: x.src as BookingRequest['source'],
  }))

  const reviews: Review[] = [
    { name: 'Mona F.', lang: 'ar', text: 'أول مرة دكتور يشرحلي الخطة كلها ويكتبهالي قبل ما يبدأ. حسيت إني فاهمة وفي أمان.', serviceId: 's-rootcanal' },
    { name: 'Omar K.', lang: 'en', text: 'They saved a tooth two other clinics told me to pull. Calm, honest, zero pressure.', serviceId: 's-rootcanal' },
    { name: 'Salma H.', lang: 'ar', text: 'المكان هادي جدًا والتعامل محترم، وابني دخل الكشف وهو بيضحك.', serviceId: 's-kids' },
    { name: 'Tarek N.', lang: 'en', text: 'The written plan with costs up front made the implant decision easy.', serviceId: 's-implant' },
    { name: 'Yasmine A.', lang: 'ar', text: 'عملت mock-up للـveneers وشفت النتيجة قبل أي حاجة. النتيجة طبيعية جدًا.', serviceId: 's-veneers' },
    { name: 'Hany G.', lang: 'en', text: 'On time, spotless, and they actually listen. Best dental visit I have had.', serviceId: 's-checkup' },
    { name: 'Rania T.', lang: 'ar', text: 'كنت بخاف من الدكتور جدًا، هنا راحتي كانت أولوية بجد.', serviceId: 's-filling' },
    { name: 'Ziad A.', lang: 'en', text: 'Aligner check-ins are quick and the progress photos keep me motivated.', serviceId: 's-aligners' },
  ].map((x, i) => ({ id: `rv-${i + 1}`, name: x.name, text: x.text, lang: x.lang as 'ar' | 'en', rating: i === 6 ? 4 : 5, visible: i !== 7, date: dayOffset(-3 - i * 6), serviceId: x.serviceId }))

  return {
    version, services, doctors, patients, appointments, requests, reviews, payments,
    settings: {
      phone: '+20 10 0000 0000', whatsapp: '+201000000000', email: 'hello@emeralddental.eg',
      address: { en: 'Nasr City, Cairo', ar: 'مدينة نصر، القاهرة' },
      hours: { en: 'Sat – Thu · 12 PM – 10 PM', ar: 'السبت – الخميس · ١٢ ظهرًا – ١٠ مساءً' },
      mapUrl: 'https://maps.google.com/?q=Nasr+City+Cairo', chairs: 3,
      instagram: 'https://instagram.com/', facebook: 'https://facebook.com/',
    },
  }
}
