export type ChangeLogItem = {
  version: string
  date: string
  content: string
}

export type LinkItem = {
  label: string
  url: string
}

export type MiniappAboutForm = {
  title: string
  subtitle: string
  version: string
  releaseDate: string
  releaseNotes: string
  contactEmail: string
  website: string
  entryTitle: string
  entrySubtitle: string
  changelog: ChangeLogItem[]
}

export type AuthorAboutForm = {
  name: string
  signature: string
  avatar: string
  heroImage: string
  bio: string
  wechatLabel: string
  wechatNote: string
  wechatQrCode: string
  message: string
  cooperation: string
  entryTitle: string
  entrySubtitle: string
  links: LinkItem[]
}

export const createMiniappDefaults = (): MiniappAboutForm => ({
  title: "山药铭记",
  subtitle: "面向中医学习者的记忆与背诵助手",
  version: "1.0.0",
  releaseDate: "",
  releaseNotes: "持续优化学习体验与内容管理流程。",
  contactEmail: "",
  website: "",
  entryTitle: "关于山药铭记",
  entrySubtitle: "版本信息与更新动态",
  changelog: [
    { version: "1.0.0", date: "", content: "初始版本上线" }
  ]
})

export const createAuthorDefaults = (): AuthorAboutForm => ({
  name: "山药铭记作者",
  signature: "把复杂内容变成更容易记住的知识。",
  avatar: "",
  heroImage: "",
  bio: "专注于中医学习体验与记忆方法设计。",
  wechatLabel: "添加作者微信",
  wechatNote: "如需交流、合作或反馈建议，可通过微信联系。",
  wechatQrCode: "",
  message: "",
  cooperation: "",
  entryTitle: "关于作者",
  entrySubtitle: "作者简介与联系方式",
  links: [
    { label: "", url: "" }
  ]
})

export function sanitizeMiniappAboutPayload(value: Partial<MiniappAboutForm> & Record<string, any>): MiniappAboutForm {
  return {
    entryTitle: String(value.entryTitle || ""),
    entrySubtitle: String(value.entrySubtitle || ""),
    title: String(value.title || ""),
    subtitle: String(value.subtitle || ""),
    version: String(value.version || ""),
    releaseDate: String(value.releaseDate || ""),
    releaseNotes: String(value.releaseNotes || ""),
    contactEmail: String(value.contactEmail || ""),
    website: String(value.website || ""),
    changelog: Array.isArray(value.changelog)
      ? value.changelog.map(item => ({
          version: String(item?.version || ""),
          date: String(item?.date || ""),
          content: String(item?.content || "")
        }))
      : []
  }
}

export function sanitizeAuthorAboutPayload(value: Partial<AuthorAboutForm> & Record<string, any>): AuthorAboutForm {
  return {
    entryTitle: String(value.entryTitle || ""),
    entrySubtitle: String(value.entrySubtitle || ""),
    name: String(value.name || ""),
    signature: String(value.signature || ""),
    avatar: String(value.avatar || ""),
    heroImage: String(value.heroImage || ""),
    bio: String(value.bio || ""),
    wechatLabel: String(value.wechatLabel || ""),
    wechatNote: String(value.wechatNote || ""),
    wechatQrCode: String(value.wechatQrCode || ""),
    message: String(value.message || ""),
    cooperation: String(value.cooperation || ""),
    links: Array.isArray(value.links)
      ? value.links.map(item => ({
          label: String(item?.label || ""),
          url: String(item?.url || "")
        }))
      : []
  }
}
