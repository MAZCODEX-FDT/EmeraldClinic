// Adapted from "Container Scroll Animation" by @manuarora700 (21st.dev) — rebuilt on GSAP ScrollTrigger.
import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

export function ContainerScroll({ title, children }: { title: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    if (prefersReducedMotion()) return
    const mobile = window.innerWidth < 768
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center 45%', scrub: 0.6 },
    })
    tl.fromTo('[data-cs-card]', { rotateX: 24, scale: mobile ? 0.82 : 1.06 }, { rotateX: 0, scale: mobile ? 0.94 : 1 }, 0)
      .fromTo('[data-cs-title]', { y: 0 }, { y: -80 }, 0)
  }, { scope: root })

  return (
    <div ref={root} className="relative flex items-center justify-center px-4 py-16 md:py-24">
      <div className="w-full" style={{ perspective: '1100px' }}>
        <div data-cs-title className="mx-auto max-w-4xl text-center">{title}</div>
        <div
          data-cs-card
          className="mx-auto -mt-6 w-full max-w-5xl rounded-[30px] border-4 border-[#3a4a45] bg-[#1d2523] p-2 shadow-[0_0_#0000004d,0_9px_20px_#0000004a,0_37px_37px_#00000042,0_84px_50px_#00000026,0_149px_60px_#0000000a] md:p-5"
          style={{ transformOrigin: 'center top', willChange: 'transform' }}
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-ivory">{children}</div>
        </div>
      </div>
    </div>
  )
}
