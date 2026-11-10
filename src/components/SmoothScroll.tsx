import { useEffect, useRef } from 'react'
import { ReactLenis, type LenisRef } from 'lenis/react'
import { useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger } from '@/lib/gsap'

/** Lenis driven by the GSAP ticker so ScrollTrigger scenes stay in sync. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<LenisRef>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const update = (t: number) => ref.current?.lenis?.raf(t * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    const lenis = ref.current?.lenis
    lenis?.on('scroll', ScrollTrigger.update)
    return () => { gsap.ticker.remove(update); lenis?.off('scroll', ScrollTrigger.update) }
  }, [])

  useEffect(() => {
    ref.current?.lenis?.scrollTo(0, { immediate: true, force: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <ReactLenis
      root
      ref={ref}
      options={{ autoRaf: false, lerp: 0.09, anchors: { offset: -90 }, allowNestedScroll: true, autoToggle: true, stopInertiaOnNavigate: true }}
    >
      {children}
    </ReactLenis>
  )
}
