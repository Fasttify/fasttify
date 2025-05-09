import { LegalDocuments } from '@/app/(main-layout)/terms/components/LegalDocuments'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones • Fasttify',
  description:
    'Consulta los términos y condiciones de uso de Fasttify, incluyendo nuestras políticas y aspectos legales.',
}

export default function LegalPage() {
  return (
    <>
      <LegalDocuments />
    </>
  )
}
