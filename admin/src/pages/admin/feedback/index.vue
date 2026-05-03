<script setup lang="ts">
import { onMounted, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { feedbackApi, type Feedback, type FeedbackReply } from "@/common/apis/admin/feedback"

const feedbackList = ref<Feedback[]>([])
const loading = ref(false)
const filterStatus = ref("")
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const currentFeedback = ref<Feedback | null>(null)
const replyContent = ref("")
const submittingReply = ref(false)

async function loadFeedback() {
  loading.value = true
  try {
    const res = await feedbackApi.getFeedbackList({
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      status: filterStatus.value || undefined
    })
    feedbackList.value = res.data.list
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error("加载反馈列表失败")
  } finally {
    loading.value = false
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("zh-CN")
}

function getAvatarUrl(avatarUrl?: string) {
  const baseUrl = import.meta.env.VITE_BASE_URL?.replace('/api', '') || '';
  if (!avatarUrl) return `${baseUrl}/images/默认.jpg`
  if (avatarUrl.startsWith("/uploads")) {
    return baseUrl + avatarUrl
  }
  if (avatarUrl.startsWith("/images")) {
    return baseUrl + avatarUrl
  }
  return avatarUrl
}

onMounted(() => {
  loadFeedback()
})

async function handleStatusChange(row: Feedback, newStatus: string) {
  try {
    await feedbackApi.updateFeedbackStatus(row.id, newStatus)
    ElMessage.success("状态更新成功")
    row.status = newStatus
  } catch (error) {
    ElMessage.error("状态更新失败")
    loadFeedback() // 退回原来状态
  }
}

async function showDetail(row: Feedback) {
  currentFeedback.value = row
  dialogVisible.value = true
  // 加载包含回复的详情
  try {
    const res = await feedbackApi.getFeedbackDetail(row.id)
    currentFeedback.value = res.data
  } catch (error) {
    ElMessage.error("获取回复详情失败")
  }
}

async function handleReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning("请输入回复内容")
    return
  }
  if (!currentFeedback.value) return

  submittingReply.value = true
  try {
    await feedbackApi.replyFeedback({
      feedback_id: currentFeedback.value.id,
      content: replyContent.value
    })
    ElMessage.success("回复成功")
    replyContent.value = ""
    // 刷新详情
    const res = await feedbackApi.getFeedbackDetail(currentFeedback.value.id)
    currentFeedback.value = res.data
    // 刷新列表更新回复数
    loadFeedback()
  } catch (error) {
    ElMessage.error("回复失败")
  } finally {
    submittingReply.value = false
  }
}

async function handleDelete(row: Feedback) {
  try {
    await ElMessageBox.confirm(`确定删除这条反馈吗？`, "提示", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消"
    })
    await feedbackApi.deleteFeedback(row.id)
    ElMessage.success("删除成功")
    if (currentFeedback.value?.id === row.id) {
      dialogVisible.value = false
      currentFeedback.value = null
    }
    loadFeedback()
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败")
    }
  }
}
</script>

<template>
  <div class="feedback-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户反馈</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 14px; color: #606266">状态：</span>
            <el-select v-model="filterStatus" placeholder="全部分类" style="width: 120px" @change="loadFeedback" clearable>
              <el-option label="待处理" value="pending" />
              <el-option label="已采纳" value="adopted" />
              <el-option label="已解决" value="resolved" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="feedbackList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="反馈用户" width="200">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="30" :src="row.avatarUrl ? getAvatarUrl(row.avatarUrl) : ''">
                <img src="/default-avatar.jpg" />
              </el-avatar>
              <div style="display: flex; flex-direction: column">
                <span style="font-size: 13px; font-weight: 500">{{ row.nickName }}</span>
                <span style="font-size: 11px; color: #909399">ID: {{ row.user_id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="反馈内容" min-width="300">
          <template #default="{ row }">
            <div style="white-space: pre-wrap">{{ row.content }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系方式" width="180" />
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-select v-model="row.status" @change="(val) => handleStatusChange(row, val)" size="small">
              <el-option label="待处理" value="pending" />
              <el-option label="已采纳" value="adopted" />
              <el-option label="已解决" value="resolved" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center" fixed="right">
          <template #default="{ row }">
             <el-button type="primary" link @click="showDetail(row)">
               回复 ({{ row.replyCount || 0 }})
             </el-button>
             <el-button type="danger" link @click="handleDelete(row)">
               删除
             </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="loadFeedback"
        @size-change="loadFeedback"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 反馈详情及回复对话框 -->
    <el-dialog v-model="dialogVisible" title="反馈回复" width="600px" destroy-on-close>
      <div v-if="currentFeedback" class="dialog-content">
        <div class="feedback-box">
           <div class="feedback-info">
             <div style="display:flex; align-items:center; gap:8px;">
               <el-avatar :size="24" :src="currentFeedback.user?.avatar_url ? getAvatarUrl(currentFeedback.user?.avatar_url) : ''">
                 <img src="/default-avatar.jpg" />
               </el-avatar>
               <strong>{{ currentFeedback.user?.nick_name || '匿名用户' }} (ID: {{ currentFeedback.user?.user_id }})</strong>
             </div>
             <span class="time">{{ formatDate(currentFeedback.create_time) }}</span>
           </div>
           <div class="feedback-text">{{ currentFeedback.content }}</div>
        </div>
        
        <div class="replies-list" v-if="currentFeedback.replies && currentFeedback.replies.length > 0">
           <div v-for="reply in currentFeedback.replies" :key="reply.id" :class="['reply-item', reply.admin_id ? 'admin-reply' : 'user-reply']">
              <div class="reply-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <el-avatar :size="20" :src="reply.replier?.avatar_url ? getAvatarUrl(reply.replier?.avatar_url) : ''">
                    <img src="/default-avatar.jpg" />
                  </el-avatar>
                  <strong>{{ reply.replier?.nick_name }}</strong>
                  <span v-if="!reply.admin_id && reply.replier?.user_id" style="font-size:11px;color:#909399;">(ID: {{ reply.replier.user_id }})</span>
                </div>
                <span class="time">{{ formatDate(reply.create_time) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
           </div>
        </div>
        
        <div class="reply-input-wrapper">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            placeholder="请输入管理员回复"
          />
          <div class="reply-action">
            <el-button type="primary" :loading="submittingReply" @click="handleReply">发送回复</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.feedback-list {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 60vh;
  overflow-y: auto;
}
.feedback-box {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
}
.feedback-info, .reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}
.time {
  color: #909399;
  font-size: 12px;
}
.feedback-text, .reply-content {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}
.replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.reply-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}
.admin-reply {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
}
.reply-action {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}
</style>
