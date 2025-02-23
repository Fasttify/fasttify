import { DropshippingIntro } from './DropshippingIntro'
import { Platform } from './Platform'
import { Footer } from './Footer'
import { StepGuide } from './StepGuide'
import { Navbar } from './NavBar'
import { FirstView } from './FirstView'
import { AboutUs } from './AboutUs'
import { FashionSlider } from './FashionSlider'
import { Feature } from './Feature'
import { Testimonials } from './Testimonials'
import { MarqueeLogos } from './MarqueeLogos'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <FirstView />
      <AboutUs />

      <div className="h-screen">
        <FashionSlider />
      </div>

      <div id="integraciones">
        <Feature />
        <DropshippingIntro />
        <br />
        <div className="h-25 sm:h-60">
          <MarqueeLogos />
        </div>
      </div>
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
