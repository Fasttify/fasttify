"use client";

import Image from "next/image";
import { PurchaseHistoryDemo } from "./Notification";
import { PlatformCompatibility } from "./Platform";
import { Personalization } from "./Personalization";
import { BentoDemo } from "./Bento";
import { Footer } from "./Footer";
import { StepGuide } from "./StepGuide";
import { Navbar } from "./NavBar";
import { Waitlist } from "./Waitlis";



export const DocsLanding = () => {
  return (
    <>
      <div className="min-h-screen bg-white ">
        {/* Navigation */}

        <Navbar />
        <br />
        <br />
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center mt-16">
          {/* Left Column */}
          <div>
            <h1 className="text-[56px] font-light text-gray-900 mb-6">
              Administra tus productos
              <br />
              en múltiples plataformas
            </h1>

            <p className="text-gray-600 mb-8">
              Gestiona fácilmente el catálogo de productos en tu tienda de
              dropshipping.
              <br />
              Sincroniza inventarios, evita errores manuales y mantén todo bajo
              control.
              <br />
              Optimiza tu tiempo y escala tu negocio con herramientas
              inteligentes.
            </p>

            <button className="bg-gray-700 text-white px-7 py-4 rounded-lg hover:bg-gray-800">
              Empezar
            </button>
          </div>

          {/* Right Column */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative w-full sm:w-[350px] h-[auto] sm:h-[450px] bg-emerald-800/10 rounded-2xl overflow-hidden mt-72">
              <Image
                src="https://images.unsplash.com/photo-1735040736883-9e0bc7e6f1ba?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Person using phone"
                fill
                className="object-cover"
              />
            </div>

            {/* Top Floating Card - Sync Contacts */}

            <div
              className="absolute top-8 left-0 sm:left-[-32px] rounded-xl w-full sm:w-[300px] h-auto hidden sm:block"
              style={{ borderRadius: "25px" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1736147066581-95fa303553a0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="S"
                width={300}
                height={150}
                className="object-cover rounded-2xl"
              />
            </div>

            <div
              className="absolute -top-20 bg-white rounded-xl shadow-lg p-4 w-70 h-35 hidden sm:block"
              style={{ borderRadius: "25px", left: "-100px" }}
            >
              <h3 className="text-sm font-medium mb-4">Varias plataformas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/imgs/landing/Paypal.webp"
                      alt="PayPal"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span>PayPal</span>
                  </div>
                  <div className="w-11 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/imgs/landing/Amazon.webp"
                      alt="Amazon"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span>Amazon</span>
                  </div>
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/imgs/landing/Aliexpress.webp"
                      alt="AliexExpress"
                      width={24}
                      height={24}
                      className="rounded"
                    />
                    <span>AliExpress</span>
                  </div>
                  <div className="w-11 h-6 bg-green-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating Card - Contacts */}
            <div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white shadow-lg p-4 w-64"
              style={{ borderRadius: "25px" }}
            >
              <h3 className="text-lg font-medium mb-4">Desarrolladores</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/imgs/landing/jaider.webp"
                      alt="Jaider Ramirez"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">Jaider Ramirez</div>
                    <div className="text-xs text-gray-500">
                      Activo hace 6 días
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/imgs/landing/steven.webp"
                      alt="Steven Jaime"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">Steven Jaime</div>
                    <div className="text-xs text-gray-500">Activo ahora</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/imgs/landing/alejo.webp"
                      alt="Alejandro Amador"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">Alejandro Amador</div>
                    <div className="text-xs text-gray-500">
                      Activo hace 3 días
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="absolute top-[-80px] right-[-5px] flex flex-col items-start space-y-2 sm:top-8 sm:right-36">
              <div className="text-left">
                <div className="text-4xl">20+</div>
                <div className="text-sm text-gray-500">Integraciones</div>
              </div>
              <div className="text-left">
                <div className="text-4xl">30+</div>
                <div className="text-sm text-gray-500">Funciones previstas</div>
              </div>
            </div>

            {/* Success Badge */}
            <div className="absolute bottom-72 right-20 hidden sm:block">
              <div className="bg-orange-400 text-white px-3 py-1 mr-5 rounded-full text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Sincronización completa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-32">
        <div id="caracteristicas">
          <PurchaseHistoryDemo />
        </div>
        <div>
          <PlatformCompatibility />
        </div>
        <div id="acerca-de">
          <Personalization />
        </div>
        <div id="blog">
          <BentoDemo />
        </div>
        <div id="contacto">
          <StepGuide />
        </div>
        <div id="precios">
          <Waitlist />
        </div>
        <Footer />
      </div>
    </>
  );
};
