'use client';

import { BlockStack, Box, Button, Card, Divider, List, Text } from '@shopify/polaris';
import { useLayoutEffect, useRef } from 'react';
import type { Plan } from '@/app/store/components/select-plan/domain/plan';

interface Props {
  plan: Plan;
  loading?: boolean;
  onSubscribe: (plan: Plan) => void;
  contentMinHeight?: number;
  onMeasure?: (height: number) => void;
}

export default function PlanCard({ plan, onSubscribe, loading, contentMinHeight = 0, onMeasure }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const height = contentRef.current.offsetHeight;
    if (onMeasure) onMeasure(height);
  }, [plan, onMeasure]);

  return (
    <Card>
      <Box padding="400">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div ref={contentRef} style={{ minHeight: contentMinHeight }}>
            <BlockStack gap="300">
              <BlockStack gap="100">
                <Text variant="headingMd" as="h3">
                  {plan.name}
                </Text>
              </BlockStack>

              <Text variant="headingLg" as="p">
                {plan.title}
              </Text>
              <Text as="p" tone="subdued">
                {plan.description}
              </Text>

              <Divider />

              <List>
                {plan.features.map((feature) => (
                  <List.Item key={feature}>{feature}</List.Item>
                ))}
              </List>
            </BlockStack>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Button fullWidth variant="primary" loading={loading} onClick={() => onSubscribe(plan)}>
              {plan.buttonText}
            </Button>
          </div>
        </div>
      </Box>
    </Card>
  );
}
