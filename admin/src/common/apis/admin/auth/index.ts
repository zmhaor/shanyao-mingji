import { request } from "@/http/axios"

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: {
    id: number
    username: string
    role: string
  }
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangeUsernameRequest {
  currentPassword: string
  newUsername: string
}

export const authApi = {
  /**
   * 管理员登录
   */
  login: (data: LoginRequest) => {
    return request<{ data: LoginResponse }>({
      url: "/admin/login",
      method: "POST",
      data
    })
  },

  /**
   * 修改密码
   */
  changePassword: (data: ChangePasswordRequest) => {
    return request({
      url: "/admin/login/password",
      method: "PUT",
      data
    })
  },

  /**
   * 修改用户名
   */
  changeUsername: (data: ChangeUsernameRequest) => {
    return request({
      url: "/admin/login/username",
      method: "PUT",
      data
    })
  }
}
