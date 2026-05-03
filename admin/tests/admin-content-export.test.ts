import { describe, expect, it } from "vitest"
import { buildExportItems, getExportMode } from "@/pages/admin/content/export"
import type { ContentItem } from "@/common/apis/admin/content"

function createItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 1,
    collection_id: 10,
    item_key: "item-1",
    title: "太阳病提纲",
    chapter: "太阳病",
    section: "上篇",
    group_name: "辨太阳病脉证并治",
    level: 1,
    clause_num: "1",
    textbook_order: 100,
    sort_order: 200,
    status: "published",
    content_json: {
      title: "来自 JSON 的标题",
      text: "条文正文"
    },
    ...overrides
  }
}

describe("admin content export helpers", () => {
  it("prefers selected export mode when items are checked", () => {
    expect(getExportMode([createItem()])).toBe("selected")
    expect(getExportMode([])).toBe("all")
  })

  it("builds import-compatible export rows from content_json and base fields", () => {
    const rows = buildExportItems([
      createItem({
        content_json: {
          title: "来自 JSON 的标题",
          chapter: "来自 JSON 的章节",
          text: "条文正文"
        }
      })
    ])

    expect(rows).toEqual([
      {
        itemKey: "item-1",
        title: "太阳病提纲",
        chapter: "太阳病",
        section: "上篇",
        groupName: "辨太阳病脉证并治",
        level: 1,
        clauseNum: "1",
        textbookOrder: 100,
        sortOrder: 200,
        status: "published",
        text: "条文正文"
      }
    ])
  })

  it("falls back to row fields when content_json is missing", () => {
    const rows = buildExportItems([
      createItem({
        content_json: {}
      })
    ])

    expect(rows[0]).toMatchObject({
      itemKey: "item-1",
      title: "太阳病提纲",
      chapter: "太阳病",
      section: "上篇",
      groupName: "辨太阳病脉证并治",
      clauseNum: "1",
      textbookOrder: 100,
      sortOrder: 200,
      status: "published"
    })
  })
})
