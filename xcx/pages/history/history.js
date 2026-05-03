const api = require('../../utils/api')
const auth = require('../../utils/auth')


Page({
  data: {
    historyList: [],
    isDarkMode: false
  },

  onLoad() {
    if (!auth.isLoggedIn()) {
      wx.switchTab({ url: '/pages/profile/profile' })
      return
    }
    this.loadHistory()
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    this.loadHistory()
  },

  async loadHistory() {
    // 优先显示本地缓存的历史记录
    const cachedHistory = wx.getStorageSync('cached_history')
    if (cachedHistory) {
      this.setData({ historyList: cachedHistory })
    }

    try {
      const res = await api.history.getList()
      if (res.success) {
        const THEME_MAP = {
          "伤寒速速通": {
            bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%)",
            border: "rgba(99, 102, 241, 0.3)"
          },
          "方剂轻松过": {
            bg: "linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(244, 63, 94, 0.2) 100%)",
            border: "rgba(244, 114, 182, 0.3)"
          },
          "内经随身背": {
            bg: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(249, 115, 22, 0.2) 100%)",
            border: "rgba(234, 179, 8, 0.3)"
          },
          "中药快快记": {
            bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.2) 100%)",
            border: "rgba(16, 185, 129, 0.3)"
          },
          "金匮简易考": {
            bg: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 100%)",
            border: "rgba(239, 68, 68, 0.3)"
          },
          "温病掌上学": {
            bg: "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(13, 148, 136, 0.2) 100%)",
            border: "rgba(20, 184, 166, 0.3)"
          }
        }

        const LOCAL_ICON_MAP = {
          "伤寒速速通": "/images/伤寒速速通.png",
          "方剂轻松过": "/images/方剂轻松过.png",
          "内经随身背": "/images/内经随身背.png",
          "中药快快记": "/images/中药快快记.png",
          "金匮简易考": "/images/金匮简易考.png",
          "温病掌上学": "/images/温病掌上学.png"
        }

        const historyData = (res.data.history || []).map(item => {
          const toolName = (item.tool && item.tool.name) || "";
          const theme = THEME_MAP[toolName] || { bg: "rgba(248, 250, 252, 0.8)", border: "rgba(226, 232, 240, 0.8)" };

          if (item.tool) {
            item.tool.icon = LOCAL_ICON_MAP[toolName] || item.tool.icon;
            item.tool.themeColor = theme.bg;
            item.tool.borderColor = theme.border;
          }
          return item;
        }).slice(0, 20)

        this.setData({ historyList: historyData })
        // 更新本地缓存
        wx.setStorageSync('cached_history', historyData)
      }
    } catch (error) {
      console.error('获取历史记录失败:', error)
      if (!cachedHistory) {
        wx.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
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
  }
})