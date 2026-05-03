import { request } from "@/http/axios"

export interface UserStats {
  total: number
  active: number
  newToday: number
  newThisWeek: number
  newThisMonth: number
  activeDuration: number
}

export interface TopTool {
  toolId: number
  name: string
  duration: number
  uses: number
  percentage: number
}

export interface ToolStats {
  totalDuration: number
  topTools: TopTool[]
}

export interface TopItem {
  id: number
  name: string
  exchanges: number
  percentage: number
}

export interface ExchangeStats {
  totalExchanges: number
  totalPoints: number
  topItems: TopItem[]
}

export interface UserToolUsage {
  userId: string
  nickname: string
  avatarUrl: string
  totalDuration: number
  totalVisits: number
}

export interface StatsQueryParams {
  startDate?: string
  endDate?: string
}

export const statsApi = {
  /**
   * 获取用户统计
   */
  getUserStats: () => {
    return request<{ data: UserStats }>({
      url: "/admin/stats/users",
      method: "GET"
    })
  },

  /**
   * 获取工具使用统计
   */
  getToolStats: (params?: StatsQueryParams) => {
    return request<{ data: ToolStats }>({
      url: "/admin/stats/tools",
      method: "GET",
      params
    })
  },

  /**
   * 获取兑换统计
   */
  getExchangeStats: (params?: StatsQueryParams) => {
    return request<{ data: ExchangeStats }>({
      url: "/admin/stats/exchanges",
      method: "GET",
      params
    })
  },

  /**
   * 获取用户工具使用时长排行
   */
  getUserToolUsage: (params?: StatsQueryParams) => {
    return request<{ data: { userUsage: UserToolUsage[] } }>({
      url: "/admin/stats/user-tool-usage",
      method: "GET",
      params
    })
  }
}
