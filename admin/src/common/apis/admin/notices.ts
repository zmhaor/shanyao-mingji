import { request } from "@/http/axios"

export interface Notice {
    id: number
    title: string
    content: string
    type: "popup" | "scroll"
    isActive: boolean
    confirmed_count: number
    create_time: number
    update_time: number
}

export const noticeApi = {
    /** 获取公告列表 */
    getNoticeList(params: { page: number; pageSize: number }) {
        return request<{
            success: boolean
            data: {
                list: Notice[]
                total: number
                page: number
                pageSize: number
            }
        }>({
            url: "/admin/notices/list",
            method: "get",
            params
        })
    },
    /** 创建公告 */
    createNotice(data: Partial<Notice>) {
        return request<{ success: boolean; data: Notice }>({
            url: "/admin/notices/create",
            method: "post",
            data
        })
    },
    /** 更新公告 */
    updateNotice(id: number, data: Partial<Notice>) {
        return request<{ success: boolean; data: Notice }>({
            url: `/admin/notices/update/${id}`,
            method: "put",
            data
        })
    },
    /** 删除公告 */
    deleteNotice(id: number) {
        return request<{ success: boolean; message: string }>({
            url: `/admin/notices/delete/${id}`,
            method: "delete"
        })
    }
}
