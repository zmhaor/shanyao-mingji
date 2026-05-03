const app = getApp()
const api = require('../../utils/api')
const share = require('../../utils/share')
const config = require('../../utils/config')

const DEFAULT_ABOUT_ENTRIES = [
  {
    id: 'about-app',
    title: '关于山药铭记',
    subtitle: '版本信息与更新动态',
    image: '',
    path: '/pages/about-app/index'
  },
  {
    id: 'about-author',
    title: '关于作者',
    subtitle: '作者简介与联系方式',
    image: '',
    path: '/pages/about-author/index'
  }
]

function syncUserPoints(points) {
  const nextPoints = Number(points) || 0
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


Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    stats: {
      favorites: 0,
      studyTime: 0,
      points: 0
    },
    menuItems: [],
    settingGroups: [],
    footerProtocols: [],
    aboutEntries: DEFAULT_ABOUT_ENTRIES,
    version: '1.0.0',
    // 邮箱登录相关数据
    showEmailLogin: false,
    email: '',
    password: '',
    // 完善资料弹窗相关数据
    showProfileSetup: false,
    isAvatarChanged: false,
    tempAvatarUrl: '',
    tempNickname: '',
    userAvatar: '', // 本地持久化储存的头像
    showNoticeModal: false,
    currentNotice: null,
    unreadFeedbackCount: 0
  },

  onLoad() {
    this.checkLoginStatus()
    this.calculateCacheSize()
    this.loadAboutEntries()
  },

  onShow() {
    this.checkLoginStatus()
    this.checkNotice()
    this.loadAboutEntries()

    // 检查是否有来自其他页面的登录提示
    const app = getApp()
    if (app.globalData.loginPrompt) {
      wx.showToast({
        title: app.globalData.loginPrompt,
        icon: 'none',
        duration: 2000
      })
      app.globalData.loginPrompt = null // 显示后清除，防止重复显示
    }

    // 根据系统模式状态更新设置项
    this.updateSettingsByMode()

    if (this.data.isLoggedIn) {
      this.loadStats()
      this.loadUnreadFeedbackCount()
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  async loadAboutEntries() {
    try {
      const [miniappRes, authorRes] = await Promise.all([
        api.config.get('miniapp_about_info'),
        api.config.get('author_about_info')
      ])

      const aboutEntries = [
        {
          ...DEFAULT_ABOUT_ENTRIES[0],
          title: miniappRes.data?.entryTitle || DEFAULT_ABOUT_ENTRIES[0].title,
          subtitle: miniappRes.data?.entrySubtitle || DEFAULT_ABOUT_ENTRIES[0].subtitle,
          image: miniappRes.data?.coverImage || ''
        },
        {
          ...DEFAULT_ABOUT_ENTRIES[1],
          title: authorRes.data?.entryTitle || DEFAULT_ABOUT_ENTRIES[1].title,
          subtitle: authorRes.data?.entrySubtitle || DEFAULT_ABOUT_ENTRIES[1].subtitle,
          image: authorRes.data?.avatar || authorRes.data?.heroImage || ''
        }
      ]

      this.setData({
        aboutEntries
      }, () => {
        this.updateSettingsByMode()
      })
    } catch (error) {
      console.error('获取关于配置失败:', error)
      this.setData({ aboutEntries: DEFAULT_ABOUT_ENTRIES }, () => {
        this.updateSettingsByMode()
      })
    }
  },

  // 根据系统模式状态更新项
  updateSettingsByMode() {
    const isAuditMode = app.isAuditMode()
    const { aboutEntries, unreadFeedbackCount, cacheSize } = this.data
    
    // --- 1. 更新顶部服务栅格 (2x3 布局) ---
    let menuItems = [
      { id: 1, name: '我的收藏', icon: '/images/收藏.png', path: '/pages/favorites/favorites' },
      { id: 2, name: '数据同步', icon: '/images/时间.png', path: '/pages/progress/progress' },
      { id: 3, name: '积分商城', icon: '/images/商城.png', path: '/pages/shop/shop' },
      { id: 4, name: '邀请好友', icon: '/images/邀请好友.png', path: '/pages/invite/invite' },
      { id: 5, name: '用户反馈', icon: '/images/反馈.png', path: '/pages/feedback_list/feedback_list', badge: unreadFeedbackCount > 0 ? String(unreadFeedbackCount) : '' },
      { id: 6, name: '资料下载', icon: '/images/文件.png', path: '/pages/materials/materials' }
    ]

    if (isAuditMode) {
      // 审核模式：隐藏反馈和下载
      menuItems = menuItems.filter(item => item.name !== '用户反馈' && item.name !== '资料下载')
    }

    // --- 2. 更新中间设置列表 (仅保留核心与关于) ---
    const helpGroup = {
      title: '基础设置',
      items: [
        { id: 101, name: '清除数据', iconPath: '/images/清除.png', value: cacheSize || '0KB', path: 'clear' }
      ]
    }

    const aboutGroup = {
      title: '关于详情',
      items: [
        { id: 102, name: aboutEntries[1]?.title || '关于作者', iconPath: '/images/作者.png', value: '', path: '/pages/about-author/index' },
        { id: 103, name: aboutEntries[0]?.title || '关于山药铭记', iconPath: '/images/小程序.png', value: '', path: '/pages/about-app/index' }
      ]
    }

    const settingGroups = [helpGroup, aboutGroup]

    // --- 3. 更新页脚协议链接 ---
    const footerProtocols = [
      { name: '用户服务协议', path: '/pages/protocol/protocol?type=service' },
      { name: '个人信息保护政策', path: '/pages/protocol/protocol?type=privacy' }
    ]

    this.setData({ 
      menuItems,
      settingGroups,
      footerProtocols
    })
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const currentUser = wx.getStorageSync('currentUser')

    if (token && currentUser) {
      let localAvatar = wx.getStorageSync('userAvatar_' + currentUser.id)
      // 云端头像：如果后端返回的是相对路径，拼接为完整 URL
      let cloudAvatar = ''
      if (currentUser.avatarUrl && currentUser.avatarUrl.startsWith('/uploads')) {
        cloudAvatar = config.assetHost + currentUser.avatarUrl
      } else if (currentUser.avatarUrl) {
        cloudAvatar = currentUser.avatarUrl
      }

      if (!localAvatar && cloudAvatar && cloudAvatar.startsWith('http')) {
        localAvatar = cloudAvatar
        this.downloadCloudAvatarToLocal(cloudAvatar, currentUser.id)
      }

      this.setData({
        userInfo: currentUser,
        isLoggedIn: true,
        userAvatar: localAvatar || cloudAvatar || ''
      })
      app.globalData.userInfo = currentUser
      app.globalData.isLoggedIn = true
    } else {
      this.setData({
        userInfo: null,
        isLoggedIn: false,
        userAvatar: '',
        showProfileSetup: false
      })
      app.globalData.userInfo = null
      app.globalData.userInfo = null
      app.globalData.isLoggedIn = false
    }
  },

  async checkNotice() {
    try {
      const res = await api.notice.getActive({ type: 'popup' })
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const notices = res.data
        const confirmedNotices = wx.getStorageSync('confirmedNotices') || []

        // 找到第一个未确认的弹窗公告
        const unconfirmed = notices.find(n => !confirmedNotices.includes(n.id))
        if (unconfirmed) {
          this.setData({
            currentNotice: unconfirmed,
            showNoticeModal: true
          })
        }
      }
    } catch (e) {
      console.log('获取公告失败，静默处理:', e)
    }
  },

  onConfirmNotice() {
    const noticeId = this.data.currentNotice?.id
    if (noticeId) {
      api.notice.confirm(noticeId).catch(err => console.log('确认公告失败', err))
      const confirmedNotices = wx.getStorageSync('confirmedNotices') || []
      if (!confirmedNotices.includes(noticeId)) {
        confirmedNotices.push(noticeId)
        wx.setStorageSync('confirmedNotices', confirmedNotices)
      }
    }
    this.setData({
      showNoticeModal: false
    })
  },

  // 静默下载云端头像到本地固化
  async downloadCloudAvatarToLocal(cloudUrl, userId) {
    try {
      const tempRes = await new Promise((resolve, reject) => {
        wx.downloadFile({
          url: cloudUrl,
          success: resolve,
          fail: reject
        })
      })
      if (tempRes.statusCode === 200) {
        // 使用 FileSystemManager 替代废弃的 wx.saveFile 以突破 10MB 限制
        const fs = wx.getFileSystemManager()
        const ext = tempRes.tempFilePath.match(/\.[^.]+$/)?.[0] || '.png'
        const savedFilePath = `${wx.env.USER_DATA_PATH}/user_avatar_${userId}${ext}`

        const savedPath = await new Promise((resolve, reject) => {
          fs.saveFile({
            tempFilePath: tempRes.tempFilePath,
            filePath: savedFilePath,
            success: (res) => resolve(res.savedFilePath),
            fail: reject
          })
        })
        wx.setStorageSync('userAvatar_' + userId, savedPath)
        wx.setStorageSync('userAvatar', savedPath)
        // 静默更新当前视图
        this.setData({ userAvatar: savedPath })
      }
    } catch (e) {
      console.error('静默恢复云端头像到本地失败:', e)
    }
  },

  async loadStats() {
    // 优先显示本地缓存的统计信息
    const cachedStats = wx.getStorageSync('cached_stats')
    const cachedPoints = wx.getStorageSync('user_points')
    if (cachedStats) {
      this.setData({ stats: cachedStats })
    } else if (cachedPoints !== '' && cachedPoints !== undefined && cachedPoints !== null) {
      this.setData({
        stats: {
          ...this.data.stats,
          points: Number(cachedPoints) || 0
        }
      })
    }

    try {
      const [userRes, pointsRes, historyRes] = await Promise.all([
        api.user.getInfo(),
        api.shop.getPoints(),
        api.history.getList()
      ])

      if (userRes.success && pointsRes.success && historyRes.success) {
        // 从历史记录中获取学习时长统计
        const studyTimeData = historyRes.data.studyTime || {}
        const totalSeconds = studyTimeData.totalStudyTime || 0
        
        // 格式化学习时长
        let studyTimeDisplay = ''
        if (totalSeconds < 60) {
          studyTimeDisplay = `${totalSeconds}秒`
        } else if (totalSeconds < 3600) {
          studyTimeDisplay = `${Math.floor(totalSeconds / 60)}分钟`
        } else {
          const hours = Math.floor(totalSeconds / 3600)
          const minutes = Math.floor((totalSeconds % 3600) / 60)
          studyTimeDisplay = `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
        }

        const newStats = {
          favorites: userRes.data.stats.favorites,
          studyTime: studyTimeDisplay,
          points: pointsRes.data.points
        }

        this.setData({ stats: newStats })
        // 更新本地缓存
        syncUserPoints(newStats.points)
        wx.setStorageSync('cached_stats', newStats)
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  },

  async loadUnreadFeedbackCount() {
    try {
      const res = await api.feedback.getUnreadCount()
      const unreadFeedbackCount = Number(res.data?.unreadCount) || 0
      this.setData({
        unreadFeedbackCount
      }, () => {
        this.updateSettingsByMode()
      })
    } catch (error) {
      console.error('获取反馈未读数失败:', error)
    }
  },



  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('currentUser')
          wx.removeStorageSync('userAvatar') // 清除可能残留的无主全局头像
          // 保留 userAvatar 以便再次登录恢复
          this.setData({
            userInfo: null,
            isLoggedIn: false,
            stats: { favorites: 0, history: 0, points: 0 },
            showProfileSetup: false,
            isAvatarChanged: false,
            tempAvatarUrl: '',
            tempNickname: '',
            userAvatar: ''
          })
          app.globalData.userInfo = null
          app.globalData.isLoggedIn = false
          wx.showToast({ title: '已退出登录', icon: 'none' })
        }
      }
    })
  },

  onViewFavorites() {
    if (!getApp().globalData.isLoggedIn) {
      return // 不跳转，保留在原位或后续弹出引导
    }
    wx.navigateTo({ url: '/pages/favorites/favorites' })
  },

  onViewHistory() {
    if (!getApp().globalData.isLoggedIn) return
    wx.navigateTo({ url: '/pages/history/history' })
  },

  onViewStudyTime() {
    if (!getApp().globalData.isLoggedIn) return
    wx.navigateTo({ url: '/pages/study-time/study-time' })
  },

  onViewPoints() {
    if (!getApp().globalData.isLoggedIn) return
    wx.navigateTo({ url: '/pages/shop/shop' })
  },

  onMenuTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({ url: item.path })
  },

  onSettingTap(e) {
    const item = e.currentTarget.dataset.item

    if (item.path === 'clear') {
      wx.showModal({
        title: '清除数据',
        content: '将清除本地缓存数据。\n\n包括：背诵进度、未同步记录等。\n\n清除后无法恢复，确认继续？',
        confirmColor: '#ff3b30',
        cancelText: '取消',
        confirmText: '确认清除',
        success: (res) => {
          if (res.confirm) {
            this.clearCache()
          }
        }
      })
      return
    }

    if (item.path) {
      wx.navigateTo({ url: item.path })
    }
  },



  async clearHistory() {
    try {
      await api.history.clear()
      this.loadStats()
    } catch (error) {
      console.error('清除历史记录失败:', error)
    }
  },

  // 计算缓存大小
  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        let sizeStr = '0KB'
        if (res.currentSize > 0) {
          const sizeKb = res.currentSize
          const sizeMb = sizeKb / 1024

          if (sizeMb < 0.1) {
            sizeStr = `${sizeKb.toFixed(1)}KB`
          } else {
            sizeStr = `${sizeMb.toFixed(1)}MB`
          }
        }

        this.setData({ 
          cacheSize: sizeStr 
        }, () => {
          this.updateSettingsByMode()
        })
      },
      fail: (error) => {
        console.error('获取缓存大小失败:', error)
      }
    })
  },

  // 真正清除缓存
  clearCache() {
    // 获取需要保留的登录凭证
    const token = wx.getStorageSync('token')
    const currentUser = wx.getStorageSync('currentUser')

    // 显示清理中的提示
    wx.showLoading({ title: '清理中...' })

    setTimeout(() => {
      try {
        // 获取所有缓存的 key
        const res = wx.getStorageInfoSync()
        const keys = res.keys || []

        // 保留登录相关的关键数据
        const keepKeys = ['token', 'currentUser', 'pending_invite_code']

        // 逐个清除不需要的缓存
        keys.forEach(key => {
          if (!keepKeys.includes(key)) {
            try {
              wx.removeStorageSync(key)
            } catch (e) {
              // 忽略单个 key 清除失败
            }
          }
        })

        console.log('缓存清除成功')
        this.calculateCacheSize()
        wx.hideLoading()
        wx.showToast({ title: '数据已清除', icon: 'success' })
      } catch (error) {
        console.error('缓存清除失败:', error)
        wx.hideLoading()
        wx.showToast({ title: '数据清除失败', icon: 'none' })
      }
    }, 300)
  },



  async onWechatLogin(e) {
    wx.showLoading({ title: '微信登录中...' })

    try {
      const inviteCode = app.getPendingInviteCode()
      // 获取登录凭证 code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })

      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }

      // 调用后端微信登录接口，不传递用户信息
      const wechatRes = await api.auth.wechatLogin({
        code: loginRes.code,
        inviteCode
      })

      wx.hideLoading()
      if (wechatRes.success) {
        this.handleLoginSuccess(wechatRes.data)
      } else {
        wx.showToast({ title: wechatRes.message || '微信登录失败', icon: 'none' })
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      wx.hideLoading()
      wx.showToast({ title: '微信登录失败', icon: 'none' })
    }
  },

  handleLoginSuccess(data) {
    // 依据后端返回的 isNew 标识判断是否为新用户
    const isNewUser = data.isNew === true

    // 保存基础登录状态
    wx.setStorageSync('token', data.token)
    wx.setStorageSync('currentUser', data.user)
    app.clearPendingInviteCode()

    if (data.inviteResult && data.inviteResult.success) {
      wx.showToast({
        title: '邀请绑定成功',
        icon: 'success'
      })
    } else if (data.inviteResult && data.inviteResult.message) {
      wx.showToast({
        title: data.inviteResult.message,
        icon: 'none'
      })
    }

    // 如果是新用户或者昵称头像未完善，则拉起资料设置面板
    if (isNewUser) {
      this.setData({
        userInfo: data.user,
        isLoggedIn: false, // 资料完善弹框阶段先遮罩或延后更新全局状态
        showProfileSetup: true,
        tempAvatarUrl: '',
        tempNickname: ''
      })
      return
    }

    this.completeLoginProcess(data.user)
  },

  completeLoginProcess(user) {
    let localAvatar = wx.getStorageSync('userAvatar_' + user.id)
    // 云端头像：如果后端返回的是相对路径，拼接为完整 URL
    let cloudAvatar = ''
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads')) {
      cloudAvatar = config.assetHost + user.avatarUrl
    } else if (user.avatarUrl) {
      cloudAvatar = user.avatarUrl
    }

    if (!localAvatar && cloudAvatar && cloudAvatar.startsWith('http')) {
      localAvatar = cloudAvatar
      this.downloadCloudAvatarToLocal(cloudAvatar, user.id)
    }

    this.setData({
      userInfo: user,
      isLoggedIn: true,
      showProfileSetup: false,
      userAvatar: localAvatar || cloudAvatar || ''
    })

    app.globalData.userInfo = user
    app.globalData.isLoggedIn = true

    this.loadStats()
  },

  onOpenProfileSetup() {
    this.setData({
      showProfileSetup: true,
      isAvatarChanged: false,
      tempAvatarUrl: this.data.userAvatar || (this.data.userInfo && this.data.userInfo.avatarUrl) || '',
      tempNickname: (this.data.userInfo && this.data.userInfo.nickName !== '微信用户') ? this.data.userInfo.nickName : ''
    })
  },

  onCopyId() {
    const userId = this.data.userInfo.id
    if (userId) {
      wx.setClipboardData({
        data: userId.toString(),
        success: () => {
          wx.showToast({
            title: 'ID已复制',
            icon: 'success'
          })
        },
        fail: () => {
          wx.showToast({
            title: '复制失败',
            icon: 'none'
          })
        }
      })
    }
  },

  // 邮箱登录相关方法
  onEmailLogin() {
    this.setData({ showEmailLogin: true })
  },

  preventBubble() {
    // 阻止事件冒泡到遮罩层
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },


  onCancelEmailLogin() {
    this.setData({
      showEmailLogin: false,
      email: '',
      password: ''
    })
  },

  async onSubmitEmailLogin() {
    const { email, password } = this.data

    if (!email) {
      wx.showToast({ title: '请输入邮箱', icon: 'none' })
      return
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(email)) {
      wx.showToast({ title: '邮箱格式不正确', icon: 'none' })
      return
    }

    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }

    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })

    try {
      const res = await api.auth.login({
        email,
        password,
        inviteCode: app.getPendingInviteCode()
      })

      wx.hideLoading()
      if (res.success) {
        this.handleLoginSuccess(res.data)
        this.setData({
          showEmailLogin: false,
          email: '',
          password: ''
        })
      } else {
        wx.showToast({ title: res.message || '登录失败', icon: 'none' })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    }
  },

  // === 协议相关方法 ===

  onViewProtocol(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/protocol/protocol?type=${type}`
    })
  },

  // === 完善个人资料模块 ===

  onChooseAvatar(e) {
    try {
      const { avatarUrl } = e.detail
      if (avatarUrl) {
        this.setData({
          tempAvatarUrl: avatarUrl,
          isAvatarChanged: true
        })
      } else {
        wx.showToast({ title: '获取头像失败，请重试', icon: 'none' })
      }
    } catch (error) {
      console.error('选择头像失败:', error)
      wx.showToast({ title: '选择头像失败，请重试', icon: 'none' })
    }
  },

  onNicknameBlur(e) {
    this.setData({
      tempNickname: e.detail.value
    })
  },

  onCancelProfileSetup() {
    this.setData({
      showProfileSetup: false
    })

    // 如果处于新用户微信快捷登录被拦截的状态下，点击取消则直接应用默认身份使其完成登录
    if (!this.data.isLoggedIn && wx.getStorageSync('token')) {
      const user = wx.getStorageSync('currentUser')
      if (!user.nickName || user.nickName === '微信用户') {
        user.nickName = '微信用户'
      }
      wx.setStorageSync('currentUser', user)
      this.completeLoginProcess(user)
    }
  },

  async onSubmitProfileSetup() {
    const { tempAvatarUrl, tempNickname } = this.data
    const user = wx.getStorageSync('currentUser') || {}
    let updatedNickname = tempNickname.trim()

    wx.showLoading({ title: '保存资料中...' })

    try {
      // 1. 保存头像：只有当用户选择了新头像时才执行上传与持久化
      if (tempAvatarUrl && this.data.isAvatarChanged) {
        // 先上传到后端云端存储 (此时 tempAvatarUrl 临时文件权限还在)
        const token = wx.getStorageSync('token')
        try {
          const uploadRes = await new Promise((resolve, reject) => {
            wx.uploadFile({
              url: `${config.baseUrl}/users/avatar`,
              filePath: tempAvatarUrl,
              name: 'avatar',
              header: {
                'Authorization': 'Bearer ' + token
              },
              success: (res) => {
                try {
                  const data = JSON.parse(res.data)
                  resolve(data)
                } catch (e) {
                  reject(e)
                }
              },
              fail: reject
            })
          })

          if (uploadRes.success && uploadRes.data && uploadRes.data.avatarUrl) {
            // 同步更新本地用户信息中的云端头像 URL
            user.avatarUrl = uploadRes.data.avatarUrl
          }
        } catch (uploadErr) {
          console.error('头像上传云端失败:', uploadErr)
          // 纵然上传失败，也可以让他继续本地保存流程
        }

        // 云端上传完了之后，再把它转存持久化到本地（因为保存后临时文件可能会被回收或权限变动）
        // 使用 FileSystemManager 替代废弃的 wx.saveFile
        const fs = wx.getFileSystemManager()
        const ext = tempAvatarUrl.match(/\.[^.]+$/)?.[0] || '.png'
        const saveTarget = `${wx.env.USER_DATA_PATH}/user_avatar_${user.id || 'temp'}${ext}`

        const savedFilePath = await new Promise((resolve, reject) => {
          fs.saveFile({
            tempFilePath: tempAvatarUrl,
            filePath: saveTarget,
            success: (res) => resolve(res.savedFilePath),
            fail: reject
          })
        })

        wx.setStorageSync('userAvatar', savedFilePath)
        if (user && user.id) {
          wx.setStorageSync('userAvatar_' + user.id, savedFilePath)
        }
        this.setData({ userAvatar: savedFilePath })
      }

      // 2. 更新或使用默认昵称，提交至后台
      if (!updatedNickname) {
        updatedNickname = (user.nickName && user.nickName !== '微信用户') ? user.nickName : '微信用户'
      }

      // 调用后端更新昵称
      const updateRes = await api.user.updateProfile({ nickName: updatedNickname })

      wx.hideLoading()
      if (updateRes.success) {
        user.nickName = updatedNickname
        wx.setStorageSync('currentUser', user)
        this.completeLoginProcess(user)
      } else {
        wx.showToast({ title: updateRes.message || '资料更新失败', icon: 'none' })
      }
    } catch (error) {
      console.error('保存资料出错:', error)
      wx.hideLoading()
      wx.showToast({ title: '资料保存出错', icon: 'none' })
    }
  },

  onShareAppMessage() {
    return share.getDefaultShareConfig();
  },

  onShareTimeline() {
    return share.getDefaultShareConfig();
  }
})
