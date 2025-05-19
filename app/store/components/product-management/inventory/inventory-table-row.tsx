import { TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

export interface InventoryRowProps {
  id: string
  sku: string
  unavailable: number
  committed: number
  available: number
  inStock: number
}

export default function InventoryTableRow({
  id,
  sku,
  unavailable,
  committed,
  available,
  inStock,
}: InventoryRowProps) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="text-blue-700 font-semibold">{id}</TableCell>
      <TableCell>{sku}</TableCell>
      <TableCell>{unavailable}</TableCell>
      <TableCell>{committed}</TableCell>
      <TableCell>
        <input type="number" className="border rounded px-2 py-1 w-16" value={available} readOnly />
      </TableCell>
      <TableCell>
        <input type="number" className="border rounded px-2 py-1 w-16" value={inStock} readOnly />
      </TableCell>
    </TableRow>
  )
}
