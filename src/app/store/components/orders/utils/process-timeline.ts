import type { IOrder } from '@/app/store/hooks/data/useOrders';
import { getPaymentStatusTone, getStatusTone } from './order-utils';

export interface ProcessedTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: any;
  tone: string;
  show: boolean;
}

export function processTimeline(order: IOrder): ProcessedTimelineEvent[] {
  return [
    {
      id: 'created',
      title: 'Orden Creada',
      description: 'La orden fue creada exitosamente',
      date: order.createdAt,
      icon: 'PageClockFilledIcon',
      tone: 'info',
      show: true,
    },
    {
      id: 'customer',
      title: 'Cliente Registrado',
      description: `Cliente ${order.customerType === 'guest' ? 'invitado' : 'registrado'} agregado`,
      date: order.createdAt,
      icon: 'PageClockFilledIcon',
      tone: 'info',
      show: true,
    },
    {
      id: 'payment_method',
      title: 'Método de Pago Seleccionado',
      description: `Método: ${order.paymentMethod || 'No especificado'}`,
      date: order.createdAt,
      icon: 'CreditCardIcon',
      tone: 'info',
      show: true,
    },
    {
      id: 'shipping_address',
      title: 'Dirección de Envío Configurada',
      description: 'Dirección de envío configurada para la orden',
      date: order.createdAt,
      icon: 'LocationIcon',
      tone: 'info',
      show: true,
    },
    {
      id: 'updated',
      title: 'Última Actualización',
      description: 'La orden fue modificada por última vez',
      date: order.updatedAt,
      icon: 'PageClockFilledIcon',
      tone: 'info',
      show: !!order.updatedAt && order.updatedAt !== order.createdAt,
    },
    {
      id: 'status',
      title: `Estado: ${order.status}`,
      description: `La orden está actualmente ${order.status}`,
      date: order.updatedAt || order.createdAt,
      icon: 'InfoIcon',
      tone: getStatusTone(order.status || ''),
      show: true,
    },
    {
      id: 'payment_status',
      title: `Estado del Pago: ${order.paymentStatus}`,
      description: `El pago está ${order.paymentStatus}`,
      date: order.updatedAt || order.createdAt,
      icon: 'CreditCardIcon',
      tone: getPaymentStatusTone(order.paymentStatus || ''),
      show: true,
    },
  ].filter((event) => event.show);
}
