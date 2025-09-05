'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useIsClient } from '@/hooks/ui/useIsClient';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { MetricCard, DistributionCard, ConversionCard } from '@/app/store/components/statistics/components/MetricCards';

// Data generation utilities
const generateDailyData = (days = 30, baseValue = 1000, variance = 200) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));

    return {
      date: format(date, 'MMM dd'),
      value: Math.max(0, baseValue + Math.random() * variance * 2 - variance),
      previousValue: Math.max(0, baseValue * 0.9 + Math.random() * variance * 2 - variance),
    };
  });
};

export function SalesDashboard() {
  const isClient = useIsClient();

  // State management
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });
  const [compareWith, setCompareWith] = useState('yesterday');
  const [timeframe, setTimeframe] = useState('daily');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Generate sample data
  const salesData = generateDailyData(30, 5000, 1000);
  const ordersData = generateDailyData(30, 120, 30);
  const aovData = generateDailyData(30, 42, 8);
  const sessionsData = generateDailyData(30, 500, 100);

  const channelData = [
    { name: 'Direct', value: 4000 },
    { name: 'Organic Search', value: 3000 },
    { name: 'Paid Search', value: 2000 },
    { name: 'Social', value: 1500 },
    { name: 'Email', value: 1000 },
    { name: 'Referral', value: 500 },
  ];

  const conversionData = [
    { stage: 'Added to Cart', sessions: 320, rate: 64 },
    { stage: 'Reached Checkout', sessions: 240, rate: 48 },
    { stage: 'Completed Purchase', sessions: 120, rate: 24 },
  ];

  // Calculate totals
  const totalRevenue = salesData.reduce((sum, item) => sum + item.value, 0).toFixed(2);
  const totalOrders = ordersData.reduce((sum, item) => sum + item.value, 0).toFixed(0);
  const averageOrderValue = (Number(totalRevenue) / Number(totalOrders)).toFixed(2);
  const totalSessions = sessionsData.reduce((sum, item) => sum + item.value, 0).toFixed(0);
  const conversionRate = ((Number(totalOrders) / Number(totalSessions)) * 100).toFixed(2);

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    return 'Select date range';
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-medium text-gray-800">Informes y Estadísticas</h1>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <span className="mr-2">Pantalla completa</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-maximize-2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="bg-background">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Hoy
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={compareWith} onValueChange={setCompareWith}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Compare with" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yesterday">Comparar con: ayer</SelectItem>
                <SelectItem value="lastWeek">Comparar con: la semana pasada</SelectItem>
                <SelectItem value="lastMonth">Comparar con: El mes pasado</SelectItem>
                <SelectItem value="lastYear">Comparar con: El año pasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRefresh"
                checked={autoRefresh}
                onCheckedChange={(checked: boolean) => setAutoRefresh(checked)}
              />
              <label
                htmlFor="autoRefresh"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Actualización automática
              </label>
            </div>
          </div>
        </div>

        {/* Tabs and Metrics Grid */}
        <Tabs defaultValue="daily" className="w-full" onValueChange={setTimeframe}>
          <TabsList className="mb-4">
            <TabsTrigger value="daily">A diario</TabsTrigger>
            <TabsTrigger value="weekly">Semanalmente</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Revenue */}
            <MetricCard
              title="Ingresos totales"
              value={totalRevenue}
              data={salesData}
              color="#0088FE"
              valueFormatter={(value) => `$${value.toFixed(2)}`}
              metricName="Ganancia"
              prefix="$"
            />

            {/* Sales by Channel */}
            <DistributionCard title="Ventas por canal" data={channelData} />

            {/* Online Store Sessions */}
            <MetricCard
              title="Sesiones de tienda online"
              value={totalSessions}
              data={sessionsData}
              color="#00C49F"
              valueFormatter={(value) => value.toFixed(0)}
              metricName="Sesiones"
            />

            {/* Conversion Rate */}
            <ConversionCard
              title="Tasa de conversión de la tienda en línea"
              rate={parseFloat(conversionRate)}
              conversionData={conversionData}
            />

            {/* Total Orders */}
            <MetricCard
              title="Órdenes totales"
              value={totalOrders}
              data={ordersData}
              color="#FFBB28"
              valueFormatter={(value) => value.toFixed(0)}
              metricName="Órdenes"
            />

            {/* Average Order Value */}
            <MetricCard
              title="Valor promedio del pedido"
              value={averageOrderValue}
              data={aovData}
              color="#FF8042"
              valueFormatter={(value) => `$${value.toFixed(2)}`}
              metricName="AOV"
              prefix="$"
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
