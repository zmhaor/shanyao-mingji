import type { ContentItem } from "@/common/apis/admin/content"

export type ExportMode = "all" | "selected"

export function getExportMode(selectedItems: ContentItem[]) {
  return selectedItems.length > 0 ? "selected" : "all"
}

export function buildExportItems(items: ContentItem[]) {
  return items.map((item) => {
    const source: Record<string, any> = item.content_json && typeof item.content_json === "object"
      ? { ...item.content_json }
      : {}

    return {
      ...source,
      itemKey: item.item_key || source.itemKey || source.item_key,
      title: item.title || source.title,
      chapter: item.chapter || source.chapter,
      section: item.section || source.section,
      groupName: item.group_name || source.groupName || source.group_name,
      level: item.level ?? source.level,
      clauseNum: item.clause_num || source.clauseNum || source.clause_num,
      textbookOrder: item.textbook_order ?? source.textbookOrder ?? source.textbook_order,
      sortOrder: item.sort_order ?? source.sortOrder ?? source.sort_order,
      status: item.status || source.status
    }
  })
}
