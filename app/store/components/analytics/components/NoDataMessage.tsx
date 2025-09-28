import { Text } from '@shopify/polaris';

interface NoDataMessageProps {
  data?: any[] | null;
  message?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function NoDataMessage({
  data,
  message = 'No hay datos para este rango de fechas',
  children,
  style,
}: NoDataMessageProps) {
  const hasData = data && data.length > 0;

  if (hasData) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}>
      <Text variant="bodySm" tone="subdued" as="p">
        {message}
      </Text>
    </div>
  );
}
