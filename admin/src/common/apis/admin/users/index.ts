import { request } from "@/http/axios"

export interface User {
  id: string
  email: string
  nick_name: string
  avatar_url: string
  points: number
  create_time: number
  stats?: {
    favorites: number
    history: number
  }
}

export interface UserListResponse {
  list: User[]
  total: number
  page: number
  pageSize: number
}

export interface UserQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface CreateUserRequest {
  email: string
  nick_name: string
  password: string
  points?: number
}

export interface ConfigRequest {
  key: string
  value: any
  description?: string
}

export const userApi = {
  /**
   * 获取用户列表
   */
  getUserList: (params: UserQueryParams) => {
    return request<{ data: UserListResponse }>({
      url: "/admin/users",
      method: "GET",
      params
    })
  },

  /**
   * 获取用户详情
   */
  getUserDetail: (id: string) => {
    return request<{ data: User }>({
      url: `/admin/users/${id}`,
      method: "GET"
    })
  },

  /**
   * 创建用户
   */
  createUser: (data: CreateUserRequest) => {
    return request({
      url: "/admin/users",
      method: "POST",
      data
    })
  },

  /**
   * 更新用户信息
   */
  updateUser: (id: string, data: Partial<User>) => {
    return request({
      url: `/admin/users/${id}`,
      method: "PUT",
      data
    })
  },

  /**
   * 删除用户
   */
  deleteUser: (id: string) => {
    return request({
      url: `/admin/users/${id}`,
      method: "DELETE"
    })
  },

  /**
   * 获取配置
   */
  getConfig: (key: string) => {
    return request<{ data: any }>({
      url: `/admin/config/${key}`,
      method: "GET"
    })
  },

  /**
   * 保存配置
   */
  saveConfig: (data: ConfigRequest) => {
    return request({
      url: "/admin/config",
      method: "POST",
      data
    })
  },

  /**
   * 获取用户学习进度
   */
  getUserProgress: (userId: string) => {
    return request<{ data: any }>({
      url: `/admin/progress/${userId}`,
      method: "GET"
    })
  }
}
