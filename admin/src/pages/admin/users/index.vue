<script setup lang="ts">
import type { CreateUserRequest, User } from "@/common/apis/admin/users"
import { Delete, Edit, Plus, Search, Setting, DataLine } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { onMounted, ref } from "vue"
import { userApi } from "@/common/apis/admin/users"

const userList = ref<User[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const addDialogVisible = ref(false)
const settingsVisible = ref(false)
const searchKeyword = ref("")
const currentUser = ref<User | null>(null)
const addFormRef = ref<any>(null)
const settingsFormRef = ref<any>(null)
const progressVisible = ref(false)
const progressLoading = ref(false)
const progressUser = ref<any>(null)
const progressList = ref<any[]>([])

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const editForm = ref({
  email: "",
  nick_name: "",
  avatar_url: "",
  points: 0
})

const addForm = ref<CreateUserRequest>({
  email: "",
  nick_name: "",
  password: "",
  points: 0
})

const addRules = ref({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  nick_name: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度在 2 到 20 个字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少 6 个字符", trigger: "blur" }
  ],
  points: [
    { type: "number", message: "请输入数字", trigger: "blur" }
  ]
})

const settingsForm = ref({
  initialPoints: 0,
  inviteRewardPoints: 50,
  invitedUserRewardPoints: 100
})

const settingsRules = ref({
  initialPoints: [
    { required: true, message: "请输入初始积分", trigger: "blur" },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (isNaN(Number(value))) {
          callback(new Error("请输入数字"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) < 0) {
          callback(new Error("初始积分不能小于 0"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) > 10000) {
          callback(new Error("初始积分不能大于 10000"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ],
  inviteRewardPoints: [
    { required: true, message: "请输入邀请奖励积分", trigger: "blur" },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (isNaN(Number(value))) {
          callback(new Error("请输入数字"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) < 0) {
          callback(new Error("邀请奖励积分不能小于 0"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) > 1000) {
          callback(new Error("邀请奖励积分不能大于 1000"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ],
  invitedUserRewardPoints: [
    { required: true, message: "请输入被邀请人奖励积分", trigger: "blur" },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (isNaN(Number(value))) {
          callback(new Error("请输入数字"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) < 0) {
          callback(new Error("被邀请人奖励积分不能小于 0"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (Number(value) > 1000) {
          callback(new Error("被邀请人奖励积分不能大于 1000"))
        } else {
          callback()
        }
      },
      trigger: "blur"
    }
  ]
})

async function loadUsers() {
  loading.value = true
  try {
    const res = await userApi.getUserList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      keyword: searchKeyword.value
    })
    userList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error("加载用户列表失败")
  } finally {
    loading.value = false
  }
}

function handleEdit(row: User) {
  currentUser.value = row
  editForm.value = {
    email: row.email,
    nick_name: row.nick_name,
    avatar_url: row.avatar_url,
    points: row.points
  }
  dialogVisible.value = true
}

async function submitEdit() {
  if (!currentUser.value) return

  submitLoading.value = true
  try {
    await userApi.updateUser(currentUser.value.id, {
      nick_name: editForm.value.nick_name,
      avatar_url: editForm.value.avatar_url,
      points: editForm.value.points
    })
    ElMessage.success("更新成功")
    dialogVisible.value = false
    loadUsers()
  } catch (error) {
    ElMessage.error("更新失败")
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm("确定要删除该用户吗？", "提示", {
      type: "warning",
      // 修复弹窗错位问题
      customClass: "centered-message-box"
    })

    await userApi.deleteUser(row.id)
    ElMessage.success("删除成功")
    loadUsers()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

function handleAdd() {
  addForm.value = {
    email: "",
    nick_name: "",
    password: "",
    points: 0
  }
  addDialogVisible.value = true
}

async function handleSettings() {
  submitLoading.value = true
  try {
    // 从后端获取当前的初始积分设置
    const [initialPointsRes, inviteRewardPointsRes, invitedUserRewardPointsRes] = await Promise.all([
      userApi.getConfig("initialPoints"),
      userApi.getConfig("inviteRewardPoints"),
      userApi.getConfig("invitedUserRewardPoints")
    ])
    settingsForm.value = {
      initialPoints: Number.parseInt(initialPointsRes.data) || 0,
      inviteRewardPoints: Number.parseInt(inviteRewardPointsRes.data) || 50,
      invitedUserRewardPoints: Number.parseInt(invitedUserRewardPointsRes.data) || 100
    }
  } catch (error) {
    // 获取失败时设置为默认值
    settingsForm.value = {
      initialPoints: 0,
      inviteRewardPoints: 50,
      invitedUserRewardPoints: 100
    }
  } finally {
    submitLoading.value = false
    settingsVisible.value = true
  }
}

async function submitAdd() {
  if (!addFormRef.value) return

  submitLoading.value = true
  try {
    await addFormRef.value.validate()

    await userApi.createUser(addForm.value)
    ElMessage.success("添加成功")
    addDialogVisible.value = false
    loadUsers()
  } catch (error) {
    // 验证失败时不显示添加失败的提示
    if (error !== "Validation failed") {
      ElMessage.error("添加失败")
    }
  } finally {
    submitLoading.value = false
  }
}

async function submitSettings() {
  if (!settingsFormRef.value) return

  submitLoading.value = true
  try {
    await settingsFormRef.value.validate()

    // 调用后端API保存设置
    await Promise.all([
      userApi.saveConfig({
        key: "initialPoints",
        value: settingsForm.value.initialPoints,
        description: "新用户注册时的初始积分"
      }),
      userApi.saveConfig({
        key: "inviteRewardPoints",
        value: settingsForm.value.inviteRewardPoints,
        description: "邀请一个人可以获得的积分"
      }),
      userApi.saveConfig({
        key: "invitedUserRewardPoints",
        value: settingsForm.value.invitedUserRewardPoints,
        description: "被邀请人注册时可以获得的积分"
      })
    ])

    ElMessage.success("设置保存成功")
    settingsVisible.value = false
  } catch (error) {
    // 验证失败时不显示设置失败的提示
    if (error !== "Validation failed") {
      ElMessage.error("设置保存失败")
    }
  } finally {
    submitLoading.value = false
  }
}

function getAvatarUrl(avatarUrl: string) {
  const baseUrl = import.meta.env.VITE_BASE_URL?.replace('/api', '') || '';
  if (!avatarUrl) return `${baseUrl}/images/默认.jpg`
  // 兼容 /uploads 或 uploads/ 开头的情况
  if (avatarUrl.startsWith('/uploads')) {
    return baseUrl + avatarUrl
  } else if (avatarUrl.startsWith('uploads/')) {
    return baseUrl + '/' + avatarUrl
  } else if (avatarUrl.startsWith('/images')) {
    return baseUrl + avatarUrl
  }
  return avatarUrl
}

const toolLabelMap: Record<string, string> = {
  shanghan: '伤寒精读助手',
  fangji: '方剂查询',
  neijing: '内经选读'
}

async function handleProgress(row: User) {
  progressVisible.value = true
  progressLoading.value = true
  progressUser.value = row
  progressList.value = []

  try {
    const res = await userApi.getUserProgress(row.id)
    if (res.data && res.data.progress) {
      progressList.value = res.data.progress.map((p: any) => ({
        ...p,
        toolLabel: toolLabelMap[p.toolName] || p.toolName,
        rate: p.reviewedCount > 0
          ? Math.round((p.correctCount / p.reviewedCount) * 100)
          : 0,
        lastSync: p.updatedAt ? new Date(Number(p.updatedAt)).toLocaleString('zh-CN') : '-'
      }))
    }
  } catch (error) {
    ElMessage.error('获取用户进度失败')
  } finally {
    progressLoading.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon> 添加用户
            </el-button>
            <el-button @click="handleSettings">
              <el-icon><Setting /></el-icon> 设置
            </el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户（邮箱/昵称）"
              style="width: 300px; margin-left: 10px"
              clearable
              @keyup.enter="loadUsers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="userList" v-loading="loading">
        <el-table-column prop="id" label="用户ID" width="180" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="(row.avatar_url || row.avatarUrl) ? getAvatarUrl(row.avatar_url || row.avatarUrl) : ''">
              <img src="/default-avatar.jpg" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="nick_name" label="昵称" width="150" />
        <el-table-column prop="points" label="积分" width="100" />
        <el-table-column prop="invite_code" label="邀请码" width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ row.invite_code || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="invite_count" label="邀请人数" width="100" />
        <el-table-column prop="stats.favorites" label="收藏数" width="100" />
        <el-table-column prop="stats.history" label="历史数" width="100" />
        <el-table-column prop="create_time" label="注册时间">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="success" @click="handleProgress(row)">
              <el-icon><DataLine /></el-icon> 进度
            </el-button>
            <el-button size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="loadUsers"
        @size-change="loadUsers"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px"
      />
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="500px"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.nick_name" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="editForm.avatar_url" />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="editForm.points" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加用户"
      width="500px"
    >
      <el-form :model="addForm" label-width="100px" :rules="addRules as any" ref="addFormRef">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="昵称" prop="nick_name">
          <el-input v-model="addForm.nick_name" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number v-model="addForm.points" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="settingsVisible"
      title="用户设置"
      width="500px"
    >
      <el-form :model="settingsForm" label-width="150px" :rules="settingsRules" ref="settingsFormRef">
        <el-form-item label="新用户初始积分" prop="initialPoints">
          <el-input-number v-model="settingsForm.initialPoints" />
        </el-form-item>
        <el-form-item label="邀请奖励积分" prop="inviteRewardPoints">
          <el-input-number v-model="settingsForm.inviteRewardPoints" />
        </el-form-item>
        <el-form-item label="被邀请人奖励积分" prop="invitedUserRewardPoints">
          <el-input-number v-model="settingsForm.invitedUserRewardPoints" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingsVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSettings" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户学习进度弹窗 -->
    <el-dialog
      v-model="progressVisible"
      title="学习进度"
      width="650px"
    >
      <div v-if="progressUser" style="margin-bottom: 16px; color: #606266;">
        用户：<strong>{{ progressUser.nick_name || progressUser.email }}</strong>
      </div>

      <el-table :data="progressList" v-loading="progressLoading" stripe>
        <el-table-column prop="toolLabel" label="工具名称" width="150" />
        <el-table-column label="复习进度" width="140">
          <template #default="{ row }">
            <span>{{ row.reviewedCount }} / {{ row.totalEntries }}</span>
          </template>
        </el-table-column>
        <el-table-column label="正确数" width="80">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.correctCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="正确率" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="row.rate"
              :color="row.rate >= 80 ? '#67c23a' : row.rate >= 50 ? '#e6a23c' : '#f56c6c'"
              :stroke-width="14"
              :text-inside="true"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastSync" label="最后同步" />
      </el-table>

      <div v-if="!progressLoading && progressList.length === 0" style="text-align: center; padding: 40px 0; color: #909399;">
        该用户暂无学习进度数据
      </div>

      <template #footer>
        <el-button @click="progressVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>

<style>
/* 修复删除用户确认弹窗错位问题 */
.centered-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  z-index: 9999 !important;
  width: 300px !important;
  background-color: #fff !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  overflow: hidden !important;
}

/* 改进消息框头部样式 */
.centered-message-box .el-message-box__header {
  padding: 15px 20px 10px !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

/* 改进消息框标题样式 */
.centered-message-box .el-message-box__title {
  font-size: 16px !important;
  font-weight: 500 !important;
  color: #303133 !important;
  margin: 0 !important;
  padding: 0 !important;
  border-bottom: none !important;
}

/* 改进消息框关闭按钮样式 */
.centered-message-box .el-message-box__headerbtn {
  top: 15px !important;
  right: 20px !important;
  transform: none !important;
}

/* 改进消息框内容样式 */
.centered-message-box .el-message-box__content {
  padding: 10px 20px 20px !important;
  font-size: 14px !important;
  color: #606266 !important;
  line-height: 1.5 !important;
  min-height: 60px !important;
}

/* 改进消息框按钮样式 */
.centered-message-box .el-message-box__btns {
  padding: 0 20px 15px !important;
  display: flex !important;
  justify-content: flex-end !important;
  gap: 10px !important;
  margin-top: 0 !important;
}

/* 修复消息框容器的样式 */
.el-message-box__wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9998 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>
