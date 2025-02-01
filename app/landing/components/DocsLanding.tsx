"use client";

import { PurchaseHistoryDemo } from "./Notification";
import { PlatformCompatibility } from "./Platform";
import { Personalization } from "./Personalization";
import { BentoDemo } from "./Bento";
import { Footer } from "./Footer";
import { StepGuide } from "./StepGuide";
import { Navbar } from "./NavBar";
import { Waitlist } from "./Waitlis";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { Card } from "@/components/ui/card";
import { Star, Camera, RefreshCw } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import { TextReveal } from "@/components/ui/text-reveal";
import Link from "next/link";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1737233019359-625e96ec8694?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Cafe",
  },
  {
    url: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Business",
  },
  {
    url: "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Store",
  },
];

export const DocsLanding = () => {
  return (
    <>
      <Navbar />
      <br />

      <div className="max-w-7xl ">
        <h1 className="text-8xl font-light text- flex flex-col items-center text-center md:-translate-x-20">
          Fasttify studio
        </h1>
        <TextReveal text="Fasttify cambiará la forma en que creas tu tienda." />
      </div>

      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto mt-16">
          {/* Main Hero Card */}
          <Card className="relative p-8 bg-white rounded-3xl">
            <div className="space-y-8">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-6 bg-[#d5321c]" />
                <div className="w-3 h-6 bg-[#c42727]" />
                <span className="text-sm font-medium tracking-wide">
                  EMPIEZA AHORA — 23
                </span>
              </div>

              <h1
                className="text-[3.5rem] md:text-[4.5rem] font-black tracking-tight leading-none"
                style={{
                  fontFamily: "'Stencil Std', 'Arial Black', sans-serif",
                  WebkitTextStroke: "2px black",
                }}
              >
                DUEÑO DE
                <br />
                TU NEGOCIO,
                <br />
                POSEE TU FUTURO
              </h1>

              <div className="flex items-center justify-between">
                <Link href="/pricing">
                  <InteractiveHoverButton className="bg-black text-white px-8 py-4 rounded-full hover:bg-black/90 transition-colors text-sm font-medium tracking-wide">
                    COMIENZA TU NEGOCIO
                  </InteractiveHoverButton>
                </Link>
                <div className="flex items-center space-x-3 ml-4 sm:ml-8">
                  <div className="space-y-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-0.5 bg-black" />
                    ))}
                  </div>
                  <span className="text-xs tracking-wide leading-tight">
                    LA MEJOR
                    <br />
                    EXPERIENCIA
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Training Card with Swiper */}
          <Card className="relative overflow-hidden bg-[#D35F43] rounded-3xl h-[500px]">
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/20 backdrop-blur-sm p-2 rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <Swiper
              modules={[EffectFade, Autoplay]}
              effect="fade"
              speed={1500}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
              }}
              fadeEffect={{
                crossFade: true,
              }}
              loop={true}
              className="w-full h-full"
            >
              {carouselImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="absolute bottom-0 left-0 p-8 z-10">
              <h2 className="text-white text-3xl font-bold tracking-wide">
                VENDÉ EN TU
                <br />
                PROPIO TIEMPO
              </h2>
            </div>
          </Card>

          {/* Contact Card */}
          <Card className="relative p-8 bg-[#E8C7C3] rounded-3xl overflow-hidden h-[300px] group hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-6">
              <div className="relative w-20 h-20 sm:w-32 sm:h-32">
                <div
                  className="absolute -left-1.5 -top-1.5 sm:-left-3 sm:-top-3 w-full h-full 
        bg-yellow-400 rounded-xl sm:rounded-2xl transform -rotate-3 sm:-rotate-6 
        transition-transform group-hover:rotate-0"
                />
                <div className="relative z-10 w-full h-full rounded-lg sm:rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1634733988596-093e2a324c2f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Promotional Image"
                    fill
                    sizes="(max-width: 640px) 320px, 220px"
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-row items-center space-x-4">
                <span className="text-sm tracking-wide">SOPORTE 24/7</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm tracking-wide">
                    DE COLOMBIANOS PARA
                    <br />
                    COLOMBIANOS
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-start justify-between group/heading">
                <h2 className="text-3xl font-bold tracking-wide leading-tight max-w-[80%]">
                  CONQUISTA MÁS
                  <br />
                  LEVÁNTATE FUERTE
                </h2>
              </div>
            </div>
          </Card>

          {/* Features Card */}
          <Card className="p-8 bg-white rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div className="text-5xl font-bold">4.98</div>
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 tracking-wide">
                CALIFICADO POR USUARIOS COMO TÚ
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "ELECTRÓNICA",
                "MODA Y ROPA",
                "JUGUETES Y JUEGOS",
                "ACCESORIOS PARA CELULARES",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 bg-gray-100 rounded-full text-xs tracking-wide"
                >
                  {feature}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <div className="space-y-32">
        <br />
        <div>
          <StepGuide />
        </div>
        <div id="acerca-de">
          <Personalization />
        </div>
        <div id="caracteristicas">
          <PurchaseHistoryDemo />
        </div>
        <div id="multiplataforma">
          <PlatformCompatibility />
        </div>
        <div id="integraciones">
          <BentoDemo />
        </div>
        <div>
          <Waitlist />
        </div>
        <div id="contacto">
          <Footer />
        </div>
      </div>
    </>
  );
};
