# Emerald Dental Clinic · إميرالد لطب الأسنان

A bilingual (Arabic RTL / English) clinic website plus a full clinic dashboard, built by MAZCODEX on the Emerald brand identity v1.0.

## Stack
- React 19 + Vite + TypeScript + Tailwind CSS v4
- **GSAP** (ScrollTrigger, `@gsap/react`): pinned horizontal journey, hero mark draw-on, parallax, staggered reveals
- **Lenis**: smooth scroll driven by the GSAP ticker, so ScrollTrigger stays in sync
- **React Bits**: Silk (hero), BlurText, ShinyText, ScrollReveal, CountUp, SpotlightCard, TiltedCard (flip doctor cards), AnimatedContent, Magnet, GradualBlur
- **21st.dev-inspired components**, rebuilt in the brand palette (the registry can't be reached from the build environment): Container Scroll Animation (@manuarora700), Background Paths (@kokonutd), Display Cards (@Codehagen), Bento Grid and Sidebar (@manuarora700)
- Recharts for the dashboard charts, lucide-react for icons, plus a custom monoline dental icon set that matches the logo

## Design (v2, Nov 2026)
The site follows a light, airy premium look based on the client's references: rounded hero panel with a soft Silk background, mixed thin and bold uppercase type, arch-shaped cards with 3D renders, a rotating "Your plan · written first" badge, a treatment slider, technology cards, a pinned step-by-step journey, an implant scene with orbiting labels and a specialists carousel. Colours stay on the Emerald palette.

### Images
All photos and 3D renders in `public/img` are **AI-generated placeholders** (made in Canva, design "Emerald website image assets"). That includes the four doctor portraits, which also show invented name tags on their coats. Replace them with the clinic's real photography before launch. Files ending in `-cut.webp` have transparent backgrounds.

## Website (`/`)
Home sections: hero, statement with floating tooth, treatments slider, technology cards, pinned journey, implant orbit, **interactive tooth explorer** (FDI arch), **written plan** showcase, specialists, reviews, FAQ, CTA and footer.

Pages:
- `/treatments`: every service with a category filter. `/treatments/:slug` gives each treatment its own page (description, before your visit, aftercare, FAQs, related treatments, doctors who offer it).
- `/visit`: the first-visit page, built to reassure and lead into a booking.
- `/contact`: branch details, a map and a message form (sent to MazMed as an appointment request).
- `/doctors`.
- `/book`: the **MazMed booking wizard**. It has the same 4 steps and fields as MazMed: services, doctor, time, details.

The site starts with **two doctors**, Dr. Youssef Mansour and Dr. Nour El-Hady. Their names, bios and photos are placeholders.

## MazMed integration
All data shapes in `src/lib/mazmed/types.ts` mirror MazMed's models and use the same field names:
- Service, ServiceCategory, Doctor with WeekDay hours and session gap, Branch, ClinicResource.
- Patient, Appointment, Enquiry, Review, DentalChartEntry with ToothConditions, TreatmentPlan with options and items, Invoice with payments.

`src/lib/mazmed/client.ts` talks to MazMed's public website endpoints:

| Website action | MazMed endpoint |
|---|---|
| Available times | `GET /site/booking/slots?doctor_id&date&services[]&branch_id` |
| Online booking | `POST /site/booking` (name, phone, email, gender, dob, doctor_id, date, slot, services[], branch_id, create_account, password, notes, coupon, consent, honeypot `website`, `form_started_at`) |
| Contact / request form | `POST /site/appointment` |

**To connect:** open Dashboard → Settings → MazMed connection, paste the clinic's MazMed URL, then click *Test connection*. You can set the URL at build time instead with `VITE_MAZMED_URL`. Without a URL, the site uses a local engine that follows the same rules as MazMed:
- Slot length = the sum of the service times, rounded up to the doctor's session gap.
- No overlaps, and nothing within 60 minutes from now.
- Patients are matched by Egyptian E.164 phone number.

**MazMed must allow the website origin** for those three routes, otherwise the browser blocks the requests:
- CORS: `allowed_origins` includes the website domain, with `supports_credentials`.
- CSRF: exempt `site/booking` and `site/appointment` in `VerifyCsrfToken`, or serve the site from the same domain.

## Dashboard (`/dashboard`)
Demo login: `admin@emeralddental.eg` / `emerald2026`. Every module follows MazMed's statuses and fields:
- **Overview:** KPIs, visits and collections charts, today's schedule, new leads, plans awaiting approval.
- **Appointments:** day view per chair (resource) and an upcoming list.
  - Statuses: booked, checked_in, completed, cancelled, cancelled_by_doctor, no_show, rescheduled.
  - Choosing several services sets the length from the doctor's session gap.
  - Blocks bookings that overlap for the same doctor or chair.
- **Leads:** the MazMed enquiries pipeline (new → contacted → qualified → booked / lost / spam). "Book it" creates the patient and the appointment.
- **Patients:** search by name, phone or patient ID. The patient file has four tabs:
  - **Dental chart** using MazMed tooth conditions and existing / planned / completed status.
  - **Treatment plans** with plan status, options and phased items.
  - Visits.
  - **Invoices** with MazMed payment methods: cash, card, wallet, InstaPay, bank transfer.
- **Printable written plan:** A4 letterhead at `/dashboard/patients/:id/plan`.
- **Services:** categories, charges, service time, website and online-booking toggles, preparation and aftercare.
- **Doctors:** weekly hours, session gap, services, specialisations, website, booking and new-patient toggles.
- **Reviews:** publish and reply. **Finance:** collections by payment method, unpaid invoices.
- **Settings:** branch details, chairs and the MazMed connection.

## Data
Until MazMed is connected, the dashboard demo data lives in `localStorage` (`src/lib/store.ts`), seeded from `src/lib/seed.ts`. The dashboard modules use the same field names as MazMed's admin. Moving them to MazMed's API v1 needs a small server-side proxy, because that API uses a Bearer key that must not ship to browsers. Replace the demo auth in `src/dashboard/auth.ts` at the same time.

### Placeholders to replace
Phone, WhatsApp, email, domain, map link, doctor names, bios and photos, and real patient reviews.

## Scripts
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/ (SPA — configure the host to rewrite all routes to index.html)
```
For Bluehost / Apache, `public/.htaccess` already rewrites routes to `index.html`.
