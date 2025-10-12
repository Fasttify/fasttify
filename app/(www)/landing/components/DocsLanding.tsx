import { DropshippingIntro } from '@/app/(www)/landing/components/DropshippingIntro';
import { Platform } from '@/app/(www)/landing/components/Platform';
import { Footer } from '@/app/(www)/landing/components/Footer';
import { StepGuide } from '@/app/(www)/landing/components/StepGuide';
import { FirstView } from '@/app/(www)/landing/components/FirstView';
import { AboutUs } from '@/app/(www)/landing/components/AboutUs';
import { FashionSlider } from '@/app/(www)/landing/components/FashionSlider';
import { Feature } from '@/app/(www)/landing/components/Feature';
import { Testimonials } from '@/app/(www)/landing/components/Testimonials';
import { MarqueeLogos } from '@/app/(www)/landing/components/MarqueeLogos';
import { LogoCarousell } from '@/app/(www)/landing/components/LogoCarousell';

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
  );
}
