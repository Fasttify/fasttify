'use client';

/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Button, Card, Text, BlockStack } from '@shopify/polaris';
import { ExitIcon } from '@shopify/polaris-icons';
import { AnimatedBackground } from '@/app/(setup)/my-store/components/AnimatedBackground';
import { useCheckoutPayment } from './hooks/useCheckoutPayment';

interface CheckoutModalProps {
  open: boolean;
  onClose?: () => void;
}

/**
 * Modal bloqueante de checkout basado en el diseño de Polar.sh
 * Este modal no se puede cerrar y bloquea toda navegación hasta completar el pago
 */
export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { isSubmitting, handlePayment } = useCheckoutPayment();

  if (!open) {
    return null;
  }

  const benefits = [
    'Asesoría por chat, email y WhatsApp',
    'Hosting y SSL gratuitos',
    'Panel de estadísticas avanzadas',
    'Soporte prioritario 24/7',
    'Integraciones con redes sociales',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header con botón de logout */}
        <div className="absolute top-4 right-4 z-10">
          <Button variant="tertiary" size="slim" icon={ExitIcon} onClick={onClose} accessibilityLabel="Cerrar sesión">
            Cerrar sesión
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Panel izquierdo - Información del plan */}
          <div className="relative p-8 text-white flex flex-col justify-between overflow-hidden">
            {/* Animated Background */}
            <AnimatedBackground
              minWidth="1024px"
              backgroundColor="rgba(40, 40, 40, 1)"
              shapeColor1="rgba(255, 123, 142, 1)"
              shapeColor2="rgba(123, 255, 142, 1)"
              isModal={true}
            />
            {/* Contenido */}
            <div className="relative z-10">
              <div>
                <Text variant="headingXl" as="h1">
                  Vuelve al negocio por $55.000 COP/mes
                </Text>

                <div className="mt-8 space-y-6">
                  <div>
                    <Text variant="bodyMd" as="p">
                      Plan gratuito expirado
                    </Text>
                    <Text variant="bodySm" as="p">
                      ¡Buenas noticias - guardamos tu progreso!
                    </Text>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">
                      Hoy - $55.000 COP/mes
                    </Text>
                    <Text variant="bodySm" as="p">
                      Eso es acceso completo a todas las funciones
                    </Text>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">
                      Siempre - Sin compromiso, cancela cuando quieras
                    </Text>
                  </div>
                </div>

                {/* Beneficios del plan */}
                <div className="mt-8">
                  <Text variant="headingMd" as="h2">
                    Con tu plan obtienes:
                  </Text>
                  <div className="mt-4 space-y-3">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Text variant="bodyMd" as="p">
                          {benefit}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-36 flex justify-between">
                <button
                  className="bg-transparent border-none text-white px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => console.log('Ver todos los planes')}>
                  Ver todos los planes
                </button>
                <button
                  className="bg-transparent text-white px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => console.log('Ver detalles de la tienda')}>
                  Ver detalles de la tienda
                </button>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de pago */}
          <div className="p-8 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <BlockStack gap="600">
                <div>
                  <Text variant="headingMd" as="h2">
                    Resumen del plan
                  </Text>

                  <div className="mt-4">
                    <Card>
                      <div className="p-6">
                        <BlockStack gap="400">
                          <div>
                            <Text variant="headingMd" as="h3">
                              Plan Royal
                            </Text>
                            <Text variant="bodyMd" as="p" tone="subdued">
                              Acceso completo a todas las funciones
                            </Text>
                          </div>

                          <div>
                            <Text variant="headingLg" as="p">
                              $55.000 COP/mes
                            </Text>
                            <Text variant="bodySm" as="p" tone="subdued">
                              Facturación mensual
                            </Text>
                          </div>
                        </BlockStack>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Botón de suscripción */}
                <Button
                  size="large"
                  variant="primary"
                  fullWidth
                  onClick={handlePayment}
                  loading={isSubmitting}
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Continuar al pago'}
                </Button>

                <Text variant="bodySm" as="p" tone="subdued" alignment="center">
                  Más impuestos aplicables. Se renueva mensualmente en plan Royal $55.000/mes
                </Text>
              </BlockStack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
