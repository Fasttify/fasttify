import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getYear } from "date-fns";

export function Footer() {
  return (
    <footer className="w-full bg-white text-gray-800 py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 mb-12 text-center lg:text-left">
          {/* Left Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-2">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <img
                src="/icons/fast@4x.webp"
                alt="Logo 1"
                className="h-12 w-12"
              />
              <img
                src="/icons/fastletras@4x.webp"
                alt="Fasttify Logo"
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-xl font-semibold">
              Nosotros creciendo tu negocio
              <br />
              con administrador personal de IA.
            </h2>
            <p className="text-gray-600">Fasttify, 2025.</p>
          </div>

          {/* Right Section - Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Compañía</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Carreras
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Precios
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Papeles
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Conferencias de prensa
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Términos de servicio
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Política de cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    Proceso de datos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            {getYear(new Date())} © Fasttify. Reservados todos los derechos.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              <Youtube className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
