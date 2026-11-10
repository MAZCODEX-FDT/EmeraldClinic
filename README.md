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
Home sections: hero, statement with floating tooth, treatments slider, technology cards, pinned journey, implant orbit, **interactive tooth explorer** (FDI arch), **written plan** showcase, specialists carousel, reviews, FAQ, CTA and footer.
Other pages: `/services`, `/services/:slug`, `/doctors`, and `/book`, a 4-step booking flow that sends requests straight into the dashboard.
Brand rules applied: no prices, offers or guaranteed results on the public site; the voice is calm Egyptian Arabic.

## Dashboard (`/dashboard`)
Demo login: `admin@emeralddental.eg` / `emerald2026`
- Overview: KPIs, visit and collection charts, today's schedule, new requests, plans awaiting approval
- Appointments: day view by chair with a now-line, double-click to book, conflict check, and an upcoming list
- Patients: search, filters, and the patient file with an **interactive FDI dental chart** (8 tooth states), a treatment-plan builder, approval toggle, visits and payments
- **Printable written plan** in A4 letterhead (`/dashboard/patients/:id/plan`)
- Booking-request inbox: call, WhatsApp, or "Book it", which creates the patient and appointment
- Treatments CMS and Doctors (both update the website live), Reviews moderation, Finance, Settings

## Data
Everything is stored in `localStorage` (`src/lib/store.ts`) with seeded demo data (`src/lib/seed.ts`). Before launch, swap the store for a real API (Laravel/MazMed) and real auth (`src/dashboard/auth.ts`).

### Placeholders to replace
Phone, WhatsApp, email, domain, map link, doctor names, bios and photos, and real patient reviews.

## Scripts
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/ (SPA — configure the host to rewrite all routes to index.html)
```
For Bluehost / Apache, `public/.htaccess` already rewrites routes to `index.html`.
