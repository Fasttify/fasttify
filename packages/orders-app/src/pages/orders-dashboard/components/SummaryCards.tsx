import React from 'react';
import { SummarySection, SummaryCard } from '../styles/OrdersDashboard.styles';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  customerEmail: string;
}

interface SummaryCardsProps {
  orders: Order[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(
    (order) => order.status === 'Procesando' || order.status === 'En tránsito'
  ).length;
  const deliveredOrders = orders.filter((order) => order.status === 'Entregado').length;

  return (
    <SummarySection>
      <SummaryCard>
        <h3>Total Órdenes</h3>
        <div className="value">{totalOrders}</div>
        <div className="change">Este mes</div>
      </SummaryCard>

      <SummaryCard>
        <h3>Ingresos Totales</h3>
        <div className="value">${totalAmount.toFixed(2)}</div>
        <div className="change">+12% vs mes anterior</div>
      </SummaryCard>

      <SummaryCard>
        <h3>Órdenes Pendientes</h3>
        <div className="value">{pendingOrders}</div>
        <div className="change">En proceso</div>
      </SummaryCard>

      <SummaryCard>
        <h3>Órdenes Entregadas</h3>
        <div className="value">{deliveredOrders}</div>
        <div className="change">Completadas</div>
      </SummaryCard>
    </SummarySection>
  );
};
