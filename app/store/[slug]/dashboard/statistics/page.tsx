'use client';

import { SalesDashboard } from '@/app/store/components/statistics/components/SalesDashboard';
import { configureAmplify } from '@/lib/amplify-config';

configureAmplify();

export default function GeneralStatistics() {
  return <SalesDashboard />;
}
