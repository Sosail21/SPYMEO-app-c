// Cdw-Spm: Resource card component
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  category?: string | null
  type?: string | null
  description?: string | null
}

interface ResourceCardProps {
  resource: Resource
  href: string
}

export function ResourceCard({ resource, href }: ResourceCardProps) {
  const getTypeIcon = (type?: string | null) => {
    if (!type) return '📄'
    switch (type.toUpperCase()) {
      case 'VIDEO':
        return '🎥'
      case 'PDF':
        return '📄'
      case 'LINK':
        return '🔗'
      default:
        return '📄'
    }
  }

  return (
    <Link
      href={href}
      className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {getTypeIcon(resource.type)}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">
            {resource.title}
          </h3>
          {resource.category && (
            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {resource.category}
            </span>
          )}
          {resource.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
