import { request } from "@/http/axios"

export interface ContentCollection {
  id: number
  key: string
  name: string
  description: string
  item_schema?: Record<string, any> | null
  version: number
  is_active: boolean
  last_published_at: number | null
  create_time: number
  update_time: number
}

export interface ContentItem {
  id: number
  collection_id: number
  item_key: string
  title: string
  chapter: string
  section: string
  group_name: string
  level: number | null
  clause_num: string
  textbook_order: number | null
  sort_order: number
  status: "draft" | "published" | "archived"
  content_json: Record<string, any>
  search_text?: string
  create_time?: number
  update_time?: number
}

export interface ContentCollectionFormData {
  key: string
  name: string
  description: string
  is_active: boolean
  item_schema?: Record<string, any> | null
}

export interface ContentItemFormData {
  collection_id: number
  item_key: string
  title: string
  chapter: string
  section: string
  group_name: string
  level: number | null
  clause_num: string
  textbook_order: number | null
  sort_order: number
  status: "draft" | "published" | "archived"
  content_json: Record<string, any>
}

export const contentApi = {
  getCollectionList: () => {
    return request<{ data: ContentCollection[] }>({
      url: "/admin/content/collections",
      method: "GET"
    })
  },

  createCollection: (data: ContentCollectionFormData) => {
    return request<{ data: ContentCollection }>({
      url: "/admin/content/collections",
      method: "POST",
      data
    })
  },

  updateCollection: (id: number, data: Partial<ContentCollectionFormData>) => {
    return request<{ data: ContentCollection }>({
      url: `/admin/content/collections/${id}`,
      method: "PUT",
      data
    })
  },

  deleteCollection: (id: number) => {
    return request({
      url: `/admin/content/collections/${id}`,
      method: "DELETE"
    })
  },

  publishCollection: (id: number) => {
    return request<{ data: ContentCollection }>({
      url: `/admin/content/collections/${id}/publish`,
      method: "POST"
    })
  },

  importCollectionItems: (id: number, items: Record<string, any>[]) => {
    return request<{ data: { collection_id: number, imported_count: number } }>({
      url: `/admin/content/collections/${id}/import`,
      method: "POST",
      data: { items }
    })
  },

  exportCollectionItems: (id: number, ids?: number[]) => {
    return request<{ data: { list: ContentItem[], collection: ContentCollection | null } }>({
      url: `/admin/content/collections/${id}/export`,
      method: "GET",
      params: ids && ids.length > 0 ? { ids: ids.join(",") } : undefined
    })
  },

  getItemList: (params: { collectionId?: number, page?: number, pageSize?: number, keyword?: string }) => {
    return request<{ data: { list: ContentItem[], total: number, page: number, pageSize: number } }>({
      url: "/admin/content/items",
      method: "GET",
      params
    })
  },

  createItem: (data: ContentItemFormData) => {
    return request<{ data: ContentItem }>({
      url: "/admin/content/items",
      method: "POST",
      data
    })
  },

  updateItem: (id: number, data: Partial<ContentItemFormData>) => {
    return request<{ data: ContentItem }>({
      url: `/admin/content/items/${id}`,
      method: "PUT",
      data
    })
  },

  deleteItem: (id: number) => {
    return request({
      url: `/admin/content/items/${id}`,
      method: "DELETE"
    })
  },

  getMaxSortOrder: (collectionId: number) => {
    return request<{ data: number }>({
      url: "/admin/content/items/max-sort-order",
      method: "GET",
      params: { collectionId }
    })
  },

  updateItemSortOrder: (id: number, sortOrder: number) => {
    return request<{ data: ContentItem }>({
      url: `/admin/content/items/${id}/sort`,
      method: "PUT",
      data: { newSortOrder: sortOrder }
    })
  },

  resetCollectionSortOrder: (id: number) => {
    return request<{ data: { collection_id: number, updated_count: number } }>({
      url: `/admin/content/collections/${id}/reset-sort-order`,
      method: "POST"
    })
  },

  batchDeleteItems: (ids: number[]) => {
    return request({
      url: "/admin/content/items/batch",
      method: "DELETE",
      params: { ids: ids.join(",") }
    })
  }
}
