import { DropshippingIntro } from '@/app/(with-navbar)/landing/components/DropshippingIntro'
import { Platform } from '@/app/(with-navbar)/landing/components/Platform'
import { Footer } from '@/app/(with-navbar)/landing/components/Footer'
import { StepGuide } from '@/app/(with-navbar)/landing/components/StepGuide'
import { FirstView } from '@/app/(with-navbar)/landing/components/FirstView'
import { AboutUs } from './AboutUs'
import { FashionSlider } from '@/app/(with-navbar)/landing/components/FashionSlider'
import { Feature } from '@/app/(with-navbar)/landing/components/Feature'
import { Testimonials } from '@/app/(with-navbar)/landing/components/Testimonials'
import { MarqueeLogos } from '@/app/(with-navbar)/landing/components/MarqueeLogos'
import { LogoCarousell } from '@/app/(with-navbar)/landing/components/LogoCarousell'

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
