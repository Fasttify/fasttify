interface StoreData {
  storeName: string
  description: string
  location: string
  category: string
}

interface StoreInfoProps {
  data: StoreData
  updateData: (data: Partial<StoreData>) => void
}

const StoreInfo: React.FC<StoreInfoProps> = ({ data, updateData }) => {
  const categories = [
    'Ropa y Accesorios',
    'Electrónica',
    'Hogar y Jardín',
    'Alimentos y Bebidas',
    'Arte y Artesanías',
    'Otros',
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Datos de la Tienda</h2>
        <p className="text-gray-500 mt-1">Configura los detalles de tu tienda</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la tienda
          </label>
          <input
            type="text"
            id="storeName"
            value={data.storeName}
            onChange={e => updateData({ storeName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Mi Tienda Genial"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
            value={data.description}
            onChange={e => updateData({ description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe tu tienda en pocas palabras..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            value={data.location}
            onChange={e => updateData({ location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Ciudad, País"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            id="category"
            value={data.category}
            onChange={e => updateData({ category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default StoreInfo
