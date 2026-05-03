const api = require('../../utils/api')
const auth = require('../../utils/auth')

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

Page({
  data: {
    userPoints: 0,
    shopItems: [],
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
              url: '/pages/shop/shop'
            });
          }, 100);
        }
      });
      return;
    }

    this.loadShopItems()
    this.loadUserPoints()
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    this.loadUserPoints()
  },

  async loadShopItems() {
    try {
      const res = await api.shop.getItems()
      if (res.success) {
        this.setData({ shopItems: res.data.items })
      }
    } catch (error) {
      console.error('获取商城商品失败:', error)
    }
  },

  async loadUserPoints() {
    try {
      const res = await api.shop.getPoints()
      if (res.success) {
        const userPoints = Number(res.data.points) || 0
        syncUserPoints(userPoints)
        this.setData({ userPoints })
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
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

  async onExchange(e) {
    if (!auth.ensureLogin()) return

    const id = e.currentTarget.dataset.id
    const item = this.data.shopItems.find(i => i.id === id)

    if (this.data.userPoints < item.points) {
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定兑换「${item.name}」吗？需要${item.points}积分`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const exchangeRes = await api.shop.exchange(id)
            if (exchangeRes.success) {
              const remainingPoints = Number(exchangeRes.data.remainingPoints) || 0
              syncUserPoints(remainingPoints)
              this.setData({
                userPoints: remainingPoints
              })
              wx.showToast({
                title: '兑换成功',
                icon: 'success'
              })
            }
          } catch (error) {
            console.error('兑换失败:', error)
            wx.showToast({
              title: error.message || '兑换失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
