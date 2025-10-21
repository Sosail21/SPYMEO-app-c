// Cdw-Spm: Resource grid component
import { ResourceCard } from './ResourceCard'

interface Resource {
  id: string
  title: string
  category?: string | null
  type?: string | null
  description?: string | null
}

interface ResourceGridProps {
  resources: Resource[]
  basePath: string
}

export function ResourceGrid({ resources, basePath }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune ressource disponible</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          href={`${basePath}/${resource.id}`}
        />
      ))}
    </div>
  )
}
