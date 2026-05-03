<script setup lang="ts">
import type { Tool } from "@/common/apis/admin/tools"
import { Check, Delete, Edit, Plus, Refresh, SwitchButton, Upload } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus"
import { onMounted, reactive, ref } from "vue"
import { toolApi } from "@/common/apis/admin/tools"

const toolList = ref<Tool[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const initLoading = ref(false)

// 新增/编辑相关状态
const dialogVisible = ref(false)
const dialogTitle = ref("新增工具")
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()
const form = reactive({
  name: "",
  description: "",
  category: "学习助手",
  content: "",
  status: "active" as "active" | "inactive"
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: "请输入工具名称", trigger: "blur" }]
})

function handleAdd() {
  form.name = ""
  form.description = ""
  form.category = "学习助手"
  form.content = ""
  form.status = "active"
  dialogTitle.value = "新增工具"
  editingId.value = null
  dialogVisible.value = true
}

function handleEdit(row: Tool) {
  form.name = row.name
  form.description = row.description
  form.category = row.category
  form.content = row.content || ""
  form.status = row.status
  dialogTitle.value = "编辑工具"
  editingId.value = row.id
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (editingId.value) {
          await toolApi.updateTool(editingId.value, { ...form })
          ElMessage.success("修改工具成功")
        } else {
          await toolApi.createTool({ ...form })
          ElMessage.success("添加工具成功")
        }
        dialogVisible.value = false
        loadTools() // 刷新列表
      } catch (error) {
        ElMessage.error(editingId.value ? "修改工具失败" : "添加工具失败")
      } finally {
        submitLoading.value = false
      }
    }
  })
}

async function loadTools() {
  loading.value = true
  try {
    const res = await toolApi.getToolList({ page: 1, pageSize: 100 })
    console.log('获取工具列表响应:', res)
    if (res.data && res.data.tools) {
      toolList.value = res.data.tools
    } else {
      toolList.value = []
    }
  } catch (error) {
    console.error('加载工具列表失败:', error)
    ElMessage.error("加载工具列表失败")
  } finally {
    loading.value = false
  }
}

async function handleToggleStatus(row: Tool) {
  submitLoading.value = true
  try {
    const newStatus = row.status === "active" ? "inactive" : "active"
    await toolApi.updateToolStatus(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success(row.status === "active" ? "上架成功" : "下架成功")
  } catch (error) {
    ElMessage.error("操作失败")
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: Tool) {
  try {
    submitLoading.value = true
    await toolApi.deleteTool(row.id)
    ElMessage.success("删除工具成功")
    await loadTools()
  } catch (error) {
    console.error("删除工具失败:", error)
    ElMessage.error("删除工具失败")
  } finally {
    submitLoading.value = false
  }
}

async function initTools() {
  initLoading.value = true
  try {
    await toolApi.initTools()
    ElMessage.success("工具数据初始化成功")
    await loadTools()
  } catch (error) {
    ElMessage.error("初始化工具数据失败")
  } finally {
    initLoading.value = false
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

onMounted(() => {
  loadTools()
})
</script>

<template>
  <div class="tool-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工具管理</span>
          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 新增工具
            </el-button>
            <el-button @click="initTools" :loading="initLoading" style="margin-left: 10px">
              <el-icon><Upload /></el-icon> 初始化工具
            </el-button>
            <el-button @click="loadTools" style="margin-left: 10px">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="toolList" v-loading="loading">
        <el-table-column prop="id" label="工具ID" width="100" />
        <el-table-column prop="name" label="工具名称" width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="usageCount" label="使用次数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(row)"
              :loading="submitLoading"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
              :loading="submitLoading"
            >
              <el-icon v-if="row.status === 'active'">
                <SwitchButton />
              </el-icon>
              <el-icon v-else>
                <Check />
              </el-icon>
              {{ row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-popconfirm
              title="确定要永久删除该工具吗？此操作不可恢复。"
              confirm-button-text="确定删除"
              cancel-button-text="取消"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  size="small"
                  type="danger"
                  :loading="submitLoading"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="工具名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入工具名称，如'中药学'" />
        </el-form-item>
        <el-form-item label="默认状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">立即上架</el-radio>
            <el-radio label="inactive">暂不上架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-divider>高级选项（选填）</el-divider>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="选填，前端已有默认描述" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="选填，默认学习助手">
            <el-option label="学习助手" value="学习助手" />
            <el-option label="效率工具" value="效率工具" />
            <el-option label="记忆训练" value="记忆训练" />
            <el-option label="实用工具" value="实用工具" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="submitLoading">
            {{ editingId ? '保存修改' : '确认添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.tool-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
