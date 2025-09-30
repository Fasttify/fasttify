'use client';

import { InlineGrid, BlockStack, Card, Text, Box, InlineStack, Tooltip, Icon } from '@shopify/polaris';
import { InfoIcon } from '@shopify/polaris-icons';
import {
  AnalyticsHeader,
  useAnalyticsHeader,
  GrossSalesCard,
  ReturningCustomerRateCard,
  OrdersFulfilledCard,
  OrdersCard,
  TotalSalesBreakdownCard,
  TotalSalesChartCard,
  TotalSalesBySalesChannelCard,
  AverageOrderValueCard,
  TotalSalesByProductCard,
  SessionsOverTimeCard,
  ConversionRateOverTimeCard,
  ConversionRateBreakdownCard,
  UniqueVisitorsCard,
  DeviceMetricsCard,
  CountryMetricsCard,
  BrowserMetricsCard,
  TrafficSourceCard,
  InventoryAlertsCard,
  AnalyticsSkeleton,
} from '@/app/store/components/analytics';
import {
  useStoreAnalytics,
  calculateAggregatedMetrics,
  useAnalyticsDataProcessing,
} from '@/app/store/hooks/data/useStoreAnalytics';
import { useAnalyticsCurrencyFormatting } from '@/app/store/hooks/data/useStoreAnalytics/utils/useAnalyticsCurrencyFormatting';
import { useAnalyticsChartData } from '@/app/store/hooks/data/useStoreAnalytics/utils/useAnalyticsChartData';
import { AnalyticsCurrencyProvider } from '@/app/store/components/analytics/context/AnalyticsCurrencyContext';
import { getStoreId } from '@/utils/client/store-utils';
import { useParams, usePathname } from 'next/navigation';

function AnalyticsPageContent() {
  const analyticsHeaderProps = useAnalyticsHeader();
  const params = useParams();
  const pathname = usePathname();
  const storeId = getStoreId(params, pathname);

  const startDate = analyticsHeaderProps.selectedDateRange.period.since.toISOString().split('T')[0];
  const endDate = analyticsHeaderProps.selectedDateRange.period.until.toISOString().split('T')[0];

  const {
    analytics,
    dailyAnalytics: _dailyAnalytics,
    loading,
    error,
    getAnalyticsByDateRange: _getAnalyticsByDateRange,
    getAnalyticsByPeriod: _getAnalyticsByPeriod,
  } = useStoreAnalytics(storeId, {
    filterOptions: {
      period: 'daily',
      startDate,
      endDate,
    },
  });

  // Calcular métricas agregadas
  const aggregatedMetrics = calculateAggregatedMetrics(analytics || []);

  // Hook de formateo con moneda de analíticas (puede ser diferente a la de la tienda)
  const { formatPercentage, formatNumber, formatAverageOrderValue, formatRevenue, formatConversionRate } =
    useAnalyticsCurrencyFormatting();

  // Procesar todos los datos usando el hook centralizado
  const { deviceData, countryData, browserData, referrerData, breakdownItems, conversionSteps } =
    useAnalyticsDataProcessing(analytics, aggregatedMetrics);

  // Generar datos de gráficos basados en datos reales
  const {
    revenueChartData,
    ordersChartData,
    visitorsChartData,
    conversionChartData,
    aovChartData,
    sessionsChartData,
    conversionRateChartData,
  } = useAnalyticsChartData(analytics);

  // Mostrar loading state
  if (loading) {
    return (
      <BlockStack gap="500">
        <AnalyticsHeader {...analyticsHeaderProps} loading={loading} />
        <AnalyticsSkeleton />
      </BlockStack>
    );
  }

  // Mostrar error state
  if (error) {
    return (
      <BlockStack gap="500">
        <AnalyticsHeader {...analyticsHeaderProps} loading={loading} />
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3" tone="critical">
              Error al cargar analíticas
            </Text>
            <Text variant="bodyMd" as="p">
              {error.message}
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  }

  return (
    <BlockStack gap="500">
      <AnalyticsHeader {...analyticsHeaderProps} loading={loading} />

      {loading && (
        <Box paddingInline="400">
          <Text variant="bodySm" tone="subdued" as="p">
            Actualizando datos para el período: {startDate} - {endDate}
          </Text>
        </Box>
      )}

      <BlockStack gap="400">
        {/* Cards de métricas principales */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <GrossSalesCard value={formatRevenue(aggregatedMetrics.totalRevenue)} data={revenueChartData} />
          <ReturningCustomerRateCard
            value={formatPercentage(aggregatedMetrics.returningCustomerRate)}
            data={conversionChartData}
          />
          <UniqueVisitorsCard value={formatNumber(aggregatedMetrics.uniqueVisitors)} data={visitorsChartData} />
          <OrdersCard value={formatNumber(aggregatedMetrics.totalOrders)} data={ordersChartData} />
        </InlineGrid>

        {/* Cards de contenido principal */}
        <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
          <TotalSalesChartCard value={formatRevenue(aggregatedMetrics.totalRevenue)} data={revenueChartData} />
          <TotalSalesBreakdownCard items={breakdownItems} />
        </InlineGrid>

        {/* Primera fila inferior */}
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          <TotalSalesBySalesChannelCard />
          <AverageOrderValueCard
            value={formatAverageOrderValue(aggregatedMetrics.averageOrderValue)}
            data={aovChartData}
          />
          <TotalSalesByProductCard />
        </InlineGrid>

        {/* Segunda fila inferior */}
        <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
          <SessionsOverTimeCard value={formatNumber(aggregatedMetrics.totalSessions)} data={sessionsChartData} />
          <ConversionRateOverTimeCard
            value={formatConversionRate(aggregatedMetrics.conversionRate)}
            data={conversionRateChartData}
          />
          <ConversionRateBreakdownCard
            value={formatConversionRate(aggregatedMetrics.conversionRate)}
            steps={conversionSteps}
          />
        </InlineGrid>

        {/* Tercera fila - Métricas específicas */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          <DeviceMetricsCard deviceData={deviceData} />
          <OrdersFulfilledCard value={formatNumber(aggregatedMetrics.totalOrders)} />
          <Card>
            <Box padding="400">
              <InlineStack gap="100" blockAlign="center">
                <Text variant="headingXs" as="h3">
                  Productos vendidos
                </Text>
                <Tooltip
                  content={
                    <BlockStack gap="100">
                      <Text variant="bodyMd" as="p" fontWeight="bold">
                        Productos vendidos
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        Cantidad total de productos vendidos y número de productos únicos diferentes que se han vendido
                        en el período.
                      </Text>
                    </BlockStack>
                  }
                  dismissOnMouseOut>
                  <Icon source={InfoIcon} tone="subdued" />
                </Tooltip>
              </InlineStack>
              <Text variant="headingLg" as="p" tone="inherit">
                {formatNumber(aggregatedMetrics.totalProductsSold)}
              </Text>
              <Box paddingBlockStart="200">
                <Text variant="bodySm" as="p" tone="inherit">
                  {formatNumber(aggregatedMetrics.uniqueProductsSold)} productos únicos
                </Text>
              </Box>
            </Box>
          </Card>
        </InlineGrid>

        {/* Cuarta fila - Análisis de tráfico */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          <CountryMetricsCard countryData={countryData} />
          <BrowserMetricsCard browserData={browserData} />
          <TrafficSourceCard referrerData={referrerData} />
        </InlineGrid>

        {/* Quinta fila - Inventario */}
        <InlineGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="400">
          <InventoryAlertsCard
            lowStockAlerts={aggregatedMetrics.lowStockAlerts}
            outOfStockProducts={aggregatedMetrics.outOfStockProducts}
          />
        </InlineGrid>
      </BlockStack>
    </BlockStack>
  );
}

export function AnalyticsPage() {
  return (
    <AnalyticsCurrencyProvider>
      <AnalyticsPageContent />
    </AnalyticsCurrencyProvider>
  );
}
