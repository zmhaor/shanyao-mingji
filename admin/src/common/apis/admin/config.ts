import { request } from "@/http"

const CONFIG_KEYS = {
  auditMode: "audit_mode",
  miniappAbout: "miniapp_about_info",
  authorAbout: "author_about_info"
} as const

const configApi = {
  /**
   * 获取配置
   */
  get: (key: string) => {
    return request({ url: `/admin/config/${key}`, method: "GET" })
  },

  /**
   * 更新配置
   */
  update: (data: {
    key: string
    value: string
    description?: string
  }) => {
    return request({ url: "/admin/config", method: "POST", data })
  },

  getAuditMode: () => {
    return configApi.get(CONFIG_KEYS.auditMode)
  },

  getMiniappAbout: () => {
    return configApi.get(CONFIG_KEYS.miniappAbout)
  },

  getAuthorAbout: () => {
    return configApi.get(CONFIG_KEYS.authorAbout)
  },

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return request({
      url: "/admin/config/upload",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
  }
}

export { CONFIG_KEYS, configApi }
