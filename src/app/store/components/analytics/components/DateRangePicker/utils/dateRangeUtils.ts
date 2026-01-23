import { DateRangeOption } from '@/app/store/components/analytics/types';
import { formatDateForDisplay } from '@/app/store/components/analytics/utils/dateUtils';

export function getButtonText(selectedRange: DateRangeOption): string {
  return selectedRange.title === 'Personalizado'
    ? `${formatDateForDisplay(selectedRange.period.since)} - ${formatDateForDisplay(selectedRange.period.until)}`
    : selectedRange.title;
}
