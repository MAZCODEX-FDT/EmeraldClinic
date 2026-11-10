import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useLenis } from 'lenis/react'
import { Logo } from '@/components/brand/Logo'
import Magnet from '@/components/reactbits/Magnet'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP } from '@/lib/gsap'

export function Navbar() {
  const { t, toggle } = useLang()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis(({ scroll }) => setScrolled(scroll > 40))
  const darkHero = false

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { if (open) lenis?.stop(); else lenis?.start() }, [open, lenis])

  useGSAP(() => {
    if (!open) return
    gsap.fromTo('[data-mi]', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9 })
  }, { scope: menuRef, dependencies: [open] })

  const links = [
    { to: '/services', label: t.nav.services },
    { to: '/doctors', label: t.nav.doctors },
    { to: '/#journey', label: t.nav.journey },
    { to: '/#reviews', label: t.nav.reviews },
    { to: '/#contact', label: t.nav.contact },
  ]

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium ${scrolled ? 'py-3' : 'py-5'}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-full px-4 py-2.5 transition-all duration-500 md:px-6 ${scrolled ? 'mx-3 border border-deep/10 bg-ivory/80 shadow-[0_10px_40px_-20px_rgba(14,77,60,.35)] backdrop-blur-xl md:mx-auto' : ''}`}>
          <Link to="/" aria-label="Emerald Dental Clinic"><Logo light={darkHero} size={34} /></Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm transition-colors ${darkHero ? 'text-ivory/80 hover:text-ivory' : 'text-charcoal/70 hover:text-deep'} ${isActive && !l.to.includes('#') ? (darkHero ? 'text-ivory' : 'bg-deep/5 text-deep') : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${darkHero ? 'text-jade hover:text-ivory' : 'text-emerald hover:text-deep'}`}>{t.nav.lang}</button>
            <div className="hidden sm:block"><Magnet padding={40} magnetStrength={3}>
              <Link to="/book" className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${darkHero ? 'bg-ivory text-deep hover:bg-jade' : 'bg-deep text-ivory hover:bg-emerald'}`}>
                {t.nav.book}<ArrowUpRight className="size-4 transition-transform group-hover:rotate-45 rtl:-scale-x-100" />
              </Link>
            </Magnet></div>
            <button onClick={() => setOpen(true)} aria-label="Menu" className={`grid size-10 place-items-center rounded-full lg:hidden ${darkHero ? 'text-ivory' : 'text-deep'}`}><Menu /></button>
          </div>
        </div>
      </header>

      {open && (
        <div ref={menuRef} className="glow-bg grain fixed inset-0 z-[60] flex flex-col p-6 text-ivory" data-lenis-prevent>
          <div className="flex items-center justify-between">
            <Logo light size={34} />
            <button onClick={() => setOpen(false)} aria-label="Close" className="grid size-11 place-items-center rounded-full border border-ivory/20"><X /></button>
          </div>
          <nav className="mt-14 flex flex-col gap-2">
            {[{ to: '/', label: t.nav.home }, ...links, { to: '/book', label: t.nav.book }].map((l) => (
              <div key={l.to} className="overflow-hidden">
                <Link data-mi to={l.to} onClick={() => setOpen(false)} className="font-display block py-2 text-4xl font-medium">{l.label}</Link>
              </div>
            ))}
          </nav>
          <div className="mt-auto flex items-center justify-between text-sm text-jade">
            <button onClick={toggle}>{t.nav.lang}</button>
            <Link to="/dashboard">{t.nav.dashboard}</Link>
          </div>
        </div>
      )}
    </>
  )
}
