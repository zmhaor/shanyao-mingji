<script setup lang="ts">
import type { Exchange, ShopItem } from "@/common/apis/admin/shop"
import { Delete, Edit, Plus, Search } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, ref } from "vue"
import { shopApi } from "@/common/apis/admin/shop"

const activeTab = ref("items")
const loading = ref(false)
const exchangeLoading = ref(false)
const submitLoading = ref(false)
const itemDialogVisible = ref(false)
const isEditItem = ref(false)
const exchangeKeyword = ref("")
const currentItem = ref<ShopItem | null>(null)

const shopItems = ref<ShopItem[]>([])
const exchangeList = ref<Exchange[]>([])

const exchangePagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const itemForm = ref({
  name: "",
  icon: "",
  points: 0,
  description: "",
  is_active: true
})

// 加载商品列表
async function loadShopItems() {
  loading.value = true
  try {
    const res = await shopApi.getShopItems()
    // 确保 data 是数组
    shopItems.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error("加载商品列表失败:", error)
    ElMessage.error("加载商品列表失败")
    shopItems.value = []
  } finally {
    loading.value = false
  }
}

// 加载兑换记录
async function loadExchanges() {
  exchangeLoading.value = true
  try {
    const res = await shopApi.getExchangeList({
      page: exchangePagination.value.page,
      pageSize: exchangePagination.value.pageSize,
      userId: exchangeKeyword.value
    })
    // 确保 list 是数组
    exchangeList.value = Array.isArray(res.data?.list) ? res.data.list : []
    // 确保 total 是数字
    exchangePagination.value.total = Number(res.data?.total) || 0
  } catch (error) {
    ElMessage.error("加载兑换记录失败")
    // 发生错误时确保数据是数组
    exchangeList.value = []
  } finally {
    exchangeLoading.value = false
  }
}

// 添加商品
function handleAddItem() {
  isEditItem.value = false
  currentItem.value = null
  itemForm.value = {
    name: "",
    icon: "",
    points: 0,
    description: "",
    is_active: true
  }
  itemDialogVisible.value = true
}

// 编辑商品
function handleEditItem(row: ShopItem) {
  isEditItem.value = true
  currentItem.value = row
  itemForm.value = {
    name: row.name,
    icon: row.icon,
    points: row.points,
    description: row.description,
    is_active: row.is_active
  }
  itemDialogVisible.value = true
}

// 提交商品
async function submitItem() {
  submitLoading.value = true
  try {
    if (isEditItem.value && currentItem.value) {
      // 编辑商品
      await shopApi.updateShopItem(currentItem.value.id, itemForm.value)
      ElMessage.success("编辑成功")
    } else {
      // 添加商品
      await shopApi.createShopItem(itemForm.value)
      ElMessage.success("添加成功")
    }
    itemDialogVisible.value = false
    loadShopItems()
  } catch (error) {
    ElMessage.error(isEditItem.value ? "编辑失败" : "添加失败")
  } finally {
    submitLoading.value = false
  }
}

// 删除商品
async function handleDeleteItem(row: ShopItem) {
  try {    await shopApi.deleteShopItem(row.id)
    ElMessage.success("删除成功")
    loadShopItems()
  } catch (error) {
    ElMessage.error("删除失败")
  }
}

// 切换商品状态
async function handleStatusChange(row: ShopItem) {
  try {
    await shopApi.updateShopItem(row.id, {
      ...row,
      is_active: row.is_active
    })
    ElMessage.success("状态更新成功")
  } catch (error) {
    ElMessage.error("状态更新失败")
    // 恢复原状态
    row.is_active = !row.is_active
  }
}

// 格式化日期
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

// 标签页切换
function handleTabChange(tab: string) {
  if (tab === "exchanges") {
    loadExchanges()
  }
}

onMounted(() => {
  loadShopItems()
})
</script>

<template>
  <div class="shop-manager">
    <el-tabs v-model="activeTab">
      <!-- 商品管理 -->
      <el-tab-pane label="商品管理" name="items">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>商品管理</span>
              <el-button type="primary" @click="handleAddItem">
                <el-icon><Plus /></el-icon> 添加商品
              </el-button>
            </div>
          </template>

          <el-table :data="shopItems" v-loading="loading">
            <el-table-column prop="id" label="商品ID" width="100" />
            <el-table-column prop="name" label="商品名称" width="150" />
            <el-table-column prop="icon" label="图标" width="80">
              <template #default="{ row }">
                <span style="font-size: 20px">{{ row.icon }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="points" label="所需积分" width="120" />
            <el-table-column prop="description" label="商品描述" />
            <el-table-column prop="is_active" label="状态" width="150">
              <template #default="{ row }">
                <el-switch
                  v-model="row.is_active"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleEditItem(row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-popconfirm
                  title="确定要删除该商品吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="handleDeleteItem(row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">
                      <el-icon><Delete /></el-icon> 删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 兑换记录 -->
      <el-tab-pane label="兑换记录" name="exchanges">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>兑换记录</span>
              <el-input
                v-model="exchangeKeyword"
                placeholder="搜索用户ID"
                style="width: 200px"
                clearable
                @keyup.enter="loadExchanges"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>

          <el-table :data="exchangeList" v-loading="exchangeLoading">
            <el-table-column prop="id" label="兑换ID" width="100" />
            <el-table-column prop="user_id" label="用户ID" width="180" />
            <el-table-column prop="user_nick_name" label="用户昵称" width="150" />
            <el-table-column prop="user_email" label="用户邮箱" width="200" />
            <el-table-column prop="item_name" label="商品名称" width="150" />
            <el-table-column prop="points" label="消耗积分" width="120" />
            <el-table-column prop="create_time" label="兑换时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.create_time) }}
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="exchangePagination.page"
            v-model:page-size="exchangePagination.pageSize"
            :total="exchangePagination.total"
            @current-change="loadExchanges"
            @size-change="loadExchanges"
            layout="total, sizes, prev, pager, next, jumper"
            style="margin-top: 20px"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 商品对话框 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="isEditItem ? '编辑商品' : '添加商品'"
      width="500px"
    >
      <el-form :model="itemForm" label-width="100px">
        <el-form-item label="商品名称" required>
          <el-input v-model="itemForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品图标" required>
          <el-input v-model="itemForm.icon" placeholder="请输入图标（如：🎁）" />
        </el-form-item>
        <el-form-item label="所需积分" required>
          <el-input-number v-model="itemForm.points" :min="1" placeholder="请输入所需积分" />
        </el-form-item>
        <el-form-item label="商品描述" required>
          <el-input v-model="itemForm.description" placeholder="请输入 商品描述" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态" required>
          <el-switch v-model="itemForm.is_active" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="itemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitItem" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.shop-manager {
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

