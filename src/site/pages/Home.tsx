import { Hero } from '../sections/Hero'
import { Pillars } from '../sections/Pillars'
import { ServicesBento } from '../sections/ServicesBento'
import { ToothExplorer } from '../sections/ToothExplorer'
import { Journey } from '../sections/Journey'
import { WrittenPlan } from '../sections/WrittenPlan'
import { Stats } from '../sections/Stats'
import { Doctors } from '../sections/Doctors'
import { Reviews } from '../sections/Reviews'
import { Faq } from '../sections/Faq'
import { Cta } from '../sections/Cta'

export default function Home() {
  return (
    <>
      <Hero />
      <Pillars />
      <ServicesBento />
      <ToothExplorer />
      <Journey />
      <WrittenPlan />
      <Stats />
      <Doctors />
      <Reviews />
      <Faq />
      <Cta />
    </>
  )
}
