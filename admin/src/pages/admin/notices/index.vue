<script setup lang="ts">
import { onMounted, ref, reactive } from "vue"
import { type FormInstance } from "element-plus"
import { noticeApi, type Notice } from "@/common/apis/admin/notices"

const noticeList = ref<Notice[]>([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<Partial<Notice>>({
  title: "",
  content: "",
  type: "popup",
  isActive: true
})

const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入内容", trigger: "blur" }]
}

async function loadNotices() {
  loading.value = true
  try {
    const res = await noticeApi.getNoticeList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    })
    noticeList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error("加载公告列表失败")
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.id = undefined
  form.title = ""
  form.content = ""
  form.type = "popup"
  form.isActive = true
  dialogVisible.value = true
}

function handleEdit(row: Notice) {
  isEdit.value = true
  form.id = row.id
  form.title = row.title
  form.content = row.content
  form.type = row.type
  form.isActive = row.isActive
  dialogVisible.value = true
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm("确定要删除该公告吗？", "提示", { type: "warning" })
    await noticeApi.deleteNotice(id)
    ElMessage.success("删除成功")
    loadNotices()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && form.id) {
          await noticeApi.updateNotice(form.id, form)
          ElMessage.success("更新成功")
        } else {
          await noticeApi.createNotice(form)
          ElMessage.success("创建成功")
        }
        dialogVisible.value = false
        loadNotices()
      } catch (error) {
        ElMessage.error(isEdit.value ? "更新失败" : "创建失败")
      }
    }
  })
}

async function toggleActive(row: Notice) {
  try {
    await noticeApi.updateNotice(row.id, { isActive: row.isActive })
    ElMessage.success(row.isActive ? "已启用" : "已禁用")
  } catch (error) {
    row.isActive = !row.isActive
    ElMessage.error("操作失败")
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

onMounted(() => {
  loadNotices()
})
</script>

<template>
  <div class="notice-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公告管理</span>
          <el-button type="primary" @click="handleAdd">发布公告</el-button>
        </div>
      </template>

      <el-table :data="noticeList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'scroll' ? 'success' : 'warning'">
              {{ row.type === 'scroll' ? '滚动公告' : '弹窗公告' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" @change="toggleActive(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="confirmed_count" label="已确认人数" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.confirmed_count || 0 }} 人</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="loadNotices"
        @size-change="loadNotices"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '发布公告'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="公告类型">
          <el-radio-group v-model="form.type">
            <el-radio value="popup">弹窗公告</el-radio>
            <el-radio value="scroll">滚动公告</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.notice-manage {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
