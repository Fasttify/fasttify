import {
  GlobeFilledIcon,
  LogoFacebookIcon,
  LogoInstagramIcon,
  LogoXIcon,
  LogoYoutubeIcon,
} from '@shopify/polaris-icons';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="mb-8 md:mb-0">
            <Image
              src="https://cdn.fasttify.com/assets/b/fasttify-white.webp"
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
                <Link href="/pricing" className="text-sm hover:text-gray-300">
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
              <GlobeFilledIcon className="h-6 w-6 mr-2" fill="white" />
              Colombia
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-4 md:mb-0">
            <Link href="/terms" className="text-sm hover:text-gray-300">
              Términos del servicio
            </Link>
            <Link href="/terms" className="text-sm hover:text-gray-300">
              Política de privacidad
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <LogoFacebookIcon fill="white" className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="Twitter">
              <LogoXIcon fill="white" className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="YouTube">
              <LogoYoutubeIcon fill="white" className="h-6 w-6" />
            </Link>
            <Link href="#" aria-label="Instagram">
              <LogoInstagramIcon fill="white" className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
