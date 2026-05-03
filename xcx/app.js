const api = require('./utils/api')
const config = require('./utils/config')

App({
  onLaunch(options) {
    console.log('学习工具箱小程序启动')
    this.captureInviteCode(options)
    this.loadAuditMode()
    this.loadDarkMode()
  },

  onShow(options) {
    this.captureInviteCode(options)
    // 每次显示时检查系统模式状态
    this.loadAuditMode()
  },

  globalData: {
    userInfo: null,
    isLoggedIn: false,
    loginPrompt: null,
    pendingInviteCode: '',
    isAuditMode: false,
    isToolDarkMode: false
  },

  captureInviteCode(options = {}) {
    const inviteCode = this.resolveInviteCode(options)
    if (inviteCode) {
      this.setPendingInviteCode(inviteCode)
    }
  },

  resolveInviteCode(options = {}) {
    if (options.query && options.query.inviteCode) {
      return String(options.query.inviteCode).trim().toUpperCase()
    }

    if (options.path && options.path.includes('inviteCode=')) {
      const match = options.path.match(/inviteCode=([^&]+)/)
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim().toUpperCase()
      }
    }

    if (typeof options.scene === 'string' && options.scene.includes('inviteCode=')) {
      const match = options.scene.match(/inviteCode=([^&]+)/)
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim().toUpperCase()
      }
    }

    return ''
  },

  setPendingInviteCode(inviteCode) {
    const normalizedCode = String(inviteCode || '').trim().toUpperCase()
    this.globalData.pendingInviteCode = normalizedCode
    if (normalizedCode) {
      wx.setStorageSync('pending_invite_code', normalizedCode)
    }
  },

  getPendingInviteCode() {
    return this.globalData.pendingInviteCode || wx.getStorageSync('pending_invite_code') || ''
  },

  clearPendingInviteCode() {
    this.globalData.pendingInviteCode = ''
    wx.removeStorageSync('pending_invite_code')
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const currentUser = wx.getStorageSync('currentUser')
    if (token && currentUser) {
      this.globalData.userInfo = currentUser
      this.globalData.isLoggedIn = true
      return true
    }
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    return false
  },

  getUserInfo() {
    return this.globalData.userInfo
  },

  logout() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('currentUser')
    wx.removeStorageSync('pending_invite_code')
    this.globalData.userInfo = null
    this.globalData.isLoggedIn = false
    this.globalData.pendingInviteCode = ''
  },

  // 加载系统模式状态
  loadAuditMode(callback) {
    // 先从本地缓存获取，确保快速响应
    const cachedMode = wx.getStorageSync('audit_mode')
    this.globalData.isAuditMode = cachedMode || false
    
    // 然后异步从服务器获取最新状态
    wx.request({
      url: `${config.baseUrl}/config/audit_mode`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        if (res.data && res.data.success) {
          const isAuditMode = res.data.data === 'true'
          this.globalData.isAuditMode = isAuditMode
          wx.setStorageSync('audit_mode', isAuditMode)
        }
        if (callback) callback()
      },
      fail: (error) => {
        console.error('获取系统模式失败:', error)
        // 失败时保持本地缓存的值
        if (callback) callback()
      }
    })
  },

  // 获取当前是否为特殊模式
  isAuditMode() {
    return this.globalData.isAuditMode || wx.getStorageSync('audit_mode') || false
  },

  // 加载工具夜间模式状态
  loadDarkMode() {
    const isDark = wx.getStorageSync('tool_dark_mode') || false
    this.globalData.isToolDarkMode = isDark
    // 延迟一秒执行，确保页面已渲染
    setTimeout(() => {
      this.updateUITheme(isDark)
    }, 100)
    return isDark
  },

  // 切换工具夜间模式
  toggleDarkMode() {
    const newVal = !this.globalData.isToolDarkMode
    this.globalData.isToolDarkMode = newVal
    wx.setStorageSync('tool_dark_mode', newVal)
    this.updateUITheme(newVal)
    return newVal
  },

  // 获取当前工具夜间模式状态
  getDarkMode() {
    return this.globalData.isToolDarkMode || false
  },

  // 更新 UI 主题（导航栏等），只在工具相关页面生效
  updateUITheme(isDark) {
    // 获取当前页面路径
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = currentPage ? currentPage.route : ''
    
    // 只在工具相关页面应用夜间模式
    const isToolPage = currentPath === 'pages/study/study' || currentPath === 'pages/mnemonic/index'
    
    if (isToolPage) {
      const navBgColor = isDark ? '#0f0f13' : '#ffffff'
      const navTextColor = isDark ? '#ffffff' : '#000000'
      
      // 设置导航栏颜色
      wx.setNavigationBarColor({
        backgroundColor: navBgColor,
        frontColor: navTextColor,
        animation: {
          duration: 300,
          timingFunc: 'easeIn'
        }
      }).catch(err => {
        console.log('设置导航栏颜色失败，可能当前页面不支持或尚未加载', err)
      })
    }
  }
})
