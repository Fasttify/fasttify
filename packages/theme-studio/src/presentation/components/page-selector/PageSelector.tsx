/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import { useState, useMemo } from 'react';
import { Popover, ActionList, TextField, Box, Text, Icon, Button, IconSource, Spinner } from '@shopify/polaris';
import { SearchIcon, HomeIcon } from '@shopify/polaris-icons';
import { useStoreTemplates } from '../../hooks/useStoreTemplates';

interface PageSelectorProps {
  storeId: string | undefined;
  apiBaseUrl: string;
  currentPage?: string;
  onPageSelect?: (pageId: string, pageUrl: string) => void;
}

/**
 * Componente selector de páginas basado en los templates disponibles del tema
 * Obtiene los templates desde S3 y los muestra en un dropdown
 */
export function PageSelector({ storeId, apiBaseUrl, currentPage = 'Home page', onPageSelect }: PageSelectorProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { pages, isLoading } = useStoreTemplates({ storeId, apiBaseUrl });

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;

    const query = searchQuery.toLowerCase();
    return pages.filter((page) => page.name.toLowerCase().includes(query));
  }, [pages, searchQuery]);

  const handlePageSelect = (page: (typeof pages)[0]) => {
    onPageSelect?.(page.id, page.url);
    setPopoverActive(false);
    setSearchQuery('');
  };

  const currentPageIcon = useMemo(() => {
    const page = pages.find((p) => p.name === currentPage);
    return page?.icon || HomeIcon;
  }, [pages, currentPage]);

  const activator = (
    <Button
      onClick={() => setPopoverActive(!popoverActive)}
      icon={currentPageIcon as unknown as IconSource}
      variant="tertiary">
      {currentPage}
    </Button>
  );

  return (
    <Popover active={popoverActive} activator={activator} onClose={() => setPopoverActive(false)}>
      <Box padding="400" minWidth="320px">
        <Box paddingBlockEnd="300">
          <TextField
            label="Buscar página"
            labelHidden
            value={searchQuery}
            onChange={setSearchQuery}
            prefix={<SearchIcon />}
            placeholder="Buscar página"
            autoComplete="off"
          />
        </Box>

        {isLoading ? (
          <Box padding="400">
            <Spinner size="small" />
          </Box>
        ) : filteredPages.length === 0 ? (
          <Box padding="400">
            <Text as="p" tone="subdued">
              {searchQuery ? 'No se encontraron páginas' : 'No hay templates disponibles'}
            </Text>
          </Box>
        ) : (
          <ActionList
            items={filteredPages.map((page) => ({
              content: page.name,
              prefix: <Icon source={page.icon as unknown as IconSource} />,
              active: currentPage === page.name,
              onAction: () => handlePageSelect(page),
            }))}
          />
        )}
      </Box>
    </Popover>
  );
}
