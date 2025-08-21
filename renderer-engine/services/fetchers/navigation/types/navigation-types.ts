/*
 * Copyright 2025 Fasttify LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface ProcessedNavigationMenu {
  id: string;
  storeId: string;
  domain: string;
  name: string;
  handle: string;
  isMain: boolean;
  isActive: boolean;
  items: ProcessedMenuItemData[];
  owner: string;
}

export interface NavigationMenusResponse {
  menus: ProcessedNavigationMenu[];
  mainMenu?: ProcessedNavigationMenu;
  footerMenu?: ProcessedNavigationMenu;
}

export interface NavigationMenuData {
  id: string;
  storeId: string;
  domain: string;
  name: string;
  handle: string;
  isMain: boolean;
  isActive: boolean;
  menuData: any;
  owner: string;
}

export interface ProcessedMenuItemData {
  title: string;
  url: string;
  active: boolean;
  type: string;
  target?: string;
}
