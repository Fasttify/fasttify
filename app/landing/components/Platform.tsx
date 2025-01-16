import React from "react";
import Iphone15Pro from "@/components/ui/iphone-15-pro";
import { Card, CardContent } from "@/components/ui/card";
import { Laptop, Smartphone, Tablet } from "lucide-react";

const deviceFeatures = [
  {
    icon: Smartphone,
    title: "Smartphones",
    description:
      "Accede a nuestra plataforma desde cualquier lugar con tu teléfono móvil.",
    features: [
      "Interfaz optimizada para pantallas pequeñas",
      "Notificaciones push para mantenerte actualizado",
      "Modo offline para acceso sin conexión",
      "Gestos intuitivos para una navegación fluida",
    ],
  },
  {
    icon: Tablet,
    title: "Tablets",
    description: "Disfruta de una experiencia inmersiva en tu tablet.",
    features: [
      "Diseño adaptativo para aprovechar pantallas más grandes",
      "Soporte para lápiz digital en modelos compatibles",
      "Modo de pantalla dividida para multitarea",
      "Visualización mejorada de gráficos y datos",
    ],
  },
  {
    icon: Laptop,
    title: "Computadoras de Escritorio",
    description: "Aprovecha al máximo nuestra plataforma en tu computadora.",
    features: [
      "Interfaz completa con todas las funcionalidades",
      "Atajos de teclado para usuarios avanzados",
      "Soporte para múltiples monitores",
      "Herramientas de análisis avanzadas",
    ],
  },
];

export function PlatformCompatibility() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-8 p-6  ">
      <Card className="flex-1 w-full lg:w-2/3 border bg-background shadow-xl">
        <CardContent className="p-6 sm:p-10">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-center mb-8 md:mb-16">
                Compatible con múltiples dispositivos
              </h1>
              <p className="text-lg text-muted-foreground">
                Nuestra plataforma está diseñada para funcionar perfectamente en
                una amplia gama de dispositivos, desde smartphones hasta tablets
                y computadoras de escritorio. Disfruta de una experiencia fluida
                y consistente, sin importar cómo accedas a nuestra aplicación.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {deviceFeatures.map((device, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <device.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{device.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{device.description}</p>
                  <ul className="space-y-2">
                    {device.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="mr-2 mt-1 text-primary">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                Sincronización perfecta
              </h3>
              <p className="text-lg text-muted-foreground">
                Nuestra tecnología de sincronización en tiempo real asegura que
                tu trabajo esté siempre actualizado en todos tus dispositivos.
                Comienza un proyecto en tu computadora de escritorio, haz
                ajustes en tu tablet durante el almuerzo, y finaliza los
                detalles desde tu smartphone en el camino a casa. Tu progreso se
                mantiene consistente y accesible sin importar dónde te
                encuentres.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-shrink-0 w-full lg:w-1/3 flex justify-center lg:justify-end">
        <Iphone15Pro
          className="size-full"
          videoSrc="https://videos.pexels.com/video-files/8946986/8946986-uhd_1440_2732_25fps.mp4"
        />
      </div>
    </div>
  );
}
