import { Checkbox } from '@/components/ui/checkbox'
import { FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function CollectionsTable() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="font-medium text-gray-600">Título</TableHead>
            <TableHead className="font-medium text-gray-600">Productos</TableHead>
            <TableHead className="font-medium text-gray-600">Condiciones del producto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="p-4">
              <Checkbox />
            </TableCell>
            <TableCell className="p-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span>Página de inicio</span>
            </TableCell>
            <TableCell className="p-4">1</TableCell>
            <TableCell className="p-4"></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
