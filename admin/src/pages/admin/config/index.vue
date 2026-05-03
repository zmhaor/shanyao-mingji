<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { CONFIG_KEYS, configApi } from "@/common/apis/admin/config"
import {
  createAuthorDefaults,
  createMiniappDefaults,
  sanitizeAuthorAboutPayload,
  sanitizeMiniappAboutPayload,
  type AuthorAboutForm,
  type MiniappAboutForm
} from "./form"

const loading = ref(false)
const savingMiniapp = ref(false)
const savingAuthor = ref(false)
const uploadingField = ref("")
const auditMode = ref(false)

const miniappAboutForm = reactive<MiniappAboutForm>(createMiniappDefaults())
const authorAboutForm = reactive<AuthorAboutForm>(createAuthorDefaults())

function resetReactiveObject<T extends object>(target: T, source: T) {
  Object.keys(target).forEach((key) => {
    delete target[key as keyof T]
  })
  Object.assign(target, source)
}

function parseJsonConfig<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value === "object") {
    return Object.assign({}, fallback, value) as T
  }
  if (typeof value !== "string") return fallback
  try {
    return Object.assign({}, fallback, JSON.parse(value)) as T
  } catch (_error) {
    return fallback
  }
}

async function loadConfig() {
  loading.value = true
  try {
    const [auditRes, miniappRes, authorRes] = await Promise.all([
      configApi.getAuditMode() as any,
      configApi.getMiniappAbout() as any,
      configApi.getAuthorAbout() as any
    ])

    auditMode.value = auditRes.data === "true"
    resetReactiveObject(miniappAboutForm, sanitizeMiniappAboutPayload(parseJsonConfig(miniappRes.data, createMiniappDefaults())))
    resetReactiveObject(authorAboutForm, sanitizeAuthorAboutPayload(parseJsonConfig(authorRes.data, createAuthorDefaults())))

    if (!Array.isArray(miniappAboutForm.changelog) || miniappAboutForm.changelog.length === 0) {
      miniappAboutForm.changelog = [{ version: "", date: "", content: "" }]
    }
    if (!Array.isArray(authorAboutForm.links) || authorAboutForm.links.length === 0) {
      authorAboutForm.links = [{ label: "", url: "" }]
    }
  } catch (error) {
    console.error("获取配置失败:", error)
    ElMessage.error("获取配置失败")
  } finally {
    loading.value = false
  }
}

async function updateAuditMode(value: string | number | boolean) {
  const booleanValue = Boolean(value)
  loading.value = true
  try {
    await configApi.update({
      key: CONFIG_KEYS.auditMode,
      value: booleanValue.toString(),
      description: "审核模式开关"
    })
    ElMessage.success("审核模式更新成功")
  } catch (error) {
    console.error("更新配置失败:", error)
    ElMessage.error("更新配置失败")
    auditMode.value = !booleanValue
  } finally {
    loading.value = false
  }
}

async function saveConfig(key: string, value: unknown, description: string, savingRef: { value: boolean }) {
  savingRef.value = true
  try {
    await configApi.update({
      key,
      value: JSON.stringify(value),
      description
    })
    ElMessage.success("保存成功")
  } catch (error) {
    console.error("保存配置失败:", error)
    ElMessage.error("保存配置失败")
  } finally {
    savingRef.value = false
  }
}

function saveMiniappAbout() {
  return saveConfig(CONFIG_KEYS.miniappAbout, sanitizeMiniappAboutPayload(miniappAboutForm), "小程序介绍配置", savingMiniapp)
}

function saveAuthorAbout() {
  return saveConfig(CONFIG_KEYS.authorAbout, sanitizeAuthorAboutPayload(authorAboutForm), "作者介绍配置", savingAuthor)
}

function addChangelog() {
  miniappAboutForm.changelog.push({ version: "", date: "", content: "" })
}

function removeChangelog(index: number) {
  miniappAboutForm.changelog.splice(index, 1)
  if (miniappAboutForm.changelog.length === 0) {
    addChangelog()
  }
}

function addLink() {
  authorAboutForm.links.push({ label: "", url: "" })
}

function removeLink(index: number) {
  authorAboutForm.links.splice(index, 1)
  if (authorAboutForm.links.length === 0) {
    addLink()
  }
}

async function handleImageUpload(file: File, field: string, form: "miniapp" | "author") {
  uploadingField.value = field
  try {
    const res = await configApi.uploadImage(file) as any
    const url = res.data?.url || ""
    if (!url) {
      throw new Error("上传结果缺少图片地址")
    }
    if (form === "miniapp") {
      Reflect.set(miniappAboutForm, field, url)
    } else {
      Reflect.set(authorAboutForm, field, url)
    }
    ElMessage.success("图片上传成功")
  } catch (error) {
    console.error("上传图片失败:", error)
    ElMessage.error("上传图片失败")
  } finally {
    uploadingField.value = ""
  }
  return false
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="config-page" v-loading="loading">
    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <span>系统配置</span>
        </div>
      </template>

      <el-form label-width="120px" class="panel-form">
        <el-form-item label="审核模式">
          <el-switch
            v-model="auditMode"
            :loading="loading"
            @change="updateAuditMode"
            active-text="开启"
            inactive-text="关闭"
          />
          <div class="form-tip">
            开启审核模式后，小程序将仅显示备忘录工具，隐藏其他工具和页面入口。
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <span>小程序介绍配置</span>
          <el-button type="primary" :loading="savingMiniapp" @click="saveMiniappAbout">
            保存小程序介绍
          </el-button>
        </div>
      </template>

      <el-form label-width="120px" class="panel-form">
        <div class="form-grid">
          <el-form-item label="入口标题">
            <el-input v-model="miniappAboutForm.entryTitle" maxlength="20" />
          </el-form-item>
          <el-form-item label="入口副标题">
            <el-input v-model="miniappAboutForm.entrySubtitle" maxlength="40" />
          </el-form-item>
          <el-form-item label="页面标题">
            <el-input v-model="miniappAboutForm.title" maxlength="30" />
          </el-form-item>
          <el-form-item label="页面副标题">
            <el-input v-model="miniappAboutForm.subtitle" maxlength="50" />
          </el-form-item>
          <el-form-item label="当前版本">
            <el-input v-model="miniappAboutForm.version" maxlength="20" />
          </el-form-item>
          <el-form-item label="发布日期">
            <el-input v-model="miniappAboutForm.releaseDate" maxlength="20" placeholder="如 2026-04-24" />
          </el-form-item>
          <el-form-item label="联系邮箱">
            <el-input v-model="miniappAboutForm.contactEmail" maxlength="100" />
          </el-form-item>
          <el-form-item label="官网链接">
            <el-input v-model="miniappAboutForm.website" maxlength="255" />
          </el-form-item>
        </div>

        <el-form-item label="版本说明">
          <el-input v-model="miniappAboutForm.releaseNotes" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="更新日志">
          <div class="array-list">
            <div v-for="(item, index) in miniappAboutForm.changelog" :key="`changelog-${index}`" class="group-block">
              <div class="group-header">
                <span>日志 {{ index + 1 }}</span>
                <el-button plain @click="removeChangelog(index)">删除</el-button>
              </div>
              <div class="form-grid">
                <el-form-item label="版本号" label-width="80px">
                  <el-input v-model="item.version" />
                </el-form-item>
                <el-form-item label="日期" label-width="80px">
                  <el-input v-model="item.date" placeholder="如 2026-04-24" />
                </el-form-item>
              </div>
              <el-form-item label="内容" label-width="80px">
                <el-input v-model="item.content" type="textarea" :rows="3" />
              </el-form-item>
            </div>
            <el-button plain @click="addChangelog">新增更新日志</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="panel-card">
      <template #header>
        <div class="panel-header">
          <span>作者介绍配置</span>
          <el-button type="primary" :loading="savingAuthor" @click="saveAuthorAbout">
            保存作者介绍
          </el-button>
        </div>
      </template>

      <el-form label-width="120px" class="panel-form">
        <div class="form-grid">
          <el-form-item label="入口标题">
            <el-input v-model="authorAboutForm.entryTitle" maxlength="20" />
          </el-form-item>
          <el-form-item label="入口副标题">
            <el-input v-model="authorAboutForm.entrySubtitle" maxlength="40" />
          </el-form-item>
          <el-form-item label="作者昵称">
            <el-input v-model="authorAboutForm.name" maxlength="30" />
          </el-form-item>
          <el-form-item label="作者签名">
            <el-input v-model="authorAboutForm.signature" maxlength="60" />
          </el-form-item>
          <el-form-item label="微信标题">
            <el-input v-model="authorAboutForm.wechatLabel" maxlength="30" />
          </el-form-item>
          <el-form-item label="作者寄语">
            <el-input v-model="authorAboutForm.message" maxlength="120" />
          </el-form-item>
        </div>

        <el-form-item label="作者头像">
          <div class="upload-block">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :before-upload="(file) => handleImageUpload(file, 'avatar', 'author')"
            >
              <el-button :loading="uploadingField === 'avatar'" type="default">上传作者头像</el-button>
            </el-upload>
            <el-input v-model="authorAboutForm.avatar" placeholder="上传后会自动回填图片地址" />
          </div>
          <img v-if="authorAboutForm.avatar" :src="authorAboutForm.avatar" class="preview-image">
        </el-form-item>

        <el-form-item label="头图">
          <div class="upload-block">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :before-upload="(file) => handleImageUpload(file, 'heroImage', 'author')"
            >
              <el-button :loading="uploadingField === 'heroImage'" type="default">上传头图</el-button>
            </el-upload>
            <el-input v-model="authorAboutForm.heroImage" placeholder="上传后会自动回填图片地址" />
          </div>
          <img v-if="authorAboutForm.heroImage" :src="authorAboutForm.heroImage" class="preview-image preview-wide">
        </el-form-item>

        <el-form-item label="作者简介">
          <el-input v-model="authorAboutForm.bio" type="textarea" :rows="4" />
        </el-form-item>

        <el-form-item label="微信说明">
          <el-input v-model="authorAboutForm.wechatNote" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="微信二维码">
          <div class="upload-block">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :before-upload="(file) => handleImageUpload(file, 'wechatQrCode', 'author')"
            >
              <el-button :loading="uploadingField === 'wechatQrCode'" type="default">上传二维码</el-button>
            </el-upload>
            <el-input v-model="authorAboutForm.wechatQrCode" placeholder="上传后会自动回填图片地址" />
          </div>
          <img v-if="authorAboutForm.wechatQrCode" :src="authorAboutForm.wechatQrCode" class="preview-image">
        </el-form-item>

        <el-form-item label="合作说明">
          <el-input v-model="authorAboutForm.cooperation" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="外部链接">
          <div class="array-list">
            <div v-for="(item, index) in authorAboutForm.links" :key="`link-${index}`" class="group-block">
              <div class="group-header">
                <span>链接 {{ index + 1 }}</span>
                <el-button plain @click="removeLink(index)">删除</el-button>
              </div>
              <div class="form-grid">
                <el-form-item label="名称" label-width="80px">
                  <el-input v-model="item.label" />
                </el-form-item>
                <el-form-item label="地址" label-width="80px">
                  <el-input v-model="item.url" />
                </el-form-item>
              </div>
            </div>
            <el-button plain @click="addLink">新增链接</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.config-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card {
  min-height: 180px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel-form {
  max-width: 1100px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
}

.form-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.upload-block {
  width: 100%;
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
}

.preview-image {
  margin-top: 12px;
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.preview-wide {
  width: 240px;
  height: 136px;
}

.array-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.array-row {
  display: grid;
  grid-template-columns: 1fr 88px;
  gap: 12px;
}

.group-block {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: #fbfdff;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
  color: #1f2937;
}

@media (max-width: 960px) {
  .form-grid,
  .upload-block,
  .array-row {
    grid-template-columns: 1fr;
  }
}
</style>
