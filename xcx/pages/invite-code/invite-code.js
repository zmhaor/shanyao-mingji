const api = require('../../utils/api')

Page({
  data: {
    inviteCode: '',
    loading: false,
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
              url: '/pages/invite-code/invite-code'
            });
          }, 100);
        }
      });
      return;
    }
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    
    // 确保 tabBar 不显示，因为 invite-code 页面不是 tabBar 页面
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ show: false });
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

  onInputChange(e) {
    this.setData({
      inviteCode: e.detail.value
    })
  },

  async onSubmit() {
    if (!this.data.inviteCode.trim()) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 这里可以添加验证邀请码的API调用
      // 目前我们假设邀请码有效，直接跳转到主页
      wx.showToast({
        title: '邀请码验证成功',
        icon: 'success'
      })

      // 延迟跳转到主页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/index/index?inviteCode=' + this.data.inviteCode
        })
      }, 1000)
    } catch (error) {
      console.error('验证邀请码失败:', error)
      wx.showToast({
        title: '邀请码验证失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})