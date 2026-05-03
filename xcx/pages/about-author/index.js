const api = require('../../utils/api')
const imageCache = require('../../utils/image-cache')
const share = require('../../utils/share')

const AUTHOR_IMAGE_SCOPE = 'about-author'
const AUTHOR_INFO_STORAGE_KEY = 'author_about_info_cache'
const AUTHOR_IMAGE_FIELDS = ['avatar', 'heroImage', 'wechatQrCode']

const DEFAULT_DATA = {
  name: '山药铭记作者',
  signature: '把复杂内容变成更容易记住的知识。',
  avatar: '',
  heroImage: '',
  bio: '专注于中医学习体验与记忆方法设计，希望把更清晰、更耐用的学习工具带给大家。',
  wechatLabel: '添加作者微信',
  wechatNote: '如需交流、合作或反馈建议，可通过微信联系。',
  wechatQrCode: '',
  message: '',
  cooperation: '',
  links: []
}

function mergeConfig(remote = {}) {
  return {
    ...DEFAULT_DATA,
    ...remote,
    links: Array.isArray(remote.links) ? remote.links.filter(item => item && (item.label || item.url)) : []
  }
}

Page({
  data: {
    loading: true,
    authorInfo: mergeConfig()
  },

  onLoad() {
    this.hasCachedConfig = false
    this.remoteAuthorInfo = mergeConfig()
    this.loadCachedConfig()
    this.loadConfig()
  },

  loadCachedConfig() {
    const cachedConfig = wx.getStorageSync(AUTHOR_INFO_STORAGE_KEY)
    if (!cachedConfig || typeof cachedConfig !== 'object') {
      return
    }

    const authorInfo = mergeConfig(cachedConfig)
    this.hasCachedConfig = true
    this.remoteAuthorInfo = authorInfo
    this.setData({
      authorInfo,
      loading: false
    })
    this.resolveAuthorImages(authorInfo)
  },

  async loadConfig() {
    if (!this.hasCachedConfig) {
      this.setData({ loading: true })
    }
    try {
      const res = await api.config.get('author_about_info')
      const authorInfo = mergeConfig(res.data || {})
      wx.setStorageSync(AUTHOR_INFO_STORAGE_KEY, authorInfo)
      this.remoteAuthorInfo = authorInfo
      this.setData({
        authorInfo,
        loading: false
      })
      this.resolveAuthorImages(authorInfo)
    } catch (error) {
      console.error('获取作者介绍失败:', error)
      const fallbackInfo = mergeConfig()
      this.remoteAuthorInfo = fallbackInfo
      this.setData({
        authorInfo: this.data.authorInfo && this.data.authorInfo.name ? this.data.authorInfo : fallbackInfo,
        loading: false
      })
    }
  },

  async resolveAuthorImages(authorInfo) {
    const updates = {}

    const imageResults = await Promise.all(
      AUTHOR_IMAGE_FIELDS.map(async (field) => {
        const sourceUrl = imageCache.normalizeImageUrl(authorInfo[field])
        if (!sourceUrl) {
          return null
        }

        const display = await imageCache.getImageForDisplay(AUTHOR_IMAGE_SCOPE, field, sourceUrl)
        return {
          field,
          sourceUrl,
          displayPath: display.path,
          needsRefresh: display.needsRefresh
        }
      })
    )

    imageResults.forEach((result) => {
      if (!result || !result.displayPath || result.displayPath === this.data.authorInfo[result.field]) {
        return
      }

      updates[`authorInfo.${result.field}`] = result.displayPath
    })

    if (Object.keys(updates).length) {
      this.setData(updates)
    }

    imageResults.forEach((result) => {
      if (!result || !result.needsRefresh) {
        return
      }

      this.refreshAuthorImage(result.field, result.sourceUrl)
    })
  },

  async refreshAuthorImage(field, sourceUrl) {
    const localPath = await imageCache.cacheRemoteImage(AUTHOR_IMAGE_SCOPE, field, sourceUrl)
    if (!localPath) {
      return
    }

    if (!this.remoteAuthorInfo || imageCache.normalizeImageUrl(this.remoteAuthorInfo[field]) !== sourceUrl) {
      return
    }

    this.setData({
      [`authorInfo.${field}`]: localPath
    })
  },

  onPreviewQrCode() {
    const { wechatQrCode } = this.data.authorInfo
    if (!wechatQrCode) {
      wx.showToast({
        title: '暂未配置二维码',
        icon: 'none'
      })
      return
    }

    wx.previewImage({
      current: wechatQrCode,
      urls: [wechatQrCode]
    })
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  onShareAppMessage() {
    return share.getDefaultShareConfig()
  },

  onShareTimeline() {
    return share.getDefaultShareConfig()
  }
})
