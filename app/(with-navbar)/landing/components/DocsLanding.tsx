import { DropshippingIntro } from '@/app/(with-navbar)/landing/components/DropshippingIntro'
import { Platform } from '@/app/(with-navbar)/landing/components/Platform'
import { Footer } from '@/app/(with-navbar)/landing/components/Footer'
import { StepGuide } from '@/app/(with-navbar)/landing/components/StepGuide'
import { FirstView } from '@/app/(with-navbar)/landing/components/FirstView'
import { AboutUs } from '@/app/(with-navbar)/landing/components/AboutUs'
import { FashionSlider } from '@/app/(with-navbar)/landing/components/FashionSlider'
import { Feature } from '@/app/(with-navbar)/landing/components/Feature'
import { Testimonials } from '@/app/(with-navbar)/landing/components/Testimonials'
import { MarqueeLogos } from '@/app/(with-navbar)/landing/components/MarqueeLogos'
import { LogoCarousell } from '@/app/(with-navbar)/landing/components/LogoCarousell'
import outputs from '@/amplify_outputs.json'
import { Amplify } from 'aws-amplify'

Amplify.configure(outputs)
const existingConfig = Amplify.getConfig()
Amplify.configure({
  ...existingConfig,
  API: {
    ...existingConfig.API,
    REST: outputs.custom.APIs,
  },
})

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
