<script setup lang="ts">
import type { Category } from "@/common/apis/admin/categories/type"
import { Check, Delete, Edit, Plus, Refresh, SwitchButton } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, ref } from "vue"
import { categoryApi } from "@/common/apis/admin/categories"

const categoryList = ref<Category[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref("添加分类")
const currentCategory = ref<Partial<Category>>({
  name: "",
  icon: "📁",
  order: 0,
  status: "active"
})

// 加载分类列表
async function loadCategories() {
  loading.value = true
  try {
    const res = await categoryApi.getCategoryList()
    console.log('获取分类列表响应:', res)
    if (res.data && res.data.categories) {
      categoryList.value = res.data.categories
    } else {
      categoryList.value = []
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
    ElMessage.error("加载分类列表失败")
  } finally {
    loading.value = false
  }
}

// 打开添加分类对话框
function openAddDialog() {
  dialogTitle.value = "添加分类"
  currentCategory.value = {
    name: "",
    icon: "📁",
    order: 0,
    status: "active"
  }
  dialogVisible.value = true
}

// 打开编辑分类对话框
function openEditDialog(category: Category) {
  dialogTitle.value = "编辑分类"
  currentCategory.value = { ...category }
  dialogVisible.value = true
}

// 保存分类
async function saveCategory() {
  if (!currentCategory.value.name) {
    ElMessage.warning("分类名称不能为空")
    return
  }

  submitLoading.value = true
  try {
    if (currentCategory.value.id) {
      // 更新分类
      await categoryApi.updateCategory(currentCategory.value.id, {
        name: currentCategory.value.name,
        icon: currentCategory.value.icon,
        order: currentCategory.value.order,
        status: currentCategory.value.status
      })
      ElMessage.success("分类更新成功")
    } else {
      // 创建分类
      await categoryApi.createCategory({
        name: currentCategory.value.name,
        icon: currentCategory.value.icon,
        order: currentCategory.value.order,
        status: currentCategory.value.status
      })
      ElMessage.success("分类创建成功")
    }
    dialogVisible.value = false
    await loadCategories()
  } catch (error: any) {
    console.error('保存分类失败:', error)
    ElMessage.error(error.response?.data?.message || "保存分类失败")
  } finally {
    submitLoading.value = false
  }
}

// 删除分类
async function deleteCategory(category: Category) {
  try {    await categoryApi.deleteCategory(category.id)
    ElMessage.success("分类删除成功")
    await loadCategories()
  } catch (error) {
    ElMessage.error("删除分类失败")
  }
}

// 切换分类状态
async function handleToggleStatus(category: Category) {
  submitLoading.value = true
  try {
    const newStatus = category.status === "active" ? "inactive" : "active"
    await categoryApi.updateCategory(category.id, { status: newStatus })
    category.status = newStatus
    ElMessage.success(category.status === "active" ? "启用成功" : "禁用成功")
  } catch (error) {
    ElMessage.error("操作失败")
  } finally {
    submitLoading.value = false
  }
}

// 格式化日期
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

onMounted(() => {
  loadCategories()
})
</script>

<template>
  <div class="category-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <div>
            <el-button type="primary" @click="openAddDialog">
              <el-icon><Plus /></el-icon> 添加分类
            </el-button>
            <el-button @click="loadCategories" style="margin-left: 10px">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="categoryList" v-loading="loading">
        <el-table-column prop="id" label="分类ID" width="100" />
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <span style="font-size: 20px">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              @click="openEditDialog(row)"
              style="margin-right: 5px"
            >
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
              :loading="submitLoading"
              style="margin-right: 5px"
            >
              <el-icon v-if="row.status === 'active'">
                <SwitchButton />
              </el-icon>
              <el-icon v-else>
                <Check />
              </el-icon>
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-popconfirm
              :title="`确定要删除分类 ${row.name} 吗？`"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="deleteCategory(row)"
            >
              <template #reference>
                <el-button
                  size="small"
                  type="danger"
                >
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="400px"
      append-to-body
    >
      <el-form label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="currentCategory.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标">
          <el-input v-model="currentCategory.icon" placeholder="请输入图标（如 📁）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="currentCategory.order" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="currentCategory.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-list {
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
