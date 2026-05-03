import { request } from "@/http/axios"

export interface FeedbackReply {
    id: number
    feedback_id: number
    user_id: string | null
    admin_id: number | null
    content: string
    create_time: number
    replier?: {
        nick_name: string
        avatar_url: string
        is_admin: boolean
        user_id?: string
    } | null
}

export interface Feedback {
    id: number
    user_id: string | null
    content: string
    contact: string | null
    status: string
    likes: number
    replyCount?: number
    create_time: number
    avatarUrl?: string
    nickName?: string
    user?: {
        nick_name: string
        avatar_url: string
        user_id: string
    }
    replies?: FeedbackReply[]
}

export interface FeedbackListResponse {
    total: number
    list: Feedback[]
    page: number
    pageSize: number
}

export function getFeedbackList(params: { page: number; pageSize: number; status?: string }) {
    return request<{ success: boolean; message: string; data: FeedbackListResponse }>({
        url: "/admin/feedback/list",
        method: "get",
        params
    })
}

export function updateFeedbackStatus(id: number, status: string) {
    return request<{ success: boolean; message: string }>({
        url: `/admin/feedback/status/${id}`,
        method: "put",
        data: { status }
    })
}

export function getFeedbackDetail(id: number) {
    return request<{ success: boolean; message: string; data: Feedback }>({
        url: `/admin/feedback/detail/${id}`,
        method: "get"
    })
}

export function replyFeedback(data: { feedback_id: number; content: string }) {
    return request<{ success: boolean; message: string; data: FeedbackReply }>({
        url: "/admin/feedback/reply",
        method: "post",
        data
    })
}

export function deleteFeedback(id: number) {
    return request<{ success: boolean; message: string }>({
        url: `/admin/feedback/${id}`,
        method: "delete"
    })
}

export const feedbackApi = {
    getFeedbackList,
    updateFeedbackStatus,
    getFeedbackDetail,
    replyFeedback,
    deleteFeedback
}
