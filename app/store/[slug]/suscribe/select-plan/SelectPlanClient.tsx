'use client';

import { useMemo, useState } from 'react';
import { BlockStack, Box, Button, Card, InlineStack, Layout, Page, Text, Collapsible } from '@shopify/polaris';
import { Icon } from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import { plans, planFaqs } from '@/app/(www)/pricing/components/plans';
import type { Plan } from '@/app/store/components/select-plan/domain/plan';
import { usePlanCheckout } from '@/app/store/components/select-plan/application/usePlanCheckout';
import PlanCard from './components/PlanCard';
import { motion, useReducedMotion } from 'framer-motion';
import { routes } from '@/utils/client/routes';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname, useRouter } from 'next/navigation';

export default function SelectPlanClient() {
  const { isSubmitting, subscribe } = usePlanCheckout();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const storeId = getStoreId(params, pathname);

  const typedPlans: Plan[] = useMemo(() => plans as unknown as Plan[], []);
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});
  const [contentMinHeight, setContentMinHeight] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();

  const handleMeasure = (height: number) => {
    setContentMinHeight((prev) => (height > prev ? height : prev));
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { y: 120, opacity: 0 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.2, ease: 'easeOut' }
          : { type: 'spring', stiffness: 180, damping: 24, mass: 0.9 }
      }
      style={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: '0 -12px 40px rgba(0,0,0,0.08)',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}>
      <Page>
        <BlockStack gap="600">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="200">
              <Text variant="headingLg" as="h1">
                Elige el plan para tu tienda
              </Text>
            </BlockStack>
          </InlineStack>

          <div>
            <Box padding="400">
              <BlockStack gap="300">
                <InlineStack align="center">
                  <Text variant="headingMd" as="h2">
                    Todo lo que necesitas para gestionar tu negocio
                  </Text>
                </InlineStack>
                <InlineStack align="center" gap="600" wrap>
                  {[
                    'Venta multicanal: web, móvil y redes sociales',
                    'Soporte 24/7 por chat',
                    'Integraciones y API para conectar servicios',
                  ].map((item) => (
                    <InlineStack key={item} gap="200" blockAlign="center">
                      <Icon source={CheckIcon} tone="success" />
                      <Text as="span" tone="subdued">
                        {item}
                      </Text>
                    </InlineStack>
                  ))}
                </InlineStack>
              </BlockStack>
            </Box>
          </div>

          <Layout>
            {typedPlans.map((plan) => (
              <Layout.Section key={plan.name} variant="oneThird">
                <PlanCard
                  plan={plan}
                  onSubscribe={subscribe}
                  loading={isSubmitting}
                  contentMinHeight={contentMinHeight}
                  onMeasure={handleMeasure}
                />
              </Layout.Section>
            ))}
          </Layout>

          <Card>
            <Box padding="400">
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Preguntas frecuentes
                </Text>

                <div>
                  {planFaqs.map((faq, index) => (
                    <div key={faq.question} style={{ borderTop: '1px solid var(--p-color-border)', padding: '12px 0' }}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                        }}>
                        <Text as="p">{faq.question}</Text>
                        <Text as="p" tone="subdued">
                          {openFaqs[index] ? '−' : '+'}
                        </Text>
                      </button>
                      <Collapsible
                        open={Boolean(openFaqs[index])}
                        id={`faq-${index}`}
                        transition={{ duration: '200ms', timingFunction: 'ease' }}>
                        <div style={{ paddingTop: '8px' }}>
                          {faq.paragraphs?.map((p) => (
                            <Text as="p" tone="subdued" key={p}>
                              {p}
                            </Text>
                          ))}
                          {faq.bullets && faq.bullets.length > 0 && (
                            <ul style={{ paddingLeft: '1.25rem', marginTop: '8px' }}>
                              {faq.bullets.map((b) => (
                                <li key={b}>
                                  <Text as="span" tone="subdued">
                                    {b}
                                  </Text>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </Collapsible>
                    </div>
                  ))}
                </div>
              </BlockStack>
            </Box>
          </Card>

          <InlineStack align="center">
            <Button variant="tertiary" onClick={() => router.push(routes.store.dashboard.main(storeId))}>
              Volver a la tienda
            </Button>
          </InlineStack>
        </BlockStack>
      </Page>
    </motion.div>
  );
}
