import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Laptop, Tablet, ArrowUpRight } from "lucide-react";

export function PlatformCompatibility() {
  return (
    <main className="min-h-screen bg-white p-6 md:p-12">
      <div className="mx-auto max-w-6xl">
        {/* Sección Hero */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white  ">
              <div className="w-3 h-6 bg-[#d5321c]" />
              <div className="w-3 h-6 bg-[#c42727]" />
              MULTIPLATAFORMA
            </div>

            <h1 className="text-5xl md:text-6xl font-normal text-black"> 
              Trabaja sin problemas <span className="block">en todos tus</span>{" "}
              <span className="block">dispositivos</span>
            </h1>

            <Button className="group rounded-full bg-black px-6 py-6 text-white hover:bg-black/90">
              Pruébalo ahora
              <ArrowUpRight className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="mt-4 space-y-2 text-sm text-[#6c747f]">
              <p>
                Nuestra plataforma es compatible con todos tus dispositivos:
              </p>
              <ul className="list-disc pl-5">
                <li>Smartphones: iOS y Android</li>
                <li>Tablets: iPadOS y Android</li>
                <li>Computadoras: Windows, macOS y Linux</li>
                <li>Navegadores web: Chrome, Firefox, Safari y Edge</li>
              </ul>
              <p>
                Sincroniza tu trabajo y accede desde cualquier lugar, en
                cualquier momento.
              </p>
            </div>
          </div>

          <div className="relative aspect-square">
            <Image
              src="https://images.unsplash.com/photo-1737233504527-c5033f0f1430?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Ilustración de compatibilidad multi-dispositivo"
              fill
              className="rounded-[32px] object-cover"
            />
          </div>
        </div>

        {/* Sección de Tarjetas */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Tarjeta de Compatibilidad Móvil */}
          <Card className="overflow-hidden rounded-[32px]  bg-[#e8c7c3] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-2">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-sm">iOS y Android</span>
            </div>
            <div className="mt-auto flex items-end justify-between pt-20">
              <h3 className="text-3xl font-bold tracking-wide leading-tight max-w-[80%] text-black">
                Amigable
                <br />
                con móviles
              </h3>
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </Card>

          {/* Tarjeta de Compatibilidad de Escritorio */}
          <Card className="overflow-hidden rounded-[32px] bg-[#F2F2F2] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -left-1 -top-1 h-6 w-6 rounded-full bg-green-300" />
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-gray-200">
                    <Laptop className="h-full w-full p-1" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Pagina de Escritorio</span>
                  <span className="text-sm text-gray-600">Windows y macOS</span>
                </div>
              </div>
              <span className="rounded-full border border-black px-3 py-1 text-xs font-medium">
                DISPONIBLE
              </span>
            </div>
            <div className="mt-auto flex items-end justify-between pt-20">
              <h3 className="font-condensed text-3xl font-bold leading-none">
                Potencia de
                <br />
                Escritorio
              </h3>
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </Card>

          {/* Estadísticas */}
          <div className="space-y-8 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Tablet className="h-8 w-8" />
                <div className="h-2 flex-grow rounded-full bg-gray-200">
                  <div className="h-full w-3/4 rounded-full bg-black" />
                </div>
              </div>
              <span className="text-sm text-gray-500">
                Optimización para Tablets
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="font-condensed text-4xl font-bold">99%</span>
                <p className="text-sm text-gray-500">
                  Compatibilidad de Dispositivos
                </p>
              </div>
              <div>
                <span className="font-condensed text-4xl font-bold">5+</span>
                <p className="text-sm text-gray-500">Plataformas Soportadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
