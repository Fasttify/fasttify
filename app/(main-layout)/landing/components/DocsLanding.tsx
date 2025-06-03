import { DropshippingIntro } from '@/app/(main-layout)/landing/components/DropshippingIntro'
import { Platform } from '@/app/(main-layout)/landing/components/Platform'
import { Footer } from '@/app/(main-layout)/landing/components/Footer'
import { StepGuide } from '@/app/(main-layout)/landing/components/StepGuide'
import { FirstView } from '@/app/(main-layout)/landing/components/FirstView'
import { AboutUs } from '@/app/(main-layout)/landing/components/AboutUs'
import { FashionSlider } from '@/app/(main-layout)/landing/components/FashionSlider'
import { Feature } from '@/app/(main-layout)/landing/components/Feature'
import { Testimonials } from '@/app/(main-layout)/landing/components/Testimonials'
import { MarqueeLogos } from '@/app/(main-layout)/landing/components/MarqueeLogos'
import { LogoCarousell } from '@/app/(main-layout)/landing/components/LogoCarousell'
import { configureAmplify } from '@/lib/amplify-config'

configureAmplify()

export default function LandingPage() {
  return (
    <>
      <FirstView />
      <AboutUs />

      <div className="h-screen">
        <FashionSlider />
      </div>

      <div id="integraciones">
        <Feature />
        <DropshippingIntro />
        <MarqueeLogos />
      </div>
      <LogoCarousell />
      <div id="multiplataforma">
        <Platform />
      </div>
      <div id="casos">
        <Testimonials />
      </div>
      <StepGuide />
      <div id="contacto">
        <Footer />
      </div>
    </>
  )
}
