// Sidebar adapted from "Sidebar" by @manuarora700 (21st.dev): hover-expanding rail on desktop, drawer on mobile.
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, CalendarDays, Users, Inbox, Stethoscope, UserRound, Star, Wallet, Settings, LogOut, Menu, X, Globe, ExternalLink, Search } from 'lucide-react'
import { Mark, Logo } from '@/components/brand/Logo'
import { useLang } from '@/lib/i18n'
import { useDB, todayISO } from '@/lib/store'
import { auth } from './auth'
import { useTr } from './ui'
import { gsap, useGSAP } from '@/lib/gsap'

export default function DashLayout() {
  const tr = useTr()
  const { toggle, lang } = useLang()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [hover, setHover] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [q, setQ] = useState('')
  const requests = useDB((d) => d.enquiries)
  const patients = useDB((d) => d.patients)
  const newReq = useMemo(() => requests.filter((r) => r.status === 'new').length, [requests])
  const results = useMemo(() => (q.trim().length < 2 ? [] : patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q)).slice(0, 6)), [q, patients])
  useEffect(() => { setMobile(false); setQ('') }, [pathname])
  useGSAP(() => { gsap.fromTo('[data-page]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }) }, { dependencies: [pathname] })

  if (!auth.isIn()) return <Navigate to="/dashboard/login" replace />

  const links = [
    { to: '/dashboard', end: true, icon: LayoutGrid, label: tr('Overview', 'نظرة عامة') },
    { to: '/dashboard/appointments', icon: CalendarDays, label: tr('Appointments', 'المواعيد') },
    { to: '/dashboard/patients', icon: Users, label: tr('Patients', 'المرضى') },
    { to: '/dashboard/leads', icon: Inbox, label: tr('Leads', 'العملاء المحتملين'), badge: newReq },
    { to: '/dashboard/services', icon: Stethoscope, label: tr('Services', 'الخدمات') },
    { to: '/dashboard/doctors', icon: UserRound, label: tr('Doctors', 'الأطباء') },
    { to: '/dashboard/reviews', icon: Star, label: tr('Reviews', 'التقييمات') },
    { to: '/dashboard/finance', icon: Wallet, label: tr('Finance', 'الحسابات') },
    { to: '/dashboard/settings', icon: Settings, label: tr('Settings & MazMed', 'الإعدادات و MazMed') },
  ]
  const expanded = hover || mobile

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="mb-6 flex h-12 items-center gap-3 overflow-hidden px-2">
        {expanded ? <Logo light size={32} /> : <Mark size={32} tooth="#BFE3D3" smile="#F7F4EE" />}
      </div>
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end}
          className={({ isActive }) => `relative flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm whitespace-nowrap transition-colors ${isActive ? 'bg-ivory text-deep' : 'text-ivory/70 hover:bg-ivory/10 hover:text-ivory'}`}>
          <l.icon className="size-[1.15rem] shrink-0" />
          <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{l.label}</span>
          {!!l.badge && <span className={`absolute grid size-5 place-items-center rounded-full bg-jade text-[0.65rem] font-bold text-deep ${expanded ? 'end-3' : 'end-1.5 top-1.5 size-4'}`}>{l.badge}</span>}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1">
        <a href="/" target="_blank" className="flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm whitespace-nowrap text-ivory/70 hover:bg-ivory/10 hover:text-ivory">
          <ExternalLink className="size-[1.15rem] shrink-0" /><span className={expanded ? '' : 'opacity-0'}>{tr('View website', 'شوف الموقع')}</span>
        </a>
        <button onClick={() => { auth.logout(); nav('/dashboard/login') }} className="flex h-11 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-sm whitespace-nowrap text-ivory/70 hover:bg-ivory/10 hover:text-ivory">
          <LogOut className="size-[1.15rem] shrink-0 rtl:-scale-x-100" /><span className={expanded ? '' : 'opacity-0'}>{tr('Sign out', 'خروج')}</span>
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#F3F0E9]">
      <aside onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className={`glow-bg fixed inset-y-0 start-0 z-40 hidden transition-[width] duration-500 ease-premium md:block ${hover ? 'w-64 shadow-2xl' : 'w-[4.5rem]'}`}>
        {sidebar}
      </aside>
      {mobile && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobile(false)}>
          <div className="absolute inset-0 bg-deeper/40" />
          <aside className="glow-bg absolute inset-y-0 start-0 w-72" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobile(false)} className="absolute end-3 top-5 text-ivory" aria-label="Close"><X /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="md:ps-[4.5rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-deep/5 bg-[#F3F0E9]/85 px-4 backdrop-blur-xl md:px-8">
          <button className="md:hidden" onClick={() => setMobile(true)} aria-label="Menu"><Menu className="text-deep" /></button>
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search patients by name or phone…', 'دوّر على مريض بالاسم أو الرقم…')} className="w-full rounded-full border border-deep/10 bg-white py-2.5 ps-10 pe-4 text-sm outline-none focus:border-emerald" />
            {results.length > 0 && (
              <div className="absolute inset-x-0 top-12 overflow-hidden rounded-2xl border border-deep/10 bg-white shadow-xl">
                {results.map((p) => (
                  <button key={p.id} onClick={() => nav(`/dashboard/patients/${p.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-start text-sm hover:bg-ivory">
                    <span className="font-medium text-deep">{p.name}</span><span className="text-xs text-stone" dir="ltr">{p.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <span className="hidden text-sm text-stone lg:block">{new Date(todayISO() + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            <button onClick={toggle} className="grid size-10 place-items-center rounded-full border border-deep/10 bg-white text-deep" aria-label="Language"><Globe className="size-4" /></button>
            <div className="font-display grid size-10 place-items-center rounded-full bg-deep text-sm text-ivory">YM</div>
          </div>
        </header>
        <main data-page className="mx-auto max-w-[1400px] p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
