import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { LangProvider } from '@/lib/i18n'
import { Mark } from '@/components/brand/Logo'
import { SiteLayout } from '@/site/SiteLayout'
import Home from '@/site/pages/Home'

const Services = lazy(() => import('@/site/pages/Services'))
const ServiceDetail = lazy(() => import('@/site/pages/ServiceDetail'))
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

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route index element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="services/:slug" element={<ServiceDetail />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="book" element={<Book />} />
            </Route>
            <Route path="dashboard/login" element={<Login />} />
            <Route path="dashboard/patients/:id/plan" element={<PlanPrint />} />
            <Route path="dashboard" element={<DashLayout />}>
              <Route index element={<Overview />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="requests" element={<Requests />} />
              <Route path="services" element={<ServicesAdmin />} />
              <Route path="doctors" element={<DoctorsAdmin />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
              <Route path="finance" element={<Finance />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LangProvider>
  )
}
