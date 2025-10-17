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

export type StoreStatus = 'active' | 'inactive';

export interface Store {
  storeId: string;
  storeName: string;
  defaultDomain?: string;
  storeType: string;
  storeStatus?: boolean;
  storeDescription?: string;
  storeLogo?: string;
  storeFavicon?: string;
  storeTheme?: string;
  storeCurrency?: string;
  currencyFormat?: string;
  currencyLocale?: string;
  currencyDecimalPlaces?: number;
  storeAdress?: string;
  contactEmail?: string;
  contactPhone?: string;
  onboardingCompleted: boolean;
  onboardingData?: any;
}

export interface UserMenuProps {
  user: {
    email: string;
    nickName?: string;
    picture?: string;
  } | null;
  onLogout: () => void;
}

export interface StoreCardProps {
  store: Store;
  onClick: (storeId: string) => void;
}

export interface StoreFiltersProps {
  selected: number;
  onSelect: (selectedTabIndex: number) => void;
}

export interface StoreListHeaderProps {
  canCreateStore: boolean;
  onCreateStore: () => void;
}

export interface StoreListProps {
  stores: Store[];
  onStoreSelect: (storeId: string) => void;
  canCreateStore: boolean;
  onCreateStore: () => void;
}

export interface EmptyStoreStateProps {
  canCreateStore: boolean;
  onCreateStore: () => void;
}

export interface UseUserStoresResult {
  stores: Store[];
  activeStores: Store[];
  inactiveStores: Store[];
  canCreateStore: boolean;
  error: string | null;
  storeCount: number;
}
