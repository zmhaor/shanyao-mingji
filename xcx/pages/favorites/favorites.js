const api = require('../../utils/api')
const auth = require('../../utils/auth')


Page({
  data: {
    favorites: [],
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
              url: '/pages/favorites/favorites'
            });
          }, 100);
        }
      });
      return;
    }

    if (!auth.isLoggedIn()) {
      wx.switchTab({ url: '/pages/profile/profile' })
      return
    }
    this.loadFavorites()
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
    this.loadFavorites()
  },

  async loadFavorites() {
    // 优先显示本地缓存的收藏记录
    const cachedFavorites = wx.getStorageSync('cached_favorites')
    if (cachedFavorites) {
      this.setData({ favorites: cachedFavorites })
    }

    try {
      const res = await api.favorites.getList()
      if (res.success && res.data && res.data.favorites) {
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

        const fullFavorites = res.data.favorites.map(fav => {
          // 优先使用后端返回的完整 tool 信息
          if (fav.tool && fav.tool.name) {
            const theme = THEME_MAP[fav.tool.name] || { bg: "rgba(248, 250, 252, 0.8)", border: "rgba(226, 232, 240, 0.8)" };
            return {
              ...fav,
              name: fav.tool.name,
              description: fav.tool.description,
              icon: LOCAL_ICON_MAP[fav.tool.name] || fav.tool.icon || '🔧',
              themeColor: theme.bg,
              borderColor: theme.border
            }
          }

          // 兜底逻辑：匹配本地字典
          const defaultAllTools = [
            { id: 999, name: '伤寒速速通', description: '基于艾宾浩斯记忆法的《伤寒论》智能背诵与复习工具', icon: '/images/伤寒速速通.png' },
            { id: 1000, name: '方剂轻松过', description: '方剂学背诵工具，包含方剂组成、功效、主治等信息', icon: '/images/方剂轻松过.png' },
            { id: 1001, name: '内经随身背', description: '《黄帝内经》选读工具，包含原文与注释，支持记忆功能', icon: '/images/内经随身背.png' },
            { id: 1002, name: '中药快快记', description: '系统学习中药学知识，掌握各味药材的性味归经与功效', icon: '/images/中药快快记.png' },
            { id: 1003, name: '金匮简易考', description: '提供金匮要略背诵服务', icon: '/images/金匮简易考.png' },
            { id: 1004, name: '温病掌上学', description: '提供温病学核心背诵服务', icon: '/images/温病掌上学.png' }
          ]

          const toolData = defaultAllTools.find(t => String(t.id) === String(fav.toolId)) || {}
          const toolName = toolData.name || '未知工具'
          const theme = THEME_MAP[toolName] || { bg: "rgba(248, 250, 252, 0.8)", border: "rgba(226, 232, 240, 0.8)" }

          return {
            ...fav,
            name: toolName,
            description: toolData.description || '暂无描述',
            icon: LOCAL_ICON_MAP[toolName] || toolData.icon || '🔧',
            themeColor: theme.bg,
            borderColor: theme.border
          }
        })

        this.setData({ favorites: fullFavorites })
        // 更新本地缓存
        wx.setStorageSync('cached_favorites', fullFavorites)
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      if (!cachedFavorites) {
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
  },

  goToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.favorites.find(f => String(f.id) === String(id) || String(f.toolId) === String(id));

    if (item && item.name) {
      const typeMap = {
        "伤寒速速通": "shanghan",
        "方剂轻松过": "fangji",
        "内经随身背": "neijing",
        "中药快快记": "zhongyao",
        "金匮简易考": "jinkui",
        "温病掌上学": "wenbing"
      };
      const type = typeMap[item.name];
      if (type) {
        wx.navigateTo({ url: `/pages/study/study?type=${type}&id=${id}` });
        return;
      }
    }

    wx.navigateTo({
      url: `/pages/tool-detail/tool-detail?id=${id}`
    })
  },

  async onUnfavorite(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定取消收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.favorites.remove(id)
            const favorites = this.data.favorites.filter(item => item.id !== id && item.toolId !== id)
            this.setData({ favorites })
            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            })
          } catch (error) {
            console.error('取消收藏失败:', error)
            wx.showToast({
              title: '取消收藏失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
})
