// Cdw-Spm: Filters bar for Academy resources
'use client'

interface FiltersBarProps {
  categories: string[]
  types: string[]
  onFilterChange: (filters: { category?: string; type?: string }) => void
}

export function FiltersBar({ categories, types, onFilterChange }: FiltersBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex-1">
        <label htmlFor="category-filter" className="sr-only">
          Catégorie
        </label>
        <select
          id="category-filter"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={(e) => onFilterChange({ category: e.target.value || undefined })}
          defaultValue=""
        >
          <option value="">Toutes catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="type-filter" className="sr-only">
          Type
        </label>
        <select
          id="type-filter"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
          defaultValue=""
        >
          <option value="">Tous types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
