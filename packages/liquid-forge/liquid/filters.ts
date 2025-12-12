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

export { baseFilters } from './filters/base-filters';
export { cartFilters } from './filters/cart-filters';
export { dataAccessFilters } from './filters/data-access-filters';
export { ecommerceFilters } from './filters/ecommerce-filters';
export { htmlFilters } from './filters/html-filters';
export { moneyFilters } from './filters/money-filters';
export { fasttifyAttributesFilter } from './filters/fasttify-attributes-filter';

import { baseFilters } from './filters/base-filters';
import { cartFilters } from './filters/cart-filters';
import { dataAccessFilters } from './filters/data-access-filters';
import { ecommerceFilters } from './filters/ecommerce-filters';
import { htmlFilters } from './filters/html-filters';
import { moneyFilters } from './filters/money-filters';
import { fasttifyAttributesFilter } from './filters/fasttify-attributes-filter';

import type { LiquidFilter } from '../types';

/**
 * Array con todos los filtros para registrar en el motor Liquid
 */
export const allFilters: LiquidFilter[] = [
  ...baseFilters,
  ...moneyFilters,
  ...ecommerceFilters,
  ...htmlFilters,
  ...cartFilters,
  ...dataAccessFilters,
  fasttifyAttributesFilter,
];

export const ecommerceFiltersLegacy = allFilters;
