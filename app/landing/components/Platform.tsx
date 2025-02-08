import { Smartphone, Laptop, Check } from "lucide-react";
import Image from "next/image";

export function PlatformCompatibility() {
  return (
    <section className="py-24 ">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-medium text-black mt-4 mb-6">
            Trabaja sin problemas en todos tus dispositivos
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Nuestra plataforma es compatible con todos tus dispositivos:
          </p>
          <ul className="mt-4 space-y-2">
            <li>Smartphones: iOS y Android</li>
            <li>Tablets: iPadOS y Android</li>
            <li>Computadoras: Windows, macOS y Linux</li>
            <li>Navegadores web: Chrome, Firefox, Safari y Edge</li>
          </ul>
          <p className="mt-6 text-lg text-gray-600">
            Sincroniza tu trabajo y accede desde cualquier lugar, en cualquier
            momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-80 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Imagen de fondo que ocupa toda la tarjeta */}
            <Image
              src="https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Mobile App Screenshot"
              fill
              className="object-cover"
            />

            {/* Capa superpuesta para el contenido */}
            <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-end">
              <div>
                <div className="flex items-center mb-2">
                  <Smartphone className="h-6 w-6 text-white mr-2" />
                  <h4 className="text-lg font-medium text-white">
                    Aplicación Móvil
                  </h4>
                </div>
                <p className="text-sm text-white">Plataformas: iOS y Android</p>
                <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mt-2">
                  <Check className="h-4 w-4 mr-1" />
                  PROXIMAMENTE
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-80 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Imagen de fondo que ocupa toda la tarjeta */}
            <Image
              src="https://images.unsplash.com/photo-1704230972797-e0e3aba0fce7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Desktop App Screenshot"
              fill
              className="object-cover"
            />

            {/* Capa superpuesta para el contenido */}
            <div className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-end">
              <div>
                <div className="flex items-center mb-2">
                  <Laptop className="h-6 w-6 text-white mr-2" />
                  <h4 className="text-lg font-medium text-white">
                    Potencia de Escritorio
                  </h4>
                </div>
                <p className="text-sm text-white">
                  Plataforma: Página de Escritorio (Windows y macOS)
                </p>
                <div className="inline-flex items-center bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full mt-2">
                  <Check className="h-4 w-4 mr-1" />
                  DISPONIBLE
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
