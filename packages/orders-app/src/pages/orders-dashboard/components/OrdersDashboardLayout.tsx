import React from 'react';
import {
  DashboardContainer,
  TopNavigation,
  NavBrand,
  NavTabs,
  NavTab,
  UserMenu,
  DashboardContent,
} from '../styles/OrdersDashboard.styles';
import { ShoppingBagIcon, ListIcon, SearchIcon, HelpCircleIcon, LogOutIcon } from '../../../components/icons';

interface OrdersDashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: 'orders' | 'search' | 'help';
  onTabChange?: (tab: 'orders' | 'search' | 'help') => void;
  onLogout?: () => void;
  userEmail?: string;
}

export const OrdersDashboardLayout: React.FC<OrdersDashboardLayoutProps> = ({
  children,
  activeTab = 'orders',
  onTabChange,
  onLogout,
  userEmail,
}) => {
  return (
    <DashboardContainer>
      <TopNavigation>
        <NavBrand>
          <ShoppingBagIcon size={32} />
          <img src="/icons/letter-white.webp" alt="Fasttify" width={100} height={24} />
        </NavBrand>

        <NavTabs>
          <NavTab $active={activeTab === 'orders'} onClick={() => onTabChange?.('orders')}>
            <ListIcon size={16} />
            Mis Órdenes
          </NavTab>
          <NavTab $active={activeTab === 'search'} onClick={() => onTabChange?.('search')}>
            <SearchIcon size={16} />
            Buscar
          </NavTab>
          <NavTab $active={activeTab === 'help'} onClick={() => onTabChange?.('help')}>
            <HelpCircleIcon size={16} />
            Ayuda
          </NavTab>
        </NavTabs>

        <UserMenu>
          <span>{userEmail}</span>
          <button onClick={onLogout}>
            <LogOutIcon size={14} />
            Salir
          </button>
        </UserMenu>
      </TopNavigation>

      <DashboardContent>{children}</DashboardContent>
    </DashboardContainer>
  );
};
