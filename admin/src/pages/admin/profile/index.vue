<script setup lang="ts">
import type { ChangePasswordRequest } from "@/common/apis/admin/auth"
import { Key, Lock, RefreshLeft, User } from "@element-plus/icons-vue"
import { ElForm, ElMessage } from "element-plus"
import { reactive, ref } from "vue"
import { authApi } from "@/common/apis/admin/auth"

const loading = ref(false)
const formRef = ref<InstanceType<typeof ElForm>>()
const usernameFormRef = ref<InstanceType<typeof ElForm>>()

const formData = reactive<ChangePasswordRequest>({
  currentPassword: "",
  newPassword: ""
})

const usernameFormData = reactive({
  currentPassword: "",
  newUsername: ""
})

const rules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "新密码长度至少为6位", trigger: "blur" }
  ]
}

const usernameRules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" }
  ],
  newUsername: [
    { required: true, message: "请输入新用户名", trigger: "blur" },
    { min: 2, message: "用户名长度至少为2位", trigger: "blur" },
    { max: 20, message: "用户名长度不能超过20位", trigger: "blur" }
  ]
}

async function handleChangePassword() {
  if (!formRef.value) return

  formRef.value.validate(async (valid, errorFields) => {
    if (!valid) {
      // 显示具体的验证错误
      if (errorFields) {
        const errorMessages: string[] = []
        for (const field in errorFields) {
          if (Object.prototype.hasOwnProperty.call(errorFields, field)) {
            const errors = errorFields[field]
            if (errors && errors.length > 0 && errors[0].message) {
              errorMessages.push(errors[0].message)
            }
          }
        }
        if (errorMessages.length > 0) {
          ElMessage.error(errorMessages.join("\n"))
          return
        }
      } else {
        ElMessage.error("表单验证失败")
      }
      return
    }

    loading.value = true
    try {
      await authApi.changePassword(formData)
      ElMessage.success("密码修改成功")

      // 清空表单
      formData.currentPassword = ""
      formData.newPassword = ""
    } catch (error: any) {
      // 显示后端返回的错误信息
      const errorMessage = error.response?.data?.message || "密码修改失败"
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  })
}

async function handleChangeUsername() {
  if (!usernameFormRef.value) return

  usernameFormRef.value.validate(async (valid, errorFields) => {
    if (!valid) {
      // 显示具体的验证错误
      if (errorFields) {
        const errorMessages: string[] = []
        for (const field in errorFields) {
          if (Object.prototype.hasOwnProperty.call(errorFields, field)) {
            const errors = errorFields[field]
            if (errors && errors.length > 0 && errors[0].message) {
              errorMessages.push(errors[0].message)
            }
          }
        }
        if (errorMessages.length > 0) {
          ElMessage.error(errorMessages.join("\n"))
          return
        }
      } else {
        ElMessage.error("表单验证失败")
      }
      return
    }

    loading.value = true
    try {
      await authApi.changeUsername(usernameFormData)
      ElMessage.success("用户名修改成功")

      // 清空表单
      usernameFormData.currentPassword = ""
      usernameFormData.newUsername = ""
    } catch (error: any) {
      // 显示后端返回的错误信息
      const errorMessage = error.response?.data?.message || "用户名修改失败"
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="profile-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人设置</span>
        </div>
      </template>

      <!-- 修改用户名表单 -->
      <ElForm
        ref="usernameFormRef"
        :model="usernameFormData"
        :rules="usernameRules"
        label-width="120px"
        class="change-username-form"
        style="margin-bottom: 40px"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="usernameFormData.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="新用户名" prop="newUsername">
          <el-input
            v-model="usernameFormData.newUsername"
            placeholder="请输入新用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleChangeUsername"
            :loading="loading"
          >
            <el-icon><RefreshLeft /></el-icon> 修改用户名
          </el-button>
        </el-form-item>
      </ElForm>

      <!-- 修改密码表单 -->
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="change-password-form"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="formData.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            :prefix-icon="Key"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleChangePassword"
            :loading="loading"
          >
            <el-icon><RefreshLeft /></el-icon> 修改密码
          </el-button>
        </el-form-item>
      </ElForm>
    </el-card>
  </div>
</template>

<style scoped>
.profile-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.change-password-form {
  max-width: 600px;
}
</style>
