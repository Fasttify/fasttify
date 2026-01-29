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
import { useCheckoutPayment } from './hooks/useCheckoutPayment';

interface CheckoutModalMobileProps {
  open: boolean;
  onClose?: () => void;
}

/**
 * Modal móvil de checkout optimizado para pantallas pequeñas
 */
export function CheckoutModalMobile({ open, onClose }: CheckoutModalMobileProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal móvil */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Panel superior - Información del plan */}
        <div className="relative p-6 text-white overflow-hidden">
          {/* Fondo personalizado para móvil */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 20, 1) 0%, rgba(40, 40, 40, 1) 100%)',
              animation: 'fadeCards 2s ease-out',
            }}
          />

          <div className="relative z-10">
            <Text variant="headingLg" as="h1">
              Vuelve al negocio por $55.000 COP/mes
            </Text>

            <div className="mt-6 space-y-4">
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
            <div className="mt-6">
              <Text variant="headingSm" as="h2">
                Con tu plan obtienes:
              </Text>
              <div className="mt-3 space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Text variant="bodySm" as="p">
                      {benefit}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button className="bg-transparent border-none text-white px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer text-left">
                Ver todos los planes
              </button>
              <button className="bg-transparent text-white px-4 py-2 hover:bg-white/10 transition-colors cursor-pointer text-left">
                Ver detalles de la tienda
              </button>
            </div>
          </div>
        </div>

        {/* Panel inferior - Formulario de pago */}
        <div className="p-6 bg-white relative">
          {/* Botón de logout en la parte blanca */}
          <div className="absolute top-3 right-3">
            <Button variant="tertiary" size="slim" icon={ExitIcon} onClick={onClose} accessibilityLabel="Cerrar sesión">
              Cerrar sesión
            </Button>
          </div>

          <div className="max-w-md mx-auto w-full pt-12">
            <BlockStack gap="500">
              <div>
                <Text variant="headingMd" as="h2">
                  Resumen del plan
                </Text>

                <div className="mt-4">
                  <Card>
                    <div className="p-4">
                      <BlockStack gap="300">
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
  );
}
