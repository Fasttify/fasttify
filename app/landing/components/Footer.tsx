import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { getYear } from "date-fns";

export function Footer() {
  return (
    <footer className="w-full bg-white text-gray-800 py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Section */}
          <div className="lg:col-span-4 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="https://images.unsplash.com/photo-1719937051176-9b98352a6cf4?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Nosotros creciendo tu negocio
              <br />
              con administrador personal de IA.
            </h2>
            <p className="text-gray-600">Fasttify, 2025.</p>
          </div>

          {/* Right Section - Navigation */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center lg:text-left">
              {/* Company Links */}
              <div>
                <h3 className="font-semibold mb-4">Compañia</h3>
                <ul className="space-y-2 flex flex-col items-center lg:items-start">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Carreras
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Precios
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="font-semibold mb-4">Recursos</h3>
                <ul className="space-y-2 flex flex-col items-center lg:items-start">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Documentación
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Papeles
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Conferencias de prensa
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 flex flex-col items-center lg:items-start">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Términos de servicio
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      política de privacidad
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Política de cookies
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Proceso de datos
                    </Link>
                  </li>
                </ul>
              </div>
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
