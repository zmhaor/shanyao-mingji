import { request } from "@/http/axios"

export interface ShopItem {
  id: number
  name: string
  icon: string
  points: number
  description: string
  is_active: boolean
  create_time: number
  update_time: number
}

export interface Exchange {
  id: number
  user_id: string
  user_email: string
  user_nick_name: string
  item_id: number
  item_name: string
  points: number
  create_time: number
}

export interface ExchangeListResponse {
  list: Exchange[]
  total: number
  page: number
  pageSize: number
}

export interface ExchangeQueryParams {
  page?: number
  pageSize?: number
  userId?: string
  startDate?: string
  endDate?: string
}

export interface ShopItemCreateParams {
  name: string
  icon: string
  points: number
  description: string
  is_active: boolean
}

export interface ShopItemUpdateParams {
  name?: string
  icon?: string
  points?: number
  description?: string
  is_active?: boolean
}

export const shopApi = {
  /**
   * 获取商城商品列表
   */
  getShopItems: () => {
    return request<{ data: ShopItem[] }>({
      url: "/admin/shop/items",
      method: "GET"
    })
  },

  /**
   * 添加商城商品
   */
  createShopItem: (params: ShopItemCreateParams) => {
    return request<{ data: ShopItem }>({
      url: "/admin/shop/items",
      method: "POST",
      data: params
    })
  },

  /**
   * 更新商城商品
   */
  updateShopItem: (id: number, params: ShopItemUpdateParams) => {
    return request({
      url: `/admin/shop/items/${id}`,
      method: "PUT",
      data: params
    })
  },

  /**
   * 删除商城商品
   */
  deleteShopItem: (id: number) => {
    return request({
      url: `/admin/shop/items/${id}`,
      method: "DELETE"
    })
  },

  /**
   * 获取兑换记录
   */
  getExchangeList: (params: ExchangeQueryParams) => {
    return request<{ data: ExchangeListResponse }>({
      url: "/admin/shop/exchanges",
      method: "GET",
      params
    })
  }
}
