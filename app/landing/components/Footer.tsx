import Link from 'next/link'
import { Facebook, Instagram, Youtube } from 'lucide-react'
import { getYear } from 'date-fns'

export function Footer() {
  return (
    <footer className="w-full bg-[#1e1e1e] text-white py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 mb-12 text-center lg:text-left">
          {/* Left Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
            <div className="flex items-center justify-center lg:justify-start gap-0 mb-4">
              <img src="/icons/fasttify-white.webp" alt="Logo 1" className="h-11 w-auto" />
              <img src="/icons/letter-white.webp" alt="Fasttify Logo" className="h-12 w-auto" />
            </div>
            <h2 className="text-xl font-medium">
              Nosotros creciendo tu negocio
              <br />
              con administrador personal de IA.
            </h2>
            <p className="text-white">Fasttify, 2025.</p>
          </div>

          {/* Right Section - Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Links */}
            <div>
              <h3 className="font-medium mb-4">Compañía</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-medium mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-white">
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white">
                    Papeles
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-white">
                    Conferencias de prensa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-white">
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white">
                    Política de cookies
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white">
                    Proceso de datos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-sm mb-4 md:mb-0">
            {getYear(new Date())} © Fasttify. Reservados todos los derechos.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-white">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white">
              <Youtube className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
