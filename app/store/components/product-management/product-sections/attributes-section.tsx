import type { UseFormReturn } from 'react-hook-form'
import { AttributesForm } from '@/app/store/components/product-management/AttributesForm'
import type { ProductFormValues } from '@/lib/zod-schemas/product-schema'

interface AttributesSectionProps {
  form: UseFormReturn<ProductFormValues>
}

export function AttributesSection({ form }: AttributesSectionProps) {
  return (
    <AttributesForm
      value={form.watch('attributes') || []}
      onChange={attributes => form.setValue('attributes', attributes, { shouldValidate: true })}
    />
  )
}
