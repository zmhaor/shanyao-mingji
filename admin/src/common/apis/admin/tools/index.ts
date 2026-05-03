import { request } from "@/http/axios"

export interface Tool {
  id: number
  name: string
  description: string
  icon: string
  category: string
  content: string
  usageCount: number
  features: string[]
  instructions: string
  rating: number
  favorites: number
  status: "active" | "inactive"
  create_time: number
  update_time: number
}

export interface ToolListResponse {
  tools: Tool[]
  total: number
  page: number
  pageSize: number
}

export interface ToolCreateParams {
  name: string
  description?: string
  icon?: string
  category?: string
  content?: string
  features?: string[]
  instructions?: string
  rating?: number
  favorites?: number
  status?: "active" | "inactive"
}

export interface ToolUpdateParams {
  name?: string
  description?: string
  icon?: string
  category?: string
  content?: string
  features?: string[]
  instructions?: string
  rating?: number
  favorites?: number
  status?: "active" | "inactive"
}

export interface ToolStatusUpdateParams {
  status: "active" | "inactive"
}

export const toolApi = {
  /**
   * 获取工具列表（管理员专用，可查看所有状态）
   */
  getToolList: (params?: { page?: number; pageSize?: number; category?: string }) => {
    return request<{ success: boolean; message: string; data: ToolListResponse }>({
      url: "/tools",
      method: "GET",
      params: {
        ...params,
        showAll: true
      }
    })
  },

  /**
   * 获取工具详情
   */
  getToolDetail: (id: number) => {
    return request<{ success: boolean; message: string; data: Tool }>({
      url: `/tools/${id}`,
      method: "GET"
    })
  },

  /**
   * 添加工具
   */
  createTool: (params: ToolCreateParams) => {
    return request<{ success: boolean; message: string; data: Tool }>({
      url: "/admin/tools",
      method: "POST",
      data: params
    })
  },

  /**
   * 更新工具
   */
  updateTool: (id: number, params: ToolUpdateParams) => {
    return request<{ success: boolean; message: string }>({
      url: `/admin/tools/${id}`,
      method: "PUT",
      data: params
    })
  },

  /**
   * 更新工具状态
   */
  updateToolStatus: (id: number, params: ToolStatusUpdateParams) => {
    return request<{ success: boolean; message: string }>({
      url: `/tools/${id}/status`,
      method: "PUT",
      data: params
    })
  },

  /**
   * 初始化工具数据
   */
  initTools: () => {
    return request<{ success: boolean; message: string }>({
      url: "/tools/init",
      method: "POST"
    })
  },

  /**
   * 删除工具
   */
  deleteTool: (id: number) => {
    return request<{ success: boolean; message: string }>({
      url: `/admin/tools/${id}`,
      method: "DELETE"
    })
  }
}
