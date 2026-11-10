import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { SmoothScroll } from '@/components/SmoothScroll'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

function HashScroll() {
  const { hash, pathname } = useLocation()
  const lenis = useLenis()
  useEffect(() => {
    if (!hash || !lenis) return
    const id = setTimeout(() => lenis.scrollTo(hash, { offset: -90 }), 120)
    return () => clearTimeout(id)
  }, [hash, pathname, lenis])
  return null
}

export function SiteLayout() {
  return (
    <SmoothScroll>
      <HashScroll />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </SmoothScroll>
  )
}
