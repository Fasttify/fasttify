import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import InventoryTableRow, { InventoryRowProps } from './inventory-table-row'

interface InventoryTableProps {
  data: InventoryRowProps[]
}

export default function InventoryTable({ data }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Unavailable</TableHead>
            <TableHead>Committed</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>In Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(row => (
            <InventoryTableRow key={row.id} {...row} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
