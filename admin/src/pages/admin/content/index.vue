<script setup lang="ts">
import type { FormInstance } from "element-plus"
import type { ContentCollection, ContentItem } from "@/common/apis/admin/content"
import { Delete, Download, Edit, Plus, Promotion, Upload } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { computed, onMounted, reactive, ref, watch } from "vue"
import { contentApi } from "@/common/apis/admin/content"
import { buildExportItems, getExportMode } from "./export"

type SchemaField = {
  key: string
  label: string
  type?: "text" | "textarea" | "number"
  placeholder?: string
}

type ItemStatus = "draft" | "published" | "archived"

const COLLECTION_KEY_LABELS: Record<string, string> = {
  shanghan: "伤寒论",
  fangji: "方剂学",
  neijing: "黄帝内经",
  zhongyao: "中药学",
  jinkui: "金匮要略",
  wenbing: "温病学"
}

const STATUS_LABELS: Record<ItemStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档"
}

const ITEM_JSON_FIELD_MAP = [
  { formKey: "item_key", jsonKey: "itemKey" },
  { formKey: "title", jsonKey: "title" },
  { formKey: "chapter", jsonKey: "chapter" },
  { formKey: "section", jsonKey: "section" },
  { formKey: "group_name", jsonKey: "groupName" },
  { formKey: "level", jsonKey: "level" },
  { formKey: "clause_num", jsonKey: "clauseNum" },
  { formKey: "textbook_order", jsonKey: "textbookOrder" },
  { formKey: "sort_order", jsonKey: "sortOrder" },
  { formKey: "status", jsonKey: "status" }
] as const

const collectionList = ref<ContentCollection[]>([])
const itemList = ref<ContentItem[]>([])
const loadingCollections = ref(false)
const loadingItems = ref(false)
const selectedCollectionId = ref<number | null>(null)
const itemKeyword = ref("")
const itemPage = ref(1)
const itemPageSize = ref(20)
const itemTotal = ref(0)
const selectedItems = ref<ContentItem[]>([])

const collectionDialogVisible = ref(false)
const itemDialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEditCollection = ref(false)
const isEditItem = ref(false)
const collectionFormRef = ref<FormInstance>()
const itemFormRef = ref<FormInstance>()
const currentCollection = ref<ContentCollection | null>(null)
const currentItem = ref<ContentItem | null>(null)

const collectionForm = reactive({
  key: "",
  name: "",
  description: "",
  is_active: true,
  item_schema_text: "[]"
})

const itemForm = reactive({
  collection_id: 0,
  item_key: "",
  title: "",
  chapter: "",
  section: "",
  group_name: "",
  level: null as number | null,
  clause_num: "",
  textbook_order: null as number | null,
  sort_order: 0,
  status: "published" as ItemStatus,
  content_json_text: "{}"
})

const importForm = reactive({
  jsonText: "[]",
  showEditor: true
})

const dynamicFieldValues = reactive<Record<string, string | number | null>>({})
const editorMode = ref<"schema" | "json">("schema")
const syncingJsonFromForm = ref(false)
const syncingFormFromJson = ref(false)

const collectionRules = {
  key: [{ required: true, message: "请输入标识", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }]
}

const itemRules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content_json_text: [{ required: true, message: "请输入内容 JSON", trigger: "blur" }]
}

const selectedCollection = computed(() => {
  return collectionList.value.find(item => item.id === selectedCollectionId.value) || null
})

const schemaFields = computed<SchemaField[]>(() => {
  const schema = selectedCollection.value?.item_schema
  if (!Array.isArray(schema)) return []

  return schema
    .filter((item): item is SchemaField => Boolean(item && typeof item.key === "string"))
    .map(item => ({
      key: item.key,
      label: item.label || item.key,
      type: item.type || "text",
      placeholder: item.placeholder || ""
    }))
})

watch(selectedCollectionId, () => {
  itemPage.value = 1
  loadItems()
})

watch(schemaFields, (fields) => {
  const parsed = parseJsonObject(itemForm.content_json_text)
  resetDynamicFields(fields, parsed || {})
})

watch(
  () => [
    itemForm.item_key,
    itemForm.title,
    itemForm.chapter,
    itemForm.section,
    itemForm.group_name,
    itemForm.level,
    itemForm.clause_num,
    itemForm.textbook_order,
    itemForm.sort_order,
    itemForm.status
  ],
  () => {
    if (syncingFormFromJson.value) return
    syncJsonFromFormFields()
  }
)

watch(
  dynamicFieldValues,
  () => {
    if (syncingFormFromJson.value) return
    syncJsonFromFormFields()
  },
  { deep: true }
)

watch(
  () => itemForm.content_json_text,
  (text) => {
    if (syncingJsonFromForm.value) return
    const parsed = parseJsonObject(text)
    if (!parsed) return

    syncingFormFromJson.value = true
    try {
      syncItemFormFromJson(parsed)
      resetDynamicFields(schemaFields.value, parsed)
    } finally {
      syncingFormFromJson.value = false
    }
  }
)

function formatDate(value?: number | null) {
  if (!value) return "-"
  return new Date(value).toLocaleString()
}

function formatCollectionKey(key?: string) {
  if (!key) return "-"
  return COLLECTION_KEY_LABELS[key] || key
}

function formatStatus(status?: ItemStatus | string) {
  if (!status) return "-"
  return STATUS_LABELS[status as ItemStatus] || status
}

function parseSchemaText(text: string) {
  if (!text.trim()) return []
  const parsed = JSON.parse(text)
  return Array.isArray(parsed) ? parsed : []
}

function parseJsonObject(text: string) {
  if (!text.trim()) return {}

  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, any>
    }
  } catch {
  }

  return null
}

function getCollectionSchema(row?: ContentCollection | null) {
  return Array.isArray(row?.item_schema) ? (row?.item_schema as SchemaField[]) : []
}

function resetDynamicFields(fields: SchemaField[], source?: Record<string, any>) {
  Object.keys(dynamicFieldValues).forEach((key) => {
    delete dynamicFieldValues[key]
  })

  fields.forEach((field) => {
    const value = source?.[field.key]
    dynamicFieldValues[field.key] = value ?? (field.type === "number" ? null : "")
  })
}

function getJsonValue(source: Record<string, any>, jsonKey: string, formKey: string) {
  if (source[jsonKey] !== undefined) return source[jsonKey]
  if (source[formKey] !== undefined) return source[formKey]
  return undefined
}

function normalizeText(value: unknown) {
  if (value === null || value === undefined) return ""
  return String(value)
}

function syncItemFormFromJson(source: Record<string, any>) {
  ITEM_JSON_FIELD_MAP.forEach(({ formKey, jsonKey }) => {
    const value = getJsonValue(source, jsonKey, formKey)
    if (value === undefined) return
    ;(itemForm as Record<string, any>)[formKey] = formKey === "clause_num"
      ? normalizeText(value)
      : value
  })
}

function buildItemJsonFromCurrentForm() {
  const parsed = parseJsonObject(itemForm.content_json_text)
  const next = parsed ? { ...parsed } : {}

  ITEM_JSON_FIELD_MAP.forEach(({ formKey, jsonKey }) => {
    next[jsonKey] = (itemForm as Record<string, any>)[formKey]
  })

  schemaFields.value.forEach((field) => {
    next[field.key] = dynamicFieldValues[field.key]
  })

  return next
}

function syncJsonFromFormFields() {
  const next = buildItemJsonFromCurrentForm()
  syncingJsonFromForm.value = true
  try {
    itemForm.content_json_text = JSON.stringify(next, null, 2)
  } finally {
    syncingJsonFromForm.value = false
  }
}

async function loadCollections() {
  loadingCollections.value = true
  try {
    const res = await contentApi.getCollectionList()
    collectionList.value = Array.isArray(res.data) ? res.data : []
    if (!selectedCollectionId.value && collectionList.value.length > 0) {
      selectedCollectionId.value = collectionList.value[0].id
    } else if (selectedCollectionId.value && !collectionList.value.some(item => item.id === selectedCollectionId.value)) {
      selectedCollectionId.value = collectionList.value[0]?.id || null
    }
  } catch (error) {
    console.error("Failed to load collections:", error)
    ElMessage.error("加载内容库失败")
  } finally {
    loadingCollections.value = false
  }
}

async function loadItems() {
  if (!selectedCollectionId.value) {
    itemList.value = []
    itemTotal.value = 0
    return
  }

  loadingItems.value = true
  try {
    const res = await contentApi.getItemList({
      collectionId: selectedCollectionId.value,
      page: itemPage.value,
      pageSize: itemPageSize.value,
      keyword: itemKeyword.value.trim()
    })
    itemList.value = Array.isArray(res.data?.list) ? res.data.list : []
    itemTotal.value = Number(res.data?.total) || 0
  } catch (error) {
    console.error("Failed to load items:", error)
    ElMessage.error("加载条目失败")
  } finally {
    loadingItems.value = false
  }
}

function resetCollectionForm() {
  collectionForm.key = ""
  collectionForm.name = ""
  collectionForm.description = ""
  collectionForm.is_active = true
  collectionForm.item_schema_text = "[]"
}

async function resetItemForm() {
  itemForm.collection_id = selectedCollectionId.value || 0
  itemForm.item_key = ""
  itemForm.title = ""
  itemForm.chapter = ""
  itemForm.section = ""
  itemForm.group_name = ""
  itemForm.level = null
  itemForm.clause_num = ""
  itemForm.textbook_order = null
  itemForm.status = "published"
  itemForm.content_json_text = "{}"
  editorMode.value = schemaFields.value.length > 0 ? "schema" : "json"
  resetDynamicFields(schemaFields.value)
  
  // 自动计算排序序号（使用间隔整数法）
  if (selectedCollectionId.value) {
    try {
      const res = await contentApi.getMaxSortOrder(selectedCollectionId.value)
      const maxSortOrder = res.data || 0
      itemForm.sort_order = maxSortOrder + 100 // 使用间隔100
    } catch (error) {
      console.error("Failed to get max sort order:", error)
      itemForm.sort_order = 100 // 默认值
    }
  } else {
    itemForm.sort_order = 100 // 默认值
  }
  
  syncJsonFromFormFields()
}

function handleSelectCollection(row: ContentCollection) {
  if (!row) return
  selectedCollectionId.value = row.id
}

function handleAddCollection() {
  isEditCollection.value = false
  currentCollection.value = null
  resetCollectionForm()
  collectionDialogVisible.value = true
}

function handleEditCollection(row: ContentCollection) {
  isEditCollection.value = true
  currentCollection.value = row
  collectionForm.key = row.key
  collectionForm.name = row.name
  collectionForm.description = row.description || ""
  collectionForm.is_active = row.is_active
  collectionForm.item_schema_text = JSON.stringify(getCollectionSchema(row), null, 2)
  collectionDialogVisible.value = true
}

async function submitCollection() {
  if (!collectionFormRef.value) return

  await collectionFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      const payload = {
        key: collectionForm.key.trim(),
        name: collectionForm.name.trim(),
        description: collectionForm.description.trim(),
        is_active: collectionForm.is_active,
        item_schema: parseSchemaText(collectionForm.item_schema_text)
      }

      if (isEditCollection.value && currentCollection.value) {
        await contentApi.updateCollection(currentCollection.value.id, payload)
        ElMessage.success("内容库已更新")
      } else {
        await contentApi.createCollection(payload)
        ElMessage.success("内容库已创建")
      }

      collectionDialogVisible.value = false
      await loadCollections()
    } catch (error) {
      console.error("Failed to submit collection:", error)
      ElMessage.error("保存失败，或 Schema JSON 格式无效")
    }
  })
}

async function handleDeleteCollection(row: ContentCollection) {
  try {
    await ElMessageBox.confirm(`确定删除内容库“${row.name}”及其全部条目吗？`, "提示", { type: "warning" })
    await contentApi.deleteCollection(row.id)
    ElMessage.success("内容库已删除")
    if (selectedCollectionId.value === row.id) {
      selectedCollectionId.value = null
    }
    await loadCollections()
    await loadItems()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除内容库失败")
    }
  }
}

async function handlePublishCollection(row: ContentCollection) {
  try {
    await contentApi.publishCollection(row.id)
    ElMessage.success("内容库已发布")
    await loadCollections()
  } catch (error) {
    console.error("Failed to publish collection:", error)
    ElMessage.error("发布内容库失败")
  }
}

function handleAddItem() {
  if (!selectedCollectionId.value) {
    ElMessage.warning("请先选择内容库")
    return
  }

  isEditItem.value = false
  currentItem.value = null
  resetItemForm()
  itemDialogVisible.value = true
}

function handleEditItem(row: ContentItem) {
  isEditItem.value = true
  currentItem.value = row
  itemForm.collection_id = row.collection_id
  itemForm.item_key = row.item_key || ""
  itemForm.title = row.title || ""
  itemForm.chapter = row.chapter || ""
  itemForm.section = row.section || ""
  itemForm.group_name = row.group_name || ""
  itemForm.level = row.level
  itemForm.clause_num = normalizeText(row.clause_num)
  itemForm.textbook_order = row.textbook_order
  itemForm.sort_order = row.sort_order || 0
  itemForm.status = row.status || "published"
  itemForm.content_json_text = JSON.stringify(row.content_json || {}, null, 2)
  editorMode.value = schemaFields.value.length > 0 ? "schema" : "json"

  const parsed = parseJsonObject(itemForm.content_json_text)
  if (parsed) {
    syncItemFormFromJson(parsed)
    resetDynamicFields(schemaFields.value, parsed)
  }

  itemDialogVisible.value = true
}

function handleSwitchEditorMode(val: string | number | boolean | undefined) {
  const mode = val as "schema" | "json";
  if (mode === "json") {
    syncJsonFromFormFields()
  } else {
    const parsed = parseJsonObject(itemForm.content_json_text)
    if (parsed) {
      resetDynamicFields(schemaFields.value, parsed)
    }
  }
  editorMode.value = mode
}

async function submitItem() {
  if (!itemFormRef.value) return

  await itemFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      syncJsonFromFormFields()
      const contentJson = JSON.parse(itemForm.content_json_text || "{}")
      const payload = {
        collection_id: itemForm.collection_id,
        item_key: itemForm.item_key.trim(),
        title: itemForm.title.trim(),
        chapter: itemForm.chapter.trim(),
        section: itemForm.section.trim(),
        group_name: itemForm.group_name.trim(),
        level: itemForm.level,
        clause_num: normalizeText(itemForm.clause_num).trim(),
        textbook_order: itemForm.textbook_order,
        sort_order: itemForm.sort_order,
        status: itemForm.status,
        content_json: contentJson
      }

      if (isEditItem.value && currentItem.value) {
        await contentApi.updateItem(currentItem.value.id, payload)
        ElMessage.success("条目已更新")
      } else {
        await contentApi.createItem(payload)
        ElMessage.success("条目已创建")
      }

      itemDialogVisible.value = false
      await loadItems()
    } catch (error) {
      console.error("Failed to submit item:", error)
      ElMessage.error("JSON 格式无效，或请求失败")
    }
  })
}

async function handleDeleteItem(row: ContentItem) {
  try {
    await ElMessageBox.confirm(`确定删除条目“${row.title}”吗？`, "提示", { type: "warning" })
    await contentApi.deleteItem(row.id)
    ElMessage.success("条目已删除")
    await loadItems()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除条目失败")
    }
  }
}

function handleOpenImport() {
  if (!selectedCollectionId.value) {
    ElMessage.warning("请先选择内容库")
    return
  }
  importForm.jsonText = "[]"
  importForm.showEditor = true
  importDialogVisible.value = true
}

async function handleImportSubmit() {
  if (!selectedCollectionId.value) return

  try {
    const items = JSON.parse(importForm.jsonText || "[]")
    if (!Array.isArray(items)) {
      ElMessage.error("JSON 必须是数组")
      return
    }

    // 补偿：如果后端没有重启导致缓存，我们在发给后端之前就在前端计算好排序序号
    items.forEach((item, index) => {
      if (item.sort_order === undefined && item.sortOrder === undefined) {
        item.sort_order = (index + 1) * 100
      }
    })

    const result = await contentApi.importCollectionItems(selectedCollectionId.value, items)
    importDialogVisible.value = false
    itemPage.value = 1
    ElMessage.success("条目导入成功")
    await loadItems()

    // 如果选择了导入后显示编辑框，并且导入了至少一个条目
    if (importForm.showEditor && items.length > 0) {
      // 重新加载条目列表后，找到最后一个导入的条目并编辑
      setTimeout(async () => {
        const newItems = itemList.value.filter(item => {
          // 这里简化处理，实际应该根据导入的内容来匹配
          return items.some(importItem => item.title === importItem.title)
        })
        
        if (newItems.length > 0) {
          // 选择最后一个导入的条目进行编辑
          const lastItem = newItems[newItems.length - 1]
          handleEditItem(lastItem)
        }
      }, 500)
    }
  } catch (error) {
    console.error("Failed to import items:", error)
    ElMessage.error("JSON 格式无效，或导入失败")
  }
}

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function handleExport() {
  if (!selectedCollectionId.value || !selectedCollection.value) {
    ElMessage.warning("请先选择内容库")
    return
  }

  let exportMode = getExportMode(selectedItems.value)
  if (selectedItems.value.length > 0) {
    try {
      await ElMessageBox.confirm(
        `当前已选中 ${selectedItems.value.length} 个条目。点击“导出所选”导出选中内容，点击“导出全部”导出当前内容库全部条目。`,
        "导出 JSON",
        {
          distinguishCancelAndClose: true,
          confirmButtonText: "导出所选",
          cancelButtonText: "导出全部",
          type: "info"
        }
      )
      exportMode = "selected"
    } catch (error) {
      if (error === "cancel") {
        exportMode = "all"
      } else {
        return
      }
    }
  }

  try {
    const ids = exportMode === "selected" ? selectedItems.value.map(item => item.id) : undefined
    const res = await contentApi.exportCollectionItems(selectedCollectionId.value, ids)
    const list = Array.isArray(res.data?.list) ? res.data.list : []
    const exported = buildExportItems(list)

    if (exported.length === 0) {
      ElMessage.warning("没有可导出的条目")
      return
    }

    const suffix = exportMode === "selected" ? `selected-${exported.length}` : "all"
    downloadJsonFile(`${selectedCollection.value.key}-${suffix}.json`, exported)
    ElMessage.success(exportMode === "selected" ? "已导出所选条目" : "已导出全部条目")
  } catch (error) {
    console.error("Failed to export items:", error)
    ElMessage.error("导出 JSON 失败")
  }
}

async function handleResetSortOrder() {
  if (!selectedCollectionId.value || !selectedCollection.value) {
    ElMessage.warning("请先选择内容库")
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定将“${selectedCollection.value.name}”当前顺序重置为 100、200、300 吗？`,
      "重置排序",
      { type: "warning" }
    )

    const res = await contentApi.resetCollectionSortOrder(selectedCollectionId.value)
    const updatedCount = Number(res.data?.updated_count) || 0
    ElMessage.success(`已重置 ${updatedCount} 个条目的排序`)
    await loadItems()
  } catch (error) {
    if (error !== "cancel") {
      console.error("Failed to reset sort order:", error)
      ElMessage.error("重置排序失败")
    }
  }
}

function handleSearch() {
  itemPage.value = 1
  loadItems()
}

function handlePageChange(page: number) {
  itemPage.value = page
  loadItems()
}

function handlePageSizeChange(size: number) {
  itemPageSize.value = size
  itemPage.value = 1
  loadItems()
}

async function handleRowDragend(newIndex: number, oldIndex: number) {
  const item = itemList.value[oldIndex]
  const targetItem = itemList.value[newIndex]
  
  // 计算新的排序序号（使用间隔整数法）
  let newSortOrder: number
  if (newIndex < oldIndex) {
    // 向上移动
    const prevItem = itemList.value[newIndex - 1]
    if (prevItem) {
      newSortOrder = Math.floor((prevItem.sort_order + targetItem.sort_order) / 2)
    } else {
      newSortOrder = targetItem.sort_order - 50
    }
  } else {
    // 向下移动
    const nextItem = itemList.value[newIndex + 1]
    if (nextItem) {
      newSortOrder = Math.floor((targetItem.sort_order + nextItem.sort_order) / 2)
    } else {
      newSortOrder = targetItem.sort_order + 50
    }
  }
  
  try {
    await contentApi.updateItemSortOrder(item.id, newSortOrder)
    ElMessage.success("排序已更新")
    await loadItems()
  } catch (error) {
    console.error("Failed to update sort order:", error)
    ElMessage.error("更新排序失败")
  }
}

function handleSelectionChange(selection: ContentItem[]) {
  selectedItems.value = selection
}

async function handleBatchDelete() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("请选择要删除的条目")
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedItems.value.length} 个条目吗？`, "提示", { type: "warning" })
    
    const ids = selectedItems.value.map(item => item.id)
    await contentApi.batchDeleteItems(ids)
    
    ElMessage.success("批量删除成功")
    await loadItems()
    selectedItems.value = []
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("批量删除失败")
    }
  }
}

onMounted(async () => {
  await loadCollections()
  await loadItems()
})
</script>

<template>
  <div class="content-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card v-loading="loadingCollections" class="panel-card">
          <template #header>
            <div class="panel-header">
              <span>内容库列表</span>
              <el-button type="primary" @click="handleAddCollection">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
          </template>

          <el-table
            :data="collectionList"
            border
            stripe
            highlight-current-row
            row-key="id"
            @current-change="handleSelectCollection"
          >
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="标识" min-width="120">
              <template #default="{ row }">
                <span :title="row.key">{{ formatCollectionKey(row.key) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="140" />
            <el-table-column label="版本" width="90">
              <template #default="{ row }">
                {{ row.version }}
              </template>
            </el-table-column>
            <el-table-column label="启用" width="80">
              <template #default="{ row }">
                <el-tag :type="row.is_active ? 'success' : 'info'">
                  {{ row.is_active ? "是" : "否" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click.stop="handleEditCollection(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="success" link @click.stop="handlePublishCollection(row)">
                  <el-icon><Promotion /></el-icon>
                </el-button>
                <el-button type="danger" link @click.stop="handleDeleteCollection(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="24">
        <el-card v-loading="loadingItems" class="panel-card">
          <template #header>
            <div class="panel-header">
              <span>条目列表: {{ selectedCollection ? formatCollectionKey(selectedCollection.key) : "" }}</span>
              <div class="header-actions">
                <el-input
                  v-model="itemKeyword"
                  placeholder="搜索标题/正文"
                  clearable
                  class="search-input"
                  @keyup.enter="handleSearch"
                />
                <el-button @click="handleSearch">搜索</el-button>
                <el-button 
                  type="danger" 
                  :disabled="selectedItems.length === 0"
                  @click="handleBatchDelete"
                >
                  批量删除
                </el-button>
                <el-button @click="handleResetSortOrder">
                  重置排序
                </el-button>
                <el-button type="warning" @click="handleOpenImport">
                  <el-icon><Upload /></el-icon>
                  导入 JSON
                </el-button>
                <el-button type="success" @click="handleExport">
                  <el-icon><Download /></el-icon>
                  导出 JSON
                </el-button>
                <el-button type="primary" @click="handleAddItem">
                  <el-icon><Plus /></el-icon>
                  新增条目
                </el-button>
              </div>
            </div>
          </template>

          <el-table 
            :data="itemList" 
            border 
            stripe
            row-key="id"
            @row-dragend="handleRowDragend"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="chapter" label="章节" min-width="120" show-overflow-tooltip />
            <el-table-column prop="section" label="小节" min-width="120" show-overflow-tooltip />
            <el-table-column prop="clause_num" label="条文号" width="90" />
            <el-table-column prop="sort_order" label="排序" width="80" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'info'">
                  {{ formatStatus(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.update_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleEditItem(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="danger" link @click="handleDeleteItem(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrap">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="itemTotal"
              :page-size="itemPageSize"
              :current-page="itemPage"
              :page-sizes="[20, 50, 100, 200]"
              @current-change="handlePageChange"
              @size-change="handlePageSizeChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="collectionDialogVisible" :title="isEditCollection ? '编辑内容库' : '新增内容库'" width="640px">
      <el-form ref="collectionFormRef" :model="collectionForm" :rules="collectionRules" label-width="100px">
        <el-form-item label="标识" prop="key">
          <el-input v-model="collectionForm.key" placeholder="例如: shanghan" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="collectionForm.name" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="collectionForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="条目 Schema">
          <el-input v-model="collectionForm.item_schema_text" type="textarea" :rows="10" />
          <div class="form-tip">
            JSON 数组，例如
            <code>[{"key":"text","label":"正文","type":"textarea"}]</code>
          </div>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="collectionForm.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="collectionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCollection">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="itemDialogVisible" :title="isEditItem ? '编辑条目' : '新增条目'" width="860px">
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-width="120px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="itemForm.title" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="条目标识">
              <el-input v-model="itemForm.item_key" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="条文号">
              <el-input v-model="itemForm.clause_num" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="章节">
              <el-input v-model="itemForm.chapter" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="小节">
              <el-input v-model="itemForm.section" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="分组">
              <el-input v-model="itemForm.group_name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="级别">
              <el-input-number v-model="itemForm.level" :min="1" :max="9" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="itemForm.sort_order" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="课本顺序">
              <el-input-number v-model="itemForm.textbook_order" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="itemForm.status" class="full-width">
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="schemaFields.length > 0" label="编辑模式">
          <el-radio-group v-model="editorMode" @change="handleSwitchEditorMode">
            <el-radio-button label="schema">结构化编辑</el-radio-button>
            <el-radio-button label="json">JSON编辑</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <template v-if="schemaFields.length > 0 && editorMode === 'schema'">
          <el-form-item v-for="field in schemaFields" :key="field.key" :label="field.label">
            <el-input-number
              v-if="field.type === 'number'"
              v-model="dynamicFieldValues[field.key]"
              class="full-width"
            />
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="dynamicFieldValues[field.key]"
              type="textarea"
              :rows="4"
              :placeholder="field.placeholder || ''"
            />
            <el-input
              v-else
              v-model="dynamicFieldValues[field.key]"
              :placeholder="field.placeholder || ''"
            />
          </el-form-item>
        </template>

        <el-form-item v-if="editorMode === 'json' || schemaFields.length === 0" label="内容 JSON" prop="content_json_text">
          <el-input v-model="itemForm.content_json_text" type="textarea" :rows="16" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItem">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="导入条文" width="860px">
      <el-form ref="importFormRef" :model="importForm" label-width="120px">
        <el-form-item label="JSON 数据">
          <el-input v-model="importForm.jsonText" type="textarea" :rows="12" placeholder="请输入 JSON 数组格式的数据" />
          <div class="form-tip">
            示例格式：
            <code>[{"title": "条文标题", "chapter": "章节", "text": "条文内容"}]</code>
          </div>
        </el-form-item>
        <el-form-item label="导入选项">
          <el-checkbox v-model="importForm.showEditor">导入后显示编辑框</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.content-page {
  padding: 20px;
}

.panel-card {
  min-height: 680px;
}

.panel-card:first-child {
  min-height: auto;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
}

.full-width {
  width: 100%;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.form-tip code {
  white-space: pre-wrap;
}
</style>
