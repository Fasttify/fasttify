import Link from 'next/link'

export default function CollectionsFooter() {
  return (
    <div className="text-center mt-4 text-sm text-gray-600">
      Más información sobre{' '}
      <Link href="#" className="text-blue-600 hover:underline">
        colecciones
      </Link>
    </div>
  )
}
