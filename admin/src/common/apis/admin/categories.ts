import type { Category } from "@/common/apis/admin/categories/type"
import { request } from "@/http/axios"

/**
 * 分类管理API
 */
export const categoryApi = {
  /**
   * 获取分类列表
   */
  getCategoryList: async () => {
    return request<{ success: boolean; message: string; data: { categories: Category[] } }>({
      url: "/admin/categories",
      method: "GET"
    })
  },

  /**
   * 获取单个分类
   * @param id 分类ID
   */
  getCategory: async (id: number) => {
    return request<{ success: boolean; message: string; data: Category }>({
      url: `/admin/categories/${id}`,
      method: "GET"
    })
  },

  /**
   * 创建分类
   * @param data 分类数据
   */
  createCategory: async (data: {
    name: string
    icon?: string
    order?: number
    status?: string
  }) => {
    return request<{ success: boolean; message: string; data: Category }>({
      url: "/admin/categories",
      method: "POST",
      data
    })
  },

  /**
   * 更新分类
   * @param id 分类ID
   * @param data 分类数据
   */
  updateCategory: async (id: number, data: {
    name?: string
    icon?: string
    order?: number
    status?: string
  }) => {
    return request<{ success: boolean; message: string; data: Category }>({
      url: `/admin/categories/${id}`,
      method: "PUT",
      data
    })
  },

  /**
   * 删除分类
   * @param id 分类ID
   */
  deleteCategory: async (id: number) => {
    return request<{ success: boolean; message: string }>({
      url: `/admin/categories/${id}`,
      method: "DELETE"
    })
  }
}
