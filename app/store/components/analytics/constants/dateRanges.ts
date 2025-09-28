import { DateRangeOption, ComparisonOption } from '@/app/store/components/analytics/types';

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    title: 'Hoy',
    alias: 'today',
    period: {
      since: new Date(new Date().setHours(0, 0, 0, 0)),
      until: new Date(new Date().setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Ayer',
    alias: 'yesterday',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Últimos 7 días',
    alias: 'last7days',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Últimos 30 días',
    alias: 'last30days',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 30)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Últimos 90 días',
    alias: 'last90days',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 90)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Últimos 365 días',
    alias: 'last365days',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 365)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Últimos 12 meses',
    alias: 'last12months',
    period: {
      since: new Date(new Date(new Date().setMonth(new Date().getMonth() - 12)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Última semana',
    alias: 'lastweek',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Último mes',
    alias: 'lastmonth',
    period: {
      since: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0, 0)),
    },
  },
];

export const COMPARISON_OPTIONS: ComparisonOption[] = [
  {
    title: 'Sin comparación',
    alias: 'none',
  },
  {
    title: 'Ayer',
    alias: 'yesterday',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Semana anterior',
    alias: 'previousweek',
    period: {
      since: new Date(new Date(new Date().setDate(new Date().getDate() - 14)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setDate(new Date().getDate() - 8)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Mes anterior',
    alias: 'previousmonth',
    period: {
      since: new Date(new Date(new Date().setMonth(new Date().getMonth() - 2)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Trimestre anterior',
    alias: 'previousquarter',
    period: {
      since: new Date(new Date(new Date().setMonth(new Date().getMonth() - 6)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setMonth(new Date().getMonth() - 3)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Año anterior',
    alias: 'previousyear',
    period: {
      since: new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 2)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Año anterior (mismo día de la semana)',
    alias: 'previousyearmatchday',
    period: {
      since: new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0, 0, 0, 0)),
      until: new Date(new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setHours(0, 0, 0, 0)),
    },
  },
  {
    title: 'Black Friday Cyber Monday',
    alias: 'bfcm',
    period: {
      since: new Date(new Date(new Date().setMonth(10, 24)).setHours(0, 0, 0, 0)), // Nov 24
      until: new Date(new Date(new Date().setMonth(10, 30)).setHours(0, 0, 0, 0)), // Nov 30
    },
  },
];
