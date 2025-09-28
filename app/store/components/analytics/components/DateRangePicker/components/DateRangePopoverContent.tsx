import {
  InlineGrid,
  Box,
  Scrollable,
  OptionList,
  TextField,
  Icon,
  InlineStack,
  BlockStack,
  DatePicker,
  Select,
} from '@shopify/polaris';
import { CalendarIcon, ArrowRightIcon } from '@shopify/polaris-icons';
import { DateRangeOption } from '@/app/store/components/analytics/types';
import { DATE_RANGE_OPTIONS } from '@/app/store/components/analytics/constants/dateRanges';

interface DateRangePopoverContentProps {
  selectedRange: DateRangeOption;
  tempRange: DateRangeOption;
  inputValues: { since: string; until: string };
  month: number;
  year: number;
  shouldShowMultiMonth: boolean;
  mdDown: boolean;
  popoverContentRef: React.RefObject<HTMLDivElement>;
  onStartInputChange: (value: string) => void;
  onEndInputChange: (value: string) => void;
  onInputBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onMonthChange: (month: number, year: number) => void;
  onCalendarChange: ({ start, end }: { start: Date; end: Date }) => void;
  onOptionSelect: (value: string[]) => void;
  onSelectChange: (value: string) => void;
}

export function DateRangePopoverContent({
  selectedRange,
  tempRange,
  inputValues,
  month,
  year,
  shouldShowMultiMonth,
  mdDown,
  popoverContentRef,
  onStartInputChange,
  onEndInputChange,
  onInputBlur,
  onMonthChange,
  onCalendarChange,
  onOptionSelect,
  onSelectChange,
}: DateRangePopoverContentProps) {
  return (
    <div ref={popoverContentRef}>
      <InlineGrid
        columns={{
          xs: '1fr',
          md: '1fr',
          lg: 'max-content max-content',
        }}
        gap="0">
        <Box
          maxWidth={mdDown ? '516px' : '212px'}
          width={mdDown ? '100%' : '212px'}
          padding={{ xs: '500', md: '0' }}
          paddingBlockEnd={{ xs: '100', md: '0' }}>
          {mdDown ? (
            <Select
              label="Rango de fechas"
              labelHidden
              onChange={onSelectChange}
              value={selectedRange?.title || selectedRange?.alias || ''}
              options={DATE_RANGE_OPTIONS.map(({ alias, title }) => title || alias)}
            />
          ) : (
            <Scrollable style={{ height: '334px' }}>
              <OptionList
                options={DATE_RANGE_OPTIONS.map((range) => ({
                  value: range.alias,
                  label: range.title,
                }))}
                selected={[selectedRange.alias]}
                onChange={onOptionSelect}
              />
            </Scrollable>
          )}
        </Box>
        <Box padding={{ xs: '500' }} maxWidth={mdDown ? '320px' : '516px'}>
          <BlockStack gap="400">
            <InlineStack gap="200">
              <div style={{ flexGrow: 1 }}>
                <TextField
                  role="combobox"
                  label="Desde"
                  labelHidden
                  prefix={<Icon source={CalendarIcon} />}
                  value={inputValues.since}
                  onChange={onStartInputChange}
                  onBlur={onInputBlur}
                  autoComplete="off"
                />
              </div>
              <Icon source={ArrowRightIcon} />
              <div style={{ flexGrow: 1 }}>
                <TextField
                  role="combobox"
                  label="Hasta"
                  labelHidden
                  prefix={<Icon source={CalendarIcon} />}
                  value={inputValues.until}
                  onChange={onEndInputChange}
                  onBlur={onInputBlur}
                  autoComplete="off"
                />
              </div>
            </InlineStack>
            <DatePicker
              month={month}
              year={year}
              selected={{
                start: tempRange.period.since,
                end: tempRange.period.until,
              }}
              onMonthChange={onMonthChange}
              onChange={onCalendarChange}
              multiMonth={shouldShowMultiMonth}
              allowRange
            />
          </BlockStack>
        </Box>
      </InlineGrid>
    </div>
  );
}
