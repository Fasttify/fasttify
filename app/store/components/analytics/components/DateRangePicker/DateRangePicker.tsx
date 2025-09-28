'use client';

import { Button, Popover } from '@shopify/polaris';
import { CalendarIcon } from '@shopify/polaris-icons';
import { DateRangeOption } from '@/app/store/components/analytics/types';
import { useDateRangePicker } from '@/app/store/components/analytics/components/DateRangePicker/hooks/useDateRangePicker';
import { DateRangePopoverContent } from '@/app/store/components/analytics/components/DateRangePicker/components/DateRangePopoverContent';
import { DateRangeActions } from '@/app/store/components/analytics/components/DateRangePicker/components/DateRangeActions';
import { getButtonText } from '@/app/store/components/analytics/components/DateRangePicker/utils/dateRangeUtils';

interface DateRangePickerProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
  useBreakpoints?: () => { mdDown: boolean; lgUp: boolean };
  loading?: boolean;
}

export function DateRangePicker({
  selectedRange,
  onRangeChange,
  useBreakpoints = () => ({ mdDown: false, lgUp: true }),
  loading = false,
}: DateRangePickerProps) {
  const { mdDown, lgUp } = useBreakpoints();
  const shouldShowMultiMonth = lgUp;

  const {
    popoverActive,
    tempRange,
    inputValues,
    month,
    year,
    popoverContentRef,
    handleStartInputValueChange,
    handleEndInputValueChange,
    handleInputBlur,
    handleMonthChange,
    handleCalendarChange,
    handleOptionSelect,
    handleSelectChange,
    apply,
    cancel,
    togglePopover,
    closePopover,
  } = useDateRangePicker({ selectedRange, onRangeChange });

  const buttonValue = getButtonText(selectedRange);

  return (
    <Popover
      active={popoverActive}
      autofocusTarget="none"
      preferredAlignment="left"
      preferredPosition="below"
      fluidContent
      sectioned={false}
      fullHeight
      activator={
        <Button size="slim" icon={CalendarIcon} onClick={togglePopover} disabled={loading}>
          {buttonValue}
        </Button>
      }
      onClose={closePopover}>
      <Popover.Pane fixed>
        <DateRangePopoverContent
          selectedRange={selectedRange}
          tempRange={tempRange}
          inputValues={inputValues}
          month={month}
          year={year}
          shouldShowMultiMonth={shouldShowMultiMonth}
          mdDown={mdDown}
          popoverContentRef={popoverContentRef}
          onStartInputChange={handleStartInputValueChange}
          onEndInputChange={handleEndInputValueChange}
          onInputBlur={handleInputBlur}
          onMonthChange={handleMonthChange}
          onCalendarChange={handleCalendarChange}
          onOptionSelect={handleOptionSelect}
          onSelectChange={handleSelectChange}
        />
      </Popover.Pane>
      <Popover.Pane fixed>
        <Popover.Section>
          <DateRangeActions loading={loading} onApply={apply} onCancel={cancel} />
        </Popover.Section>
      </Popover.Pane>
    </Popover>
  );
}
