import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import InventoryTableRow, { InventoryRowProps } from './inventory-table-row'
import { InventoryCardMobile } from './inventory-card-mobile'

interface InventoryTableProps {
  data: InventoryRowProps[]
}

export default function InventoryTable({ data }: InventoryTableProps) {
  return (
    <div className="space-y-4">
      {/* Vista de escritorio */}
      <div className="overflow-x-auto rounded-md border bg-white hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>No disponible</TableHead>
              <TableHead>Comprometido</TableHead>
              <TableHead>Disponible</TableHead>
              <TableHead>En existencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(row => (
              <InventoryTableRow key={row.id} {...row} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista móvil */}
      <InventoryCardMobile data={data} />
    </div>
  )
}
