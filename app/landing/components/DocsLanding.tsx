'use client'

import { PurchaseHistoryDemo } from './Notification'
import { PlatformCompatibility } from './Platform'
import { Footer } from './Footer'
import { StepGuide } from './StepGuide'
import { Navbar } from './NavBar'
import { FirstView } from './FirstView'
import { AboutUs } from './AboutUs'
import { FashionSlider } from './FashionSlider'
import { Feature } from './Feature'
import { Testimonials } from './Testimonials'

export const DocsLanding = () => {
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
        <PurchaseHistoryDemo />
      </div>
      <div id="multiplataforma">
        <PlatformCompatibility />
      </div>
      <div id="caracteristicas">
        <Testimonials />
      </div>
      <StepGuide />
      <div id="contacto">
        <Footer />
      </div>
    </>
  )
}
