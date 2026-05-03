const api = require('../../utils/api')
const auth = require('../../utils/auth')
const config = require('../../utils/config')

const FILE_BASE_URL = config.assetHost

function syncUserPoints(points) {
  const nextPoints = Number(points) || 0
  const app = getApp()
  const currentUser = wx.getStorageSync('currentUser') || null
  const cachedStats = wx.getStorageSync('cached_stats') || null

  wx.setStorageSync('user_points', nextPoints)

  if (currentUser) {
    currentUser.points = nextPoints
    wx.setStorageSync('currentUser', currentUser)
  }

  if (cachedStats) {
    cachedStats.points = nextPoints
    wx.setStorageSync('cached_stats', cachedStats)
  }

  if (app && app.globalData && app.globalData.userInfo) {
    app.globalData.userInfo.points = nextPoints
  }
}

function formatSize(size) {
  if (!size) return '未知大小'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function resolveFileUrl(url) {
  if (!url) return ''
  return url.startsWith('/uploads') ? `${FILE_BASE_URL}${url}` : url
}

function resolvePreviewImages(item) {
  const previewImages = Array.isArray(item.previewImages)
    ? item.previewImages
    : (Array.isArray(item.preview_images) ? item.preview_images : [])

  return previewImages
    .map((url) => resolveFileUrl(url))
    .filter(Boolean)
    .slice(0, 2)
}

function openDocument(filePath, fileType) {
  return new Promise((resolve, reject) => {
    wx.openDocument({
      filePath,
      fileType: (fileType || '').toLowerCase(),
      showMenu: true,
      success: resolve,
      fail: reject
    })
  })
}

Page({
  data: {
    materials: [],
    loading: false,
    userPoints: 0,
    capsuleSafeRight: 0,
    isDarkMode: false
  },

  onLoad() {
    // 检查是否从分享卡片进入（页面栈只有一个页面）
    const pages = getCurrentPages();
    if (pages.length === 1) {
      // 先跳转到首页，再跳回当前页面，确保页面栈中有多个页面
      wx.switchTab({ 
        url: '/pages/index/index',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({ 
              url: '/pages/materials/materials'
            });
          }, 100);
        }
      });
      return;
    }

    if (!auth.ensureLogin()) return
    this.initNavLayout()
    this.initCachedPoints()
    this.loadMaterials()
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);

    if (!auth.isLoggedIn()) return
    this.initCachedPoints()
    this.loadMaterials()
  },

  onPullDownRefresh() {
    this.loadMaterials().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  initNavLayout() {
    try {
      const menuButtonRect = wx.getMenuButtonBoundingClientRect()
      const systemInfo = wx.getSystemInfoSync()
      const capsuleSafeRight = Math.max(systemInfo.windowWidth - menuButtonRect.left + 8, 12)
      this.setData({ capsuleSafeRight })
    } catch (error) {
      this.setData({ capsuleSafeRight: 88 })
    }
  },

  initCachedPoints() {
    const currentUser = wx.getStorageSync('currentUser') || null
    const cachedPoints = wx.getStorageSync('user_points')
    const fallbackPoints = currentUser && currentUser.points !== undefined
      ? Number(currentUser.points) || 0
      : Number(cachedPoints) || 0

    this.setData({
      userPoints: fallbackPoints
    })
  },

  async loadMaterials() {
    this.setData({ loading: true })

    try {
      const [materialRes, pointsRes] = await Promise.allSettled([
        api.materials.getList(),
        api.shop.getPoints()
      ])

      const res = materialRes.status === 'fulfilled' ? materialRes.value : null
      const materials = Array.isArray(res?.data?.materials) ? res.data.materials : []
      const pointsFromMaterial = Number(res?.data?.userPoints)
      const pointsFromShop = pointsRes.status === 'fulfilled' && pointsRes.value?.success
        ? Number(pointsRes.value.data?.points)
        : NaN
      const userPoints = Number.isFinite(pointsFromShop)
        ? pointsFromShop
        : (Number.isFinite(pointsFromMaterial) ? pointsFromMaterial : this.data.userPoints)

      syncUserPoints(userPoints)
      this.setData({
        userPoints,
        materials: materials.map((item) => {
          const previewImages = resolvePreviewImages(item)
          return {
            ...item,
            hasExchanged: Boolean(item.hasExchanged ?? item.has_exchanged),
            pointsRequired: Number(item.pointsRequired ?? item.points_required) || 0,
            fileUrl: resolveFileUrl(item.fileUrl || item.file_url),
            fileSize: Number(item.fileSize ?? item.file_size) || 0,
            fileExt: item.fileExt || item.file_ext || '',
            createTime: item.createTime || item.create_time,
            previewImages,
            hasPreview: previewImages.length > 0,
            fileSizeText: formatSize(Number(item.fileSize ?? item.file_size) || 0),
            createTimeText: formatTime(item.createTime || item.create_time),
            fileExtText: ((item.fileExt || item.file_ext || 'file')).toUpperCase(),
            actionText: Boolean(item.hasExchanged ?? item.has_exchanged) ? '打开资料' : '积分兑换'
          }
        })
      })
    } catch (error) {
      console.error('加载资料列表失败:', error)
      wx.showToast({
        title: '加载资料失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  onBack() {
    const pages = getCurrentPages()
    if (pages.length === 1) {
      // 从分享卡片进入，跳转到首页
      wx.switchTab({ url: '/pages/index/index' })
    } else {
      // 正常返回
      wx.navigateBack()
    }
  },

  goToInvite() {
    wx.navigateTo({
      url: '/pages/invite/invite'
    })
  },

  onPreviewTap(e) {
    const item = e.currentTarget.dataset.item
    const previewImages = Array.isArray(item?.previewImages) ? item.previewImages : []

    if (!previewImages.length) {
      wx.showToast({
        title: '暂无预览内容',
        icon: 'none'
      })
      return
    }

    wx.previewImage({
      current: previewImages[0],
      urls: previewImages
    })
  },

  async onDownloadTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item || !item.fileUrl) {
      wx.showToast({
        title: '资料地址无效',
        icon: 'none'
      })
      return
    }

    if (!item.hasExchanged) {
      if (this.data.userPoints < (item.pointsRequired || 0)) {
        wx.showToast({
          title: '积分不足',
          icon: 'none'
        })
        return
      }

      const confirmed = await new Promise((resolve) => {
        wx.showModal({
          title: '确认兑换',
          content: `兑换《${item.title}》需要 ${item.pointsRequired || 0} 积分，确认继续吗？`,
          success: (res) => resolve(!!res.confirm),
          fail: () => resolve(false)
        })
      })

      if (!confirmed) {
        return
      }

      try {
        wx.showLoading({ title: '兑换中...' })
        const exchangeRes = await api.materials.exchange(item.id)
        wx.hideLoading()

        if (exchangeRes.success) {
          const remainingPoints = Number(exchangeRes.data.remainingPoints) || 0
          syncUserPoints(remainingPoints)
          this.setData({
            userPoints: remainingPoints,
            materials: this.data.materials.map((material) => material.id === item.id
              ? { ...material, hasExchanged: true, actionText: '打开资料' }
              : material)
          })
          item.hasExchanged = true
          wx.showToast({
            title: '兑换成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('兑换资料失败:', error)
        wx.hideLoading()
        wx.showToast({
          title: error.message || '兑换失败',
          icon: 'none'
        })
        return
      }
    }

    wx.showLoading({
      title: '打开中...'
    })

    try {
      const downloadRes = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: item.fileUrl,
          success: resolve,
          fail: reject
        })
      })

      if (downloadRes.statusCode !== 200) {
        throw new Error('download failed')
      }

      try {
        await openDocument(downloadRes.tempFilePath, item.fileExt)
        wx.hideLoading()
        return
      } catch (_tempOpenError) {
        const ext = item.fileExt ? `.${item.fileExt}` : ''
        const targetPath = `${wx.env.USER_DATA_PATH}/material_${item.id}_${Date.now()}${ext}`
        const fs = wx.getFileSystemManager()

        const savedPath = await new Promise((resolve, reject) => {
          fs.saveFile({
            tempFilePath: downloadRes.tempFilePath,
            filePath: targetPath,
            success: (res) => resolve(res.savedFilePath),
            fail: reject
          })
        })

        await openDocument(savedPath, item.fileExt)
        wx.hideLoading()
      }
    } catch (error) {
      console.error('下载资料失败:', error)
      wx.hideLoading()
      wx.showModal({
        title: '打开失败',
        content: error.errMsg || error.message || '文件下载成功，但微信暂时无法打开该文件。',
        showCancel: false
      })
    }
  }
})
