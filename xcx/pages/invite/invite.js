const api = require('../../utils/api')
const share = require('../../utils/share')
const app = getApp()

function normalizeInviteCode(inviteCode) {
  return String(inviteCode || '').trim().toUpperCase()
}

Page({
  data: {
    inviteCount: 0,
    rewardPoints: 750,
    inviteCode: '',
    inviteRewardPoints: 50,
    invitedUserRewardPoints: 100,
    inputInviteCode: '',
    inviteCodeSubmitted: false,
    loading: true,
    inviteEligibleDays: 3,
    sharedInviteCode: '',
    autoApplyingInvite: false,
    isDarkMode: false
  },

  onLoad(options) {
    // 检查是否从分享卡片进入（页面栈只有一个页面）
    const pages = getCurrentPages();
    if (pages.length === 1) {
      // 先跳转到首页，再跳回当前页面，确保页面栈中有多个页面
      wx.switchTab({ 
        url: '/pages/index/index',
        success: () => {
          setTimeout(() => {
            wx.navigateTo({ 
              url: '/pages/invite/invite' + (options.inviteCode ? '?inviteCode=' + options.inviteCode : '')
            });
          }, 100);
        }
      });
      return;
    }

    this.captureSharedInviteCode(options)
    this.loadUserInfo().then(() => {
      this.tryAutoApplyInviteCode()
    })
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    this.loadUserInfo().then(() => {
      this.tryAutoApplyInviteCode()
    })
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

  noop() {},

  captureSharedInviteCode(options = {}) {
    const inviteCode = normalizeInviteCode(options.inviteCode || app.getPendingInviteCode())
    if (!inviteCode) {
      return
    }

    app.setPendingInviteCode(inviteCode)
    this.setData({
      sharedInviteCode: inviteCode,
      inputInviteCode: inviteCode
    })
  },

  async loadUserInfo() {
    try {
      const token = wx.getStorageSync('token')
      if (!token) {
        this.setData({ inviteCode: '请先登录', loading: false })
        return
      }

      const updateData = {}

      try {
        const [userRes, rewardRes] = await Promise.all([
          api.user.getInfo(),
          api.user.getInviteReward()
        ])

        if (userRes.success) {
          Object.assign(updateData, {
            inviteCode: userRes.data.inviteCode || '获取失败',
            inviteCount: userRes.data.inviteCount || 0,
            rewardPoints: userRes.data.points || 0,
            inviteCodeSubmitted: userRes.data.inviteCodeSubmitted || false,
            inviteEligibleDays: userRes.data.inviteEligibleDays || 3
          })
        }

        if (rewardRes.success) {
          Object.assign(updateData, {
            inviteRewardPoints: rewardRes.data.inviteRewardPoints || 50,
            invitedUserRewardPoints: rewardRes.data.invitedUserRewardPoints || 100
          })
        }
      } catch (err) {
        console.error('获取信息详情失败:', err)
        updateData.inviteCode = '获取失败'
      }

      this.setData({ ...updateData, loading: false })
    } catch (error) {
      console.error('加载用户信息致命错误:', error)
      this.setData({ inviteCode: '获取失败', loading: false })
    }
  },

  async tryAutoApplyInviteCode() {
    const token = wx.getStorageSync('token')
    const sharedInviteCode = normalizeInviteCode(this.data.sharedInviteCode || app.getPendingInviteCode())

    if (!token || !sharedInviteCode || this.data.autoApplyingInvite) {
      return
    }

    if (sharedInviteCode === normalizeInviteCode(this.data.inviteCode)) {
      app.clearPendingInviteCode()
      return
    }

    if (this.data.inviteCodeSubmitted) {
      app.clearPendingInviteCode()
      return
    }

    this.setData({ autoApplyingInvite: true })
    try {
      const result = await this.submitInviteCode(sharedInviteCode, { auto: true })
      if (result) {
        app.clearPendingInviteCode()
      }
    } finally {
      this.setData({ autoApplyingInvite: false })
    }
  },

  onCopyCode() {
    const { inviteCode } = this.data

    if (!inviteCode || inviteCode === '加载中...' || inviteCode === '请先登录' || inviteCode === '获取失败') {
      wx.showToast({
        title: inviteCode === '请先登录' ? '请先登录' : '邀请码获取失败',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: inviteCode,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        })
      }
    })
  },

  onInviteCodeInput(e) {
    this.setData({
      inputInviteCode: e.detail.value
    })
  },

  async onSubmitInviteCode() {
    await this.submitInviteCode(this.data.inputInviteCode, { auto: false })
  },

  async submitInviteCode(inviteCode, { auto = false } = {}) {
    const normalizedCode = normalizeInviteCode(inviteCode)

    if (this.data.inviteCodeSubmitted) {
      wx.showToast({
        title: '你已完成推荐人绑定',
        icon: 'none'
      })
      return false
    }

    if (!normalizedCode) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      })
      return false
    }

    if (normalizedCode.length !== 8) {
      wx.showToast({
        title: '邀请码格式不正确，请输入8位邀请码',
        icon: 'none'
      })
      return false
    }

    wx.showLoading({
      title: auto ? '绑定中...' : '提交中...',
      mask: true
    })

    try {
      const res = await api.user.submitInviteCode({ inviteCode: normalizedCode })

      if (res.success) {
        this.setData({
          inviteCodeSubmitted: true,
          inputInviteCode: '',
          sharedInviteCode: normalizedCode
        })

        await this.loadUserInfo()
        app.clearPendingInviteCode()

        wx.showToast({
          title: auto ? '邀请已自动绑定' : '邀请码提交成功',
          icon: 'success'
        })
        return true
      }

      wx.showToast({
        title: res.message || '邀请码提交失败',
        icon: 'none'
      })
      if (auto) {
        app.clearPendingInviteCode()
      }
      return false
    } catch (error) {
      console.error('提交邀请码失败:', error)
      wx.showToast({
        title: error.message || '邀请码提交失败，请稍后重试',
        icon: 'none'
      })
      return false
    } finally {
      wx.hideLoading()
    }
  },

  onShareAppMessage() {
    const inviteCode = normalizeInviteCode(this.data.inviteCode)
    return share.getDefaultShareConfig({
      title: '邀请你一起用山药铭记学习，完成绑定双方都能得积分',
      path: inviteCode ? `/pages/invite/invite?inviteCode=${inviteCode}` : '/pages/invite/invite',
      imageUrl: '/images/邀请好友.png'
    })
  },

  onShareTimeline() {
    const inviteCode = normalizeInviteCode(this.data.inviteCode)
    return {
      title: '邀请你一起用山药铭记学习',
      query: inviteCode ? `inviteCode=${inviteCode}` : '',
      imageUrl: '/images/邀请好友.png'
    }
  }
})
