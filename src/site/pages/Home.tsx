import { HeroLight } from '../sections/HeroLight'
import { Statement } from '../sections/Statement'
import { TreatmentSlider } from '../sections/TreatmentSlider'
import { ProcessCards } from '../sections/ProcessCards'
import { JourneySteps } from '../sections/JourneySteps'
import { ImplantOrbit } from '../sections/ImplantOrbit'
import { ToothExplorer } from '../sections/ToothExplorer'
import { WrittenPlan } from '../sections/WrittenPlan'
import { Specialists } from '../sections/Specialists'
import { Reviews } from '../sections/Reviews'
import { Faq } from '../sections/Faq'
import { Cta } from '../sections/Cta'

export default function Home() {
  return (
    <>
      <HeroLight />
      <Statement />
      <TreatmentSlider />
      <ProcessCards />
      <JourneySteps />
      <ImplantOrbit />
      <ToothExplorer />
      <WrittenPlan />
      <Specialists />
      <Reviews />
      <Faq />
      <Cta />
    </>
  )
}
