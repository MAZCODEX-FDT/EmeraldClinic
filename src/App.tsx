import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { isLive } from '@/lib/mazmed/live'
import { LangProvider } from '@/lib/i18n'
import { Mark } from '@/components/brand/Logo'
import { SiteLayout } from '@/site/SiteLayout'
import Home from '@/site/pages/Home'

const Treatments = lazy(() => import('@/site/pages/Treatments'))
const TreatmentDetail = lazy(() => import('@/site/pages/TreatmentDetail'))
const Visit = lazy(() => import('@/site/pages/Visit'))
const Contact = lazy(() => import('@/site/pages/Contact'))
const DoctorsPage = lazy(() => import('@/site/pages/DoctorsPage'))
const Book = lazy(() => import('@/site/pages/Book'))
const Login = lazy(() => import('@/dashboard/Login'))
const DashLayout = lazy(() => import('@/dashboard/DashLayout'))
const Overview = lazy(() => import('@/dashboard/pages/Overview'))
const Appointments = lazy(() => import('@/dashboard/pages/Appointments'))
const Patients = lazy(() => import('@/dashboard/pages/Patients'))
const PatientDetail = lazy(() => import('@/dashboard/pages/PatientDetail'))
const PlanPrint = lazy(() => import('@/dashboard/pages/PlanPrint'))
const Requests = lazy(() => import('@/dashboard/pages/Requests'))
const ServicesAdmin = lazy(() => import('@/dashboard/pages/ServicesAdmin'))
const DoctorsAdmin = lazy(() => import('@/dashboard/pages/DoctorsAdmin'))
const ReviewsAdmin = lazy(() => import('@/dashboard/pages/ReviewsAdmin'))
const Finance = lazy(() => import('@/dashboard/pages/Finance'))
const Settings = lazy(() => import('@/dashboard/pages/Settings'))

function Loader() {
  return <div className="grid min-h-screen place-items-center bg-ivory"><Mark size={56} className="animate-pulse" /></div>
}

// Hash routing for static hosts without SPA rewrites (e.g. the Claude-hosted preview)
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  return (
    <LangProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="treatments" element={<Treatments />} />
              <Route path="treatments/:slug" element={<TreatmentDetail />} />
              <Route path="services" element={<Navigate to="/treatments" replace />} />
              <Route path="visit" element={<Visit />} />
              <Route path="contact" element={<Contact />} />
              {/* /doctors is MazMed's doctor app on the clinic's own domain, so the site's page lives at /our-doctors. */}
              <Route path="our-doctors" element={<DoctorsPage />} />
              <Route path="doctors" element={<Navigate to="/our-doctors" replace />} />
              <Route path="book" element={<Book />} />
            </Route>
            {/* The demo dashboard only exists off MazMed; on the clinic's domain MazMed is the dashboard. */}
            {!isLive && <>
            <Route path="dashboard/login" element={<Login />} />
            <Route path="dashboard/patients/:id/plan" element={<PlanPrint />} />
            <Route path="dashboard" element={<DashLayout />}>
              <Route index element={<Overview />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="leads" element={<Requests />} />
              <Route path="requests" element={<Navigate to="/dashboard/leads" replace />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="doctors" element={<DoctorsAdmin />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="finance" element={<Finance />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            </>}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </LangProvider>
  )
}
