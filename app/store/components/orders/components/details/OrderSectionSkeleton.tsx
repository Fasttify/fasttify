import { Card, SkeletonBodyText, SkeletonDisplayText, SkeletonPage } from '@shopify/polaris';

interface OrderSectionSkeletonProps {
  title?: string;
  lines?: number;
}

export function OrderSectionSkeleton({ title, lines = 3 }: OrderSectionSkeletonProps) {
  return (
    <Card>
      <div style={{ padding: '16px' }}>
        {title && (
          <div style={{ marginBottom: '16px' }}>
            <SkeletonDisplayText size="medium" />
          </div>
        )}
        <SkeletonBodyText lines={lines} />
      </div>
    </Card>
  );
}

export function OrderItemsSkeleton() {
  return (
    <Card>
      <div style={{ padding: '16px' }}>
        <SkeletonDisplayText size="medium" />
        <div style={{ marginTop: '16px' }}>
          <SkeletonBodyText lines={2} />
        </div>
        <div style={{ marginTop: '16px' }}>
          <SkeletonBodyText lines={2} />
        </div>
      </div>
    </Card>
  );
}
