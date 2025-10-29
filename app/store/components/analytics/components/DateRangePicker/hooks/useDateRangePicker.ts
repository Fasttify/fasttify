import { useState, useRef, useEffect } from 'react';
import { DateRangeOption } from '@/app/store/components/analytics/types';
import { DATE_RANGE_OPTIONS } from '@/app/store/components/analytics/constants/dateRanges';
import {
  isValidDate,
  parseYearMonthDayDateString,
  formatDate,
  nodeContainsDescendant,
} from '@/app/store/components/analytics/utils/dateUtils';

interface UseDateRangePickerProps {
  selectedRange: DateRangeOption;
  onRangeChange: (range: DateRangeOption) => void;
}

export function useDateRangePicker({ selectedRange, onRangeChange }: UseDateRangePickerProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [tempRange, setTempRange] = useState<DateRangeOption>(selectedRange);
  const [inputValues, setInputValues] = useState({
    since: formatDate(selectedRange.period.since),
    until: formatDate(selectedRange.period.until),
  });
  const [{ month, year }, setDate] = useState({
    month: selectedRange.period.since.getMonth(),
    year: selectedRange.period.since.getFullYear(),
  });

  const popoverContentRef = useRef<HTMLDivElement>(null);

  function isNodeWithinPopover(node: Node | null): boolean {
    return popoverContentRef?.current ? nodeContainsDescendant(popoverContentRef.current, node) : false;
  }

  function handleStartInputValueChange(value: string) {
    setInputValues((prevState) => ({
      ...prevState,
      since: value,
    }));

    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      const newPeriod =
        tempRange.period && newSince <= tempRange.period.until
          ? { since: newSince, until: tempRange.period.until }
          : { since: newSince, until: newSince };

      const newRange: DateRangeOption = {
        ...tempRange,
        period: newPeriod,
      };
      setTempRange(newRange);
    }
  }

  function handleEndInputValueChange(value: string) {
    setInputValues((prevState) => ({
      ...prevState,
      until: value,
    }));

    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      const newPeriod =
        tempRange.period && newUntil >= tempRange.period.since
          ? { since: tempRange.period.since, until: newUntil }
          : { since: newUntil, until: newUntil };

      const newRange: DateRangeOption = {
        ...tempRange,
        period: newPeriod,
      };
      setTempRange(newRange);
    }
  }

  function handleInputBlur(event: React.FocusEvent<HTMLInputElement>) {
    const relatedTarget = event.relatedTarget as Node | null;
    const isRelatedTargetWithinPopover = relatedTarget != null && isNodeWithinPopover(relatedTarget);

    if (isRelatedTargetWithinPopover) {
      return;
    }

    // Agregar un pequeño delay para permitir que el foco se establezca correctamente
    setTimeout(() => {
      const activeElement = document.activeElement as Node | null;
      const isActiveElementWithinPopover = activeElement != null && isNodeWithinPopover(activeElement);

      if (!isActiveElementWithinPopover) {
        setPopoverActive(false);
      }
    }, 0);
  }

  function handleMonthChange(month: number, year: number) {
    setDate({ month, year });
  }

  function handleCalendarChange({ start, end }: { start: Date; end: Date }) {
    const newDateRange = DATE_RANGE_OPTIONS.find((range) => {
      return range.period.since.valueOf() === start.valueOf() && range.period.until.valueOf() === end.valueOf();
    }) || {
      alias: 'custom',
      title: 'Personalizado',
      period: {
        since: start,
        until: end,
      },
    };

    setTempRange(newDateRange);
    setInputValues({
      since: formatDate(start),
      until: formatDate(end),
    });
  }

  function handleOptionSelect(value: string[]) {
    const selected = DATE_RANGE_OPTIONS.find((range) => range.alias === value[0]);
    if (selected) {
      setTempRange(selected);
      setInputValues({
        since: formatDate(selected.period.since),
        until: formatDate(selected.period.until),
      });
    }
  }

  function handleSelectChange(value: string) {
    const result = DATE_RANGE_OPTIONS.find(({ title, alias }) => title === value || alias === value);
    if (result) {
      setTempRange(result);
      setInputValues({
        since: formatDate(result.period.since),
        until: formatDate(result.period.until),
      });
    }
  }

  function apply() {
    onRangeChange(tempRange);
    setPopoverActive(false);
  }

  function cancel() {
    setTempRange(selectedRange);
    setInputValues({
      since: formatDate(selectedRange.period.since),
      until: formatDate(selectedRange.period.until),
    });
    setPopoverActive(false);
  }

  function togglePopover() {
    setPopoverActive(!popoverActive);
  }

  function closePopover() {
    setPopoverActive(false);
  }

  // Sincronizar con cambios externos
  useEffect(() => {
    if (selectedRange) {
      requestAnimationFrame(() => {
        setTempRange(selectedRange);
        setInputValues({
          since: formatDate(selectedRange.period.since),
          until: formatDate(selectedRange.period.until),
        });

        function monthDiff(referenceDate: { year: number; month: number }, newDate: { year: number; month: number }) {
          return newDate.month - referenceDate.month + 12 * (referenceDate.year - newDate.year);
        }

        const monthDifference = monthDiff(
          { year, month },
          {
            year: selectedRange.period.until.getFullYear(),
            month: selectedRange.period.until.getMonth(),
          }
        );

        if (monthDifference > 1 || monthDifference < 0) {
          setDate({
            month: selectedRange.period.until.getMonth(),
            year: selectedRange.period.until.getFullYear(),
          });
        }
      });
    }
  }, [selectedRange, year, month]);

  return {
    // State
    popoverActive,
    tempRange,
    inputValues,
    month,
    year,
    popoverContentRef,

    // Handlers
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
  };
}
