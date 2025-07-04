export interface Page {
  id: string;
  storeId: string;
  title: string;
  content: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  owner: string;
  template?: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageContext {
  id: string;
  storeId: string;
  title: string;
  content: string;
  url: string;
  slug: string;
  handle: string;
  template?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: string;
  owner: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
  published_at?: string;
  metafields?: Record<string, any>;
}
