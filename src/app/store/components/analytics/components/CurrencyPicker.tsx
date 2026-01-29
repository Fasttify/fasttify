'use client';

import { useState, useCallback } from 'react';
import { Button, Popover, InlineGrid, Box, Scrollable, OptionList, TextField } from '@shopify/polaris';
import { CurrencyConvertIcon } from '@shopify/polaris-icons';
import { Currency } from '@/app/store/components/analytics/types';

interface CurrencyPickerProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  availableCurrencies: Currency[];
}

export function CurrencyPicker({ selectedCurrency, onCurrencyChange, availableCurrencies }: CurrencyPickerProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(availableCurrencies);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (value === '') {
        setFilteredCurrencies(availableCurrencies);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const filtered = availableCurrencies.filter(
        (currency) =>
          currency.code.match(filterRegex) || currency.name.match(filterRegex) || currency.symbol.match(filterRegex)
      );
      setFilteredCurrencies(filtered);
    },
    [availableCurrencies]
  );

  function handleCurrencySelect(value: string[]) {
    const selected = filteredCurrencies.find((currency) => currency.code === value[0]);
    if (selected) {
      onCurrencyChange(selected);
    }
    setPopoverActive(false);
    setSearchValue('');
    setFilteredCurrencies(availableCurrencies);
  }

  function getButtonText() {
    return `${selectedCurrency.symbol} ${selectedCurrency.code}`;
  }

  return (
    <Popover
      active={popoverActive}
      autofocusTarget="none"
      preferredAlignment="right"
      preferredPosition="below"
      fluidContent
      sectioned={false}
      activator={
        <Button size="slim" icon={CurrencyConvertIcon} onClick={() => setPopoverActive(!popoverActive)}>
          {getButtonText()}
        </Button>
      }
      onClose={() => {
        setPopoverActive(false);
        setSearchValue('');
        setFilteredCurrencies(availableCurrencies);
      }}>
      <Popover.Pane fixed>
        <InlineGrid
          columns={{
            xs: '1fr',
            md: '1fr',
            lg: 'max-content',
          }}
          gap="0">
          <Box maxWidth="250px" width="250px" padding="0">
            <Box padding="200">
              <TextField
                label=""
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Buscar moneda..."
                autoComplete="off"
              />
            </Box>
            <Scrollable style={{ height: '300px' }}>
              <OptionList
                options={filteredCurrencies.map((currency) => ({
                  value: currency.code,
                  label: `${currency.symbol} ${currency.code}`,
                }))}
                selected={[selectedCurrency.code]}
                onChange={handleCurrencySelect}
              />
            </Scrollable>
          </Box>
        </InlineGrid>
      </Popover.Pane>
    </Popover>
  );
}
