import { PurchaseHistory } from './Notification'
import { PlatformCompatibility } from './Platform'
import { Footer } from './Footer'
import { StepGuide } from './StepGuide'
import { Navbar } from './NavBar'
import { FirstView } from './FirstView'
import { AboutUs } from './AboutUs'
import { FashionSlider } from './FashionSlider'
import { Feature } from './Feature'
import { Testimonials } from './Testimonials'
import { Templates } from '@/components/ui/reactbits/HeroParallax'
import { MarqueeLogos } from '@/app/landing/components/MarqueeLogos'

const products = [
  {
    title: 'Moonbeam',
    link: 'https://gomoonbeam.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739641375724-dfea74e0df69?q=80&w=1974&auto=format&fit=crop',
  },
  {
    title: 'Cursor',
    link: 'https://cursor.so',
    thumbnail:
      'https://images.unsplash.com/photo-1739518805568-41e07e3318b8?q=80&w=1984&auto=format&fit=crop',
  },
  {
    title: 'Rogue',
    link: 'https://userogue.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739632141610-018cfc9e60ef?q=80&w=1974&auto=format&fit=crop',
  },

  {
    title: 'Editorially',
    link: 'https://editorially.org',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Editrix AI',
    link: 'https://editrix.ai',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Pixel Perfect',
    link: 'https://app.pixelperfect.quest',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },

  {
    title: 'Algochurn',
    link: 'https://algochurn.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Aceternity UI',
    link: 'https://ui.aceternity.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Tailwind Master Kit',
    link: 'https://tailwindmasterkit.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'SmartBridge',
    link: 'https://smartbridgetech.com',
    thumbnail:
      'https://images.unsplash.com/photo-1739382122846-74e722a6eea4?q=80&w=2070&auto=format&fit=crop',
  },
]

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <FirstView />
      <AboutUs />
      <div className="h-40 sm:h-60">
        <MarqueeLogos />
      </div>
      <div className="h-screen">
        <FashionSlider />
      </div>

      <div id="integraciones">
        <Feature />
        <PurchaseHistory />
        <br />
        <Templates products={products} />
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
