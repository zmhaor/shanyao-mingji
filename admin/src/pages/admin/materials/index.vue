<script setup lang="ts">
import type { FormInstance, UploadUserFile } from "element-plus"
import type { MaterialItem } from "@/common/apis/admin/materials"
import { Delete, Edit, Plus, UploadFilled } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { materialApi } from "@/common/apis/admin/materials"

type PreviewUploadFile = UploadUserFile & {
  materialUrl?: string
}

const FILE_BASE_URL = import.meta.env.VITE_BASE_URL?.replace('/api', '') || ''

const materialList = ref<MaterialItem[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentItem = ref<MaterialItem | null>(null)
const formRef = ref<FormInstance>()
const selectedFile = ref<File | null>(null)
const fileList = ref<UploadUserFile[]>([])
const previewImageList = ref<PreviewUploadFile[]>([])

const form = reactive({
  title: "",
  description: "",
  sort_order: 0,
  points_required: 0,
  is_active: true
})

const rules = {
  title: [{ required: true, message: "请输入资料标题", trigger: "blur" }]
}

function resolveFileUrl(url?: string) {
  if (!url) return ""
  return url.startsWith("/uploads") ? `${FILE_BASE_URL}${url}` : url
}

function resetForm() {
  form.title = ""
  form.description = ""
  form.sort_order = 0
  form.points_required = 0
  form.is_active = true
  selectedFile.value = null
  fileList.value = []
  previewImageList.value = []
}

async function loadMaterials() {
  loading.value = true
  try {
    const res = await materialApi.getMaterialList()
    materialList.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error("加载资料列表失败:", error)
    ElMessage.error("加载资料列表失败")
    materialList.value = []
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  currentItem.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row: MaterialItem) {
  isEdit.value = true
  currentItem.value = row
  form.title = row.title
  form.description = row.description || ""
  form.sort_order = row.sort_order || 0
  form.points_required = row.points_required || 0
  form.is_active = row.is_active
  selectedFile.value = null
  fileList.value = [
    {
      name: row.file_name,
      url: resolveFileUrl(row.file_url)
    }
  ]
  previewImageList.value = (row.preview_images || []).map((url, index) => ({
    name: `预览图${index + 1}`,
    url: resolveFileUrl(url),
    materialUrl: url
  }))
  dialogVisible.value = true
}

function handleFileChange(uploadFile: UploadUserFile, uploadFiles: UploadUserFile[]) {
  fileList.value = uploadFiles.slice(-1)
  selectedFile.value = uploadFile.raw || null
}

function handleFileRemove() {
  fileList.value = []
  selectedFile.value = null
}

function syncPreviewImageList(uploadFiles: UploadUserFile[]) {
  previewImageList.value = uploadFiles.slice(-2).map((file) => file as PreviewUploadFile)
}

function handlePreviewImageChange(_uploadFile: UploadUserFile, uploadFiles: UploadUserFile[]) {
  syncPreviewImageList(uploadFiles)
}

function handlePreviewImageRemove(_uploadFile: UploadUserFile, uploadFiles: UploadUserFile[]) {
  syncPreviewImageList(uploadFiles)
}

function getExistingPreviewUrls() {
  return previewImageList.value
    .filter((file) => !file.raw && file.materialUrl)
    .map((file) => file.materialUrl || "")
    .filter(Boolean)
}

function getPreviewFiles() {
  return previewImageList.value
    .map((file) => file.raw)
    .filter(Boolean) as File[]
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }

    if (!isEdit.value && !selectedFile.value) {
      ElMessage.warning("请先上传资料文件")
      return
    }

    submitLoading.value = true
    try {
      const payload = {
        title: form.title,
        description: form.description,
        sort_order: form.sort_order,
        points_required: form.points_required,
        is_active: form.is_active,
        file: selectedFile.value || undefined,
        preview_files: getPreviewFiles(),
        existing_preview_urls: getExistingPreviewUrls()
      }

      if (isEdit.value && currentItem.value) {
        await materialApi.updateMaterial(currentItem.value.id, payload)
        ElMessage.success("资料更新成功")
      } else {
        await materialApi.createMaterial(payload)
        ElMessage.success("资料创建成功")
      }

      dialogVisible.value = false
      resetForm()
      loadMaterials()
    } catch (error) {
      console.error("提交资料失败:", error)
      ElMessage.error(isEdit.value ? "资料更新失败" : "资料创建失败")
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(row: MaterialItem) {
  try {
    await ElMessageBox.confirm(`确定删除资料“${row.title}”吗？`, "提示", { type: "warning" })
    await materialApi.deleteMaterial(row.id)
    ElMessage.success("资料删除成功")
    loadMaterials()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("资料删除失败")
    }
  }
}

async function handleStatusChange(row: MaterialItem) {
  try {
    await materialApi.updateMaterial(row.id, {
      title: row.title,
      description: row.description || "",
      sort_order: row.sort_order || 0,
      points_required: row.points_required || 0,
      is_active: row.is_active,
      existing_preview_urls: row.preview_images || []
    })
    ElMessage.success(row.is_active ? "资料已上架" : "资料已下架")
  } catch (error) {
    row.is_active = !row.is_active
    ElMessage.error("状态更新失败")
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

function formatSize(size: number) {
  if (!size) return "-"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

onMounted(() => {
  loadMaterials()
})
</script>

<template>
  <div class="material-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资料管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增资料
          </el-button>
        </div>
      </template>

      <el-table :data="materialList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="资料标题" min-width="180" />
        <el-table-column prop="file_name" label="文件名" min-width="220" show-overflow-tooltip />
        <el-table-column label="大小" width="110" align="center">
          <template #default="{ row }">
            {{ formatSize(row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column label="预览图" width="100" align="center">
          <template #default="{ row }">
            {{ row.preview_images?.length || 0 }} 张
          </template>
        </el-table-column>
        <el-table-column prop="points_required" label="兑换积分" width="100" align="center" />
        <el-table-column prop="download_count" label="下载次数" width="100" align="center" />
        <el-table-column prop="sort_order" label="排序" width="90" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.is_active" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑资料' : '新增资料'" width="620px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="资料标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入资料标题" />
        </el-form-item>
        <el-form-item label="资料描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入资料描述" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="兑换积分">
          <el-input-number v-model="form.points_required" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="form.is_active" active-text="上架" inactive-text="下架" />
        </el-form-item>
        <el-form-item :label="isEdit ? '替换文件' : '上传文件'">
          <el-upload
            class="upload-block"
            drag
            :auto-upload="false"
            :limit="1"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到这里，或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">
                支持常见文档资料，单个文件最大 50MB。编辑时不重新上传则保留原文件。
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="预览前两页">
          <el-upload
            class="preview-upload"
            list-type="picture-card"
            accept="image/*"
            :auto-upload="false"
            :limit="2"
            :file-list="previewImageList"
            :on-change="handlePreviewImageChange"
            :on-remove="handlePreviewImageRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            上传资料前两页截图，最多 2 张；不上传则小程序端无法预览。
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.material-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-block {
  width: 100%;
}

.preview-upload {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin-top: 8px;
}
</style>
