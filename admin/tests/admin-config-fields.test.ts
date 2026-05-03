import { describe, expect, it } from "vitest"
import {
  sanitizeAuthorAboutPayload,
  sanitizeMiniappAboutPayload
} from "@/pages/admin/config/form"

describe("admin config payload sanitizers", () => {
  it("drops unused miniapp about fields before saving", () => {
    const payload = sanitizeMiniappAboutPayload({
      entryTitle: "关于山药铭记",
      entrySubtitle: "版本信息与更新动态",
      title: "山药铭记",
      subtitle: "面向中医学习者",
      version: "1.2.3",
      releaseDate: "2026-04-24",
      releaseNotes: "更新说明",
      contactEmail: "hi@example.com",
      website: "https://example.com",
      changelog: [{ version: "1.2.3", date: "2026-04-24", content: "更新说明" }],
      coverImage: "https://example.com/cover.png",
      summary: "不再使用",
      highlights: ["不再使用"]
    })

    expect(payload).toEqual({
      entryTitle: "关于山药铭记",
      entrySubtitle: "版本信息与更新动态",
      title: "山药铭记",
      subtitle: "面向中医学习者",
      version: "1.2.3",
      releaseDate: "2026-04-24",
      releaseNotes: "更新说明",
      contactEmail: "hi@example.com",
      website: "https://example.com",
      changelog: [{ version: "1.2.3", date: "2026-04-24", content: "更新说明" }]
    })
  })

  it("keeps author about fields that are still used by the miniapp", () => {
    const payload = sanitizeAuthorAboutPayload({
      entryTitle: "关于作者",
      entrySubtitle: "作者简介与联系方式",
      name: "作者",
      signature: "签名",
      avatar: "avatar.png",
      heroImage: "hero.png",
      bio: "简介",
      wechatLabel: "添加微信",
      wechatNote: "备注",
      wechatQrCode: "qr.png",
      message: "寄语",
      cooperation: "合作说明",
      links: [{ label: "主页", url: "https://example.com" }],
      extraField: "should be removed"
    })

    expect(payload).toEqual({
      entryTitle: "关于作者",
      entrySubtitle: "作者简介与联系方式",
      name: "作者",
      signature: "签名",
      avatar: "avatar.png",
      heroImage: "hero.png",
      bio: "简介",
      wechatLabel: "添加微信",
      wechatNote: "备注",
      wechatQrCode: "qr.png",
      message: "寄语",
      cooperation: "合作说明",
      links: [{ label: "主页", url: "https://example.com" }]
    })
  })
})
