import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { TableSection, TableHeader, TableContainer } from '../styles/OrdersDashboard.styles';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  customerEmail: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const columnHelper = createColumnHelper<Order>();

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID Orden',
        cell: (info) => <span style={{ fontWeight: 600, color: '#667eea' }}>{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', {
        header: 'Fecha',
        cell: (info) => new Date(info.getValue()).toLocaleDateString('es-ES'),
      }),
      columnHelper.accessor('customerEmail', {
        header: 'Cliente',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: (info) => {
          const status = info.getValue();
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'Entregado':
                return '#10b981';
              case 'En tránsito':
                return '#f59e0b';
              case 'Procesando':
                return '#3b82f6';
              case 'Cancelado':
                return '#ef4444';
              default:
                return '#6b7280';
            }
          };

          return (
            <span
              style={{
                color: getStatusColor(status),
                fontWeight: 500,
                backgroundColor: `${getStatusColor(status)}15`,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}>
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('items', {
        header: 'Productos',
        cell: (info) => `${info.getValue()} item${info.getValue() > 1 ? 's' : ''}`,
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => <span style={{ fontWeight: 600 }}>${info.getValue().toFixed(2)}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#6b7280',
              }}
              onClick={() => console.log('Ver detalles:', info.row.original.id)}>
              Ver
            </button>
            <button
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#6b7280',
              }}
              onClick={() => console.log('Descargar:', info.row.original.id)}>
              Descargar
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <TableSection>
      <TableHeader>
        <h2>Órdenes Recientes</h2>
      </TableHeader>

      <TableContainer>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={header.column.getToggleSortingHandler()}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                }}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '0.75rem 1rem',
                      color: '#1f2937',
                    }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
          }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              orders.length
            )}{' '}
            de {orders.length} órdenes
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: 'white',
                cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                opacity: table.getCanPreviousPage() ? 1 : 0.5,
              }}>
              Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{
                padding: '0.375rem 0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: 'white',
                cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                opacity: table.getCanNextPage() ? 1 : 0.5,
              }}>
              Siguiente
            </button>
          </div>
        </div>
      </TableContainer>
    </TableSection>
  );
};
