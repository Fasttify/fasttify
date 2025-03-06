import Image from 'next/image'
import Link from 'next/link'
import {
  Globe,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  TwitterIcon as TikTok,
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="mb-8 md:mb-0">
            <Image
              src="/icons/fasttify-white.webp"
              alt="Fasttify"
              width={80}
              height={80}
              className="mb-6"
            />
          </div>

          {/* Fasttify Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-medium text-base mb-4">Fasttify</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Carreras
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Afiliados
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Prensa
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-medium text-base mb-4">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Comunidad
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Contrata un experto
                </Link>
              </li>
            </ul>
          </div>

          {/* Desarrolladores Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-medium text-base mb-4">Desarrolladores</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Documentación API
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Integraciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Productos Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-medium text-base mb-4">Productos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Tiendas Online
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-gray-300">
                  Planes de Suscripción
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <button className="flex items-center text-sm">
              <Globe className="h-4 w-4 mr-2" />
              Colombia
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0">
            <Link href="#" className="text-sm hover:text-gray-300">
              Términos del servicio
            </Link>
            <Link href="#" className="text-sm hover:text-gray-300">
              Política de privacidad
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <Youtube className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="TikTok">
              <TikTok className="h-5 w-5" />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
