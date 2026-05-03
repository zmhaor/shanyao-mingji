import { request } from "@/http/axios"

export interface MaterialItem {
  id: number
  title: string
  description: string
  file_name: string
  file_url: string
  file_size: number
  file_ext: string
  preview_images: string[]
  sort_order: number
  points_required: number
  download_count: number
  is_active: boolean
  create_time: number
  update_time: number
}

export interface MaterialFormData {
  title: string
  description: string
  sort_order: number
  points_required: number
  is_active: boolean
  file?: File
  preview_files?: File[]
  existing_preview_urls?: string[]
}

function buildPayload(data: MaterialFormData) {
  const formData = new FormData()
  formData.append("title", data.title)
  formData.append("description", data.description || "")
  formData.append("sort_order", String(data.sort_order || 0))
  formData.append("points_required", String(data.points_required || 0))
  formData.append("is_active", String(Boolean(data.is_active)))
  if (data.file) {
    formData.append("file", data.file)
  }
  formData.append("existing_preview_urls", JSON.stringify(data.existing_preview_urls || []))
  ;(data.preview_files || []).slice(0, 2).forEach((file) => {
    formData.append("preview_images", file)
  })
  return formData
}

export const materialApi = {
  getMaterialList: () => {
    return request<{ data: MaterialItem[] }>({
      url: "/admin/materials",
      method: "GET"
    })
  },

  createMaterial: (data: MaterialFormData) => {
    return request<{ data: MaterialItem }>({
      url: "/admin/materials",
      method: "POST",
      data: buildPayload(data),
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },

  updateMaterial: (id: number, data: MaterialFormData) => {
    return request<{ data: MaterialItem }>({
      url: `/admin/materials/${id}`,
      method: "PUT",
      data: buildPayload(data),
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  },

  deleteMaterial: (id: number) => {
    return request({
      url: `/admin/materials/${id}`,
      method: "DELETE"
    })
  }
}
