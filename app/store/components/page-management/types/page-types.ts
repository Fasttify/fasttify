export interface IPage {
  id: string
  title: string
  content: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  status: 'active' | 'draft' | 'inactive'
  isVisible: boolean
  template?: string
  storeId: string
  createdAt?: string
  updatedAt?: string
}

export interface PageFormValues {
  title: string
  content: string
  slug: string
  metaTitle?: string
  metaDescription?: string
  status: 'active' | 'draft' | 'inactive'
  isVisible: boolean
  template?: string
}

export type SortDirection = 'asc' | 'desc' | null
export type SortField = 'title' | 'status' | 'slug' | 'createdAt' | 'updatedAt'

export interface VisibleColumns {
  page: boolean
  status: boolean
  slug: boolean
  visibility: boolean
  actions: boolean
}

export interface PageListProps {
  storeId: string
  pages: IPage[]
  loading: boolean
  error: Error | null
  deleteMultiplePages: (ids: string[]) => Promise<boolean>
  refreshPages: () => void
  deletePage: (id: string) => Promise<boolean>
}
