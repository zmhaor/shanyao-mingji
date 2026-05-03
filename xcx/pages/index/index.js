const api = require("../../utils/api")
const share = require("../../utils/share")
const auth = require("../../utils/auth")
const contentUtils = require("../../utils/content")
const config = require("../../utils/config")
const { mergeCustomGroups } = require("../../utils/custom-groups")
const app = getApp()
/*

// 导入全站搜索所需数据源
const dataSources = {
  shanghan: require("../../utils/data_shanghan.js"),
  fangji: require("../../utils/data_fangji.js"),
  neijing: require("../../utils/data_neijing.js"),
  zhongyao: require("../../utils/data_zhongyao.js"),
  jinkui: require("../../utils/data_jinkui.js"),
  wenbing: require("../../utils/data_wenbing.js")
}



*/
const TOOL_SYNC_MAP = {
  shanghan: { storageKey: "shanghan_comments_history", toolName: "shanghan", label: "伤寒速速通", customGroupsKey: "shanghan_comments_custom_groups", dataTypes: ['history', 'groups'] },
  fangji: { storageKey: "fangji_comments_history", hiddenMapKey: "fangji_comments_hidden_map", toolName: "fangji", label: "方剂轻松过", customGroupsKey: "fangji_comments_custom_groups", formulaSongVersionsKey: "fangji_comments_formula_song_versions", dataTypes: ['history', 'groups', 'formulaVersion'] },
  neijing: { storageKey: "neijing_comments_history", toolName: "neijing", label: "内经随身背", customGroupsKey: "neijing_comments_custom_groups", dataTypes: ['history', 'groups'] },
  zhongyao: { storageKey: "zhongyao_comments_history", toolName: "zhongyao", label: "中药快快记", customGroupsKey: "zhongyao_comments_custom_groups", dataTypes: ['history', 'groups'] },
  jinkui: { storageKey: "jinkui_comments_history", toolName: "jinkui", label: "金匮简易考", customGroupsKey: "jinkui_comments_custom_groups", dataTypes: ['history', 'groups'] },
  wenbing: { storageKey: "wenbing_comments_history", toolName: "wenbing", label: "温病掌上学", customGroupsKey: "wenbing_comments_custom_groups", dataTypes: ['history', 'groups'] }
}

// 数据类型显示名称映射
const DATA_TYPE_LABELS = {
  history: '检查记录',
  groups: '背诵组',
  formulaVersion: '方歌版本',
  hiddenMap: '隐藏映射'
}

const LOCAL_ICON_MAP = {
  "伤寒速速通": "/images/伤寒速速通.png",
  "方剂轻松过": "/images/方剂轻松过.png",
  "内经随身背": "/images/内经随身背.png",
  "中药快快记": "/images/中药快快记.png",
  "金匮简易考": "/images/金匮简易考.png",
  "温病掌上学": "/images/温病掌上学.png"
}

// 备忘录工具
const MEMO_TOOL = {
  id: "memo",
  name: "备忘录",
  description: "个人备忘录工具",
  icon: "/images/随时背.png",
  category: "实用工具",
  themeColor: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%)",
  borderColor: "rgba(99, 102, 241, 0.3)"
}

// 默认工具列表（前端硬编码，不依赖后端）
const DEFAULT_TOOLS = [
  {
    id: "shanghan",
    name: "伤寒速速通",
    description: "提供伤寒背诵服务",
    icon: "/images/伤寒速速通.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.2) 100%)",
    borderColor: "rgba(99, 102, 241, 0.3)"
  },
  {
    id: "fangji",
    name: "方剂轻松过",
    description: "提供方剂背诵服务",
    icon: "/images/方剂轻松过.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(244, 63, 94, 0.2) 100%)",
    borderColor: "rgba(244, 114, 182, 0.3)"
  },
  {
    id: "neijing",
    name: "内经随身背",
    description: "提供内经背诵服务",
    icon: "/images/内经随身背.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(249, 115, 22, 0.2) 100%)",
    borderColor: "rgba(234, 179, 8, 0.3)"
  },
  {
    id: "zhongyao",
    name: "中药快快记",
    description: "提供中药学背诵服务",
    icon: "/images/中药快快记.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.2) 100%)",
    borderColor: "rgba(16, 185, 129, 0.3)"
  },
  {
    id: "jinkui",
    name: "金匮简易考",
    description: "提供金匮要略背诵服务",
    icon: "/images/金匮简易考.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.2) 100%)",
    borderColor: "rgba(239, 68, 68, 0.3)"
  },
  {
    id: "wenbing",
    name: "温病掌上学",
    description: "提供温病学核心背诵服务",
    icon: "/images/温病掌上学.png",
    category: "学习助手",
    themeColor: "linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(13, 148, 136, 0.2) 100%)",
    borderColor: "rgba(20, 184, 166, 0.3)"
  }
]

// 获取当前模式下的工具列表
function getToolsByMode() {
  const isAuditMode = app.isAuditMode()
  if (isAuditMode) {
    // 特殊模式：仅显示备忘录工具
    return [MEMO_TOOL]
  } else {
    // 正常模式：显示全部工具，不显示备忘录工具
    return DEFAULT_TOOLS
  }
}

Page({
  data: {
    currentCategory: 0,
    categories: ["全部", "我的收藏"],
    searchKeyword: "",
    tools: [],
    filteredTools: [],
    loading: false,
    loadStatusText: "",
    showLoadStatus: false,
    usingCachedTools: false,
    showSettingsModal: false,
    isModalClosing: false,
    settingsTools: Object.values(TOOL_SYNC_MAP),
    selectedSyncKey: "shanghan",
    globalSearchResults: [], // 全局搜索结果
    scrollNotices: [], // 滚动公告列表
    showNoticeModal: false, // 是否显示公告列表弹窗
    isNoticeModalClosing: false, // 弹窗是否正在关闭（用于动画）
    isDarkMode: false,
    // 同步弹窗相关（合并到设置弹窗）
    syncTypeModalMode: 'upload', // 弹窗模式：upload 或 download
    availableDataTypes: [], // 当前工具可用的数据类型
    selectedDataTypes: [], // 已选择的数据类型
    dataTypeCheckMap: {}, // 数据类型选中状态映射
    syncHistoryList: [], // 同步历史列表
    selectedHistoryIds: [], // 选择的历史记录ID列表
    showHistorySelector: false, // 是否显示历史记录选择器
    showSyncActions: false // 是否显示同步操作区域
  },

  onLoad() {
    this._skipNextOnShowRefresh = true
    this.loadCategories()
    this.bootstrapToolsLoad({ showLoading: true })
    this.loadScrollNotice()
  },

  onShow() {
    this.loadCategories()

    if (this._skipNextOnShowRefresh) {
      this._skipNextOnShowRefresh = false
    } else {
      // 性能优化：延迟执行重负载的同步逻辑
      // 目的：避开小程序“左滑返回”或“侧滑菜单”时的转场动画时间（约 300ms）
      // 这样可以确保 CPU 优先保障动画流畅度，动画结束后再进行静默数据校对
      setTimeout(() => {
        this.bootstrapToolsLoad({ showLoading: false })
      }, 350)
    }

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
      this.getTabBar().updateTheme()
    }
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);
  },

  onUnload() {
    this.clearLoadTimers()
  },

  clearLoadTimers() {
    if (this._toolsLoadingTimer) {
      clearTimeout(this._toolsLoadingTimer)
      this._toolsLoadingTimer = null
    }
  },

  bootstrapToolsLoad(options = {}) {
    const showLoading = options.showLoading !== false
    this.loadFavoritesAndTools({ showLoading })
    app.loadAuditMode(() => {
      if (app.isAuditMode() !== this._lastRenderedAuditMode) {
        this.loadFavoritesAndTools({ showLoading })
      }
    })
  },

  loadCategories() {
    const cachedCategories = wx.getStorageSync("cached_categories")
    if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
      this.setData({ categories: cachedCategories })
    }

    wx.request({
      url: `${config.baseUrl}/tools/categories`,
      method: "GET",
      success: (res) => {
        if (res?.data?.success) {
          const categoryNames = ["全部", "我的收藏"]
          const categories = res.data?.data?.categories || []
          categories.forEach((category) => {
            if (category?.name) categoryNames.push(category.name)
          })
          this.setData({ categories: categoryNames })
          wx.setStorageSync("cached_categories", categoryNames)
        }
      },
      fail: (error) => {
        console.error("获取分类列表失败:", error)
      }
    })
  },

  loadScrollNotice() {
    api.notice.getActive({ type: "scroll" })
      .then(res => {
        if (res?.success && res.data) {
          const notices = Array.isArray(res.data) ? res.data : [res.data]
          this.setData({ scrollNotices: notices })
        }
      })
      .catch(error => {
        console.error("获取滚动公告失败:", error)
      })
  },

  onTapNotice() {
    if (!this.data.scrollNotices || this.data.scrollNotices.length === 0) return

    this.setData({
      showNoticeModal: true,
      isNoticeModalClosing: false
    })
  },

  onCloseNoticeModal() {
    this.setData({ isNoticeModalClosing: true })
    setTimeout(() => {
      this.setData({
        showNoticeModal: false,
        isNoticeModalClosing: false
      })
    }, 300)
  },

  async loadFavoritesAndTools(options = {}) {
    const shouldShowLoading = options.showLoading !== false || this.data.tools.length === 0
    this.clearLoadTimers()
    const loadId = Date.now()
    this._currentToolsLoadId = loadId

    if (shouldShowLoading) {
      this.setData({
        loading: true,
        showLoadStatus: true,
        loadStatusText: "正在连接服务器，最多等待 5 秒后将先显示本地缓存工具",
        usingCachedTools: false
      })
    } else {
      this.setData({
        loading: false,
        showLoadStatus: false,
        loadStatusText: "",
        usingCachedTools: false
      })
    }

    // 获取当前模式下的工具列表
    const modeTools = getToolsByMode()
    this._lastRenderedAuditMode = app.isAuditMode()

    // 检查系统模式状态是否已获取
    if (app.globalData.isAuditMode === undefined) {
      // 等待系统模式状态获取
      await new Promise(resolve => {
        app.loadAuditMode(resolve)
      })
    }

    // 获取缓存的下架工具列表
    const cachedInactiveNames = wx.getStorageSync("inactive_tool_names") || []
    const inactiveSet = new Set(cachedInactiveNames)

    // 清除过期的工具列表缓存
    const cachedTools = wx.getStorageSync("cached_tools")
    let initialTools = []

    // 检查缓存是否与当前模式匹配
    const isCacheValid = Array.isArray(cachedTools) && cachedTools.length > 0 && 
      cachedTools.every(ct => modeTools.some(dt => dt.id === ct.id))

    if (isCacheValid) {
      initialTools = cachedTools.map(ct => {
        const defaultTool = modeTools.find(dt => dt.id === ct.id);
        if (defaultTool) {
          return { ...ct, name: defaultTool.name, icon: defaultTool.icon, description: defaultTool.description };
        }
        return ct;
      }).filter(ct => modeTools.some(dt => dt.id === ct.id)); // 只保留当前模式下的工具
    } else {
      // 缓存无效时，使用当前模式下的工具列表
      initialTools = modeTools
      // 清除过期缓存
      wx.removeStorageSync("cached_tools")
    }

    // 使用缓存的下架工具列表进行过滤，避免初始渲染时显示已下架工具
    const filteredInitialTools = initialTools.filter(t => !inactiveSet.has(t.name))

    // 立即渲染，确保零延迟
    this.refreshToolsData(filteredInitialTools)

    if (shouldShowLoading) {
      this._toolsLoadingTimer = setTimeout(() => {
        if (this._currentToolsLoadId !== loadId) return
        this.setData({
          loading: false,
          showLoadStatus: true,
          loadStatusText: filteredInitialTools.length > 0
            ? "网络连接较慢，已先显示本地缓存工具"
            : "网络连接较慢，暂未获取到工具数据",
          usingCachedTools: filteredInitialTools.length > 0
        })
      }, 5000)
    }

    // --- 第二阶段：异步校对 ---
    let favoriteIds = new Set()
    const token = wx.getStorageSync("token")

    // 并行执行收藏获取和工具列表更新
    const tasks = []

    if (token) {
      tasks.push(Promise.race([
        api.favorites.getList().then(favRes => {
          const favorites = favRes?.data?.favorites || favRes?.data || []
          favorites.forEach(item => {
            const id = item.toolId || item.tool_id || item.id
            if (id) favoriteIds.add(id)
          })
          return favoriteIds
        }).catch(err => {
          console.error("获取收藏失败:", err)
          return favoriteIds
        }),
        new Promise(resolve => {
          setTimeout(() => resolve(favoriteIds), 5000)
        })
      ]))
    }

    // 后端工具状态请求（仅在正常模式下）
    if (!app.isAuditMode()) {
      wx.request({
        url: `${config.baseUrl}/tools`,
        method: "GET",
        data: { pageSize: 100 },
        timeout: 5000,
        success: async (res) => {
          if (this._currentToolsLoadId !== loadId) return
          if (res?.data?.success && Array.isArray(res.data?.data?.tools)) {
            const backendTools = res.data.data.tools
            const currentInactiveNames = []
            backendTools.forEach(t => { if (t.status === "inactive") currentInactiveNames.push((t.name || "").trim()) })

            // 更新下架缓存
            wx.setStorageSync("inactive_tool_names", currentInactiveNames)
            const latestInactiveSet = new Set(currentInactiveNames)

            // 等待收藏数据（如果正在获取）
            if (tasks.length > 0) await tasks[0]

            const finalTools = modeTools
              .filter(t => !latestInactiveSet.has(t.name))
              .map(tool => {
                const bt = backendTools.find(bt => (bt.name || "").trim() === tool.name)
                return {
                  ...tool,
                  id: bt ? bt.id : tool.id,
                  description: (bt && bt.description) ? bt.description : tool.description,
                  isFavorite: favoriteIds.has(bt ? bt.id : tool.id)
                }
              })

            // 对比数据是否有实质性变化，减少无谓的渲染
            const currentToolsStr = JSON.stringify(this.data.tools)
            const finalToolsStr = JSON.stringify(finalTools)
            if (currentToolsStr !== finalToolsStr) {
              this.refreshToolsData(finalTools)
            }

            this.setData({
              usingCachedTools: false,
              showLoadStatus: false,
              loadStatusText: "",
              loading: false
            })
          }
        },
        fail: (err) => {
          if (this._currentToolsLoadId !== loadId) return
          console.warn("后端同步失败，保持当前状态:", err)
          if (shouldShowLoading) {
            this.setData({
              showLoadStatus: true,
              loadStatusText: filteredInitialTools.length > 0
                ? "当前网络不可用，已显示本地缓存工具"
                : "当前网络不可用，请稍后重试",
              usingCachedTools: filteredInitialTools.length > 0
            })
          }
        },
        complete: () => {
          if (this._currentToolsLoadId !== loadId) return
          this.clearLoadTimers()
          if (shouldShowLoading) {
            this.setData({ loading: false })
          }
        }
      })
    } else {
      // 特殊模式下直接完成
      this.clearLoadTimers()
      this.setData({
        loading: false,
        showLoadStatus: false,
        loadStatusText: "",
        usingCachedTools: false
      })
    }
  },

  // 统一的渲染入口，合并 setData 减少抖动
  refreshToolsData(tools) {
    // 处理过滤逻辑
    let filtered = [...tools]
    if (this.data.currentCategory > 0 && this.data.currentCategory < this.data.categories.length) {
      const categoryName = this.data.categories[this.data.currentCategory]
      if (categoryName === "我的收藏") {
        filtered = filtered.filter(tool => tool.isFavorite === true)
      } else if (categoryName !== "全部") {
        filtered = filtered.filter(tool => tool.category === categoryName)
      }
    }

    const keyword = (this.data.searchKeyword || "").trim().toLowerCase()
    if (keyword) {
      filtered = filtered.filter(tool =>
        (tool.name || "").toLowerCase().includes(keyword)
        || (tool.description || "").toLowerCase().includes(keyword)
      )
    }

    // 合并到一个更新周期
    this.setData({
      tools: tools,
      filteredTools: filtered
    })

    // 持久化完整缓存
    wx.setStorageSync("cached_tools", tools)
  },

  applyToolsAndSet(tools, favoriteIds) {
    // 兼容旧调用，转发到新方法
    const withFavoriteState = tools.map(tool => ({
      ...tool,
      isFavorite: favoriteIds.has(tool.id)
    }))
    this.refreshToolsData(withFavoriteState)
  },


  onCategoryTap(e) {
    const index = Number(e.currentTarget.dataset.index || 0)
    this.setData({ currentCategory: index })
    this.filterTools()
  },

  openSearchPage() {
    wx.navigateTo({
      url: "/pages/search/search"
    })
  },

  onSearchInput(e) {
    const keyword = e.detail.value || ""
    this.setData({ searchKeyword: keyword })
    this.filterTools()
    this.performGlobalSearch(keyword)
    this.updateTabBarVisibility(!keyword)
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value || ""
    this.setData({ searchKeyword: keyword })
    this.filterTools()
    this.performGlobalSearch(keyword)
    this.updateTabBarVisibility(!keyword)
  },

  onClearSearch() {
    this.setData({ searchKeyword: "", globalSearchResults: [] })
    this.filterTools()
    this.updateTabBarVisibility(true)
  },

  filterTools() {
    let result = [...this.data.tools]

    if (this.data.currentCategory > 0 && this.data.currentCategory < this.data.categories.length) {
      const categoryName = this.data.categories[this.data.currentCategory]
      if (categoryName === "我的收藏") {
        result = result.filter(tool => tool.isFavorite === true)
      } else if (categoryName !== "全部") {
        result = result.filter(tool => tool.category === categoryName)
      }
    }

    const keyword = (this.data.searchKeyword || "").trim().toLowerCase()
    if (keyword) {
      result = result.filter(tool =>
        (tool.name || "").toLowerCase().includes(keyword)
        || (tool.description || "").toLowerCase().includes(keyword)
      )
    }

    this.setData({ filteredTools: result })
  },

  /**
   * 执行全站内容深度搜索
   */
  performGlobalSearch(keyword) {
    const kw = (keyword || "").trim().toLowerCase()
    if (!kw || kw.length < 1) {
      this.setData({ globalSearchResults: [] })
      return
    }

    const results = []
    const TOOL_CONFIGS = [
      { key: 'shanghan', name: '伤寒速速通', icon: '/images/伤寒速速通.png' },
      { key: 'fangji', name: '方剂轻松过', icon: '/images/方剂轻松过.png' },
      { key: 'neijing', name: '内经随身背', icon: '/images/内经随身背.png' },
      { key: 'zhongyao', name: '中药快快记', icon: '/images/中药快快记.png' },
      { key: 'jinkui', name: '金匮简易考', icon: '/images/金匮简易考.png' },
      { key: 'wenbing', name: '温病掌上学', icon: '/images/温病掌上学.png' }
    ]

    TOOL_CONFIGS.forEach(config => {
      const source = dataSources[config.key]
      if (!source || !Array.isArray(source.entries)) return

      // 遍历时记录原始索引，用于补齐缺失 id (兼容方剂、中药等)
      const matches = source.entries.map((item, idx) => ({
        ...item,
        _search_id_: item.clauseNum || item.id || (idx + 1)
      })).filter(entry => {
        const nameMatch = (entry.name || entry.title || "").toLowerCase().includes(kw)
        const textMatch = (entry.text || entry.function || "").toLowerCase().includes(kw)
        const noteMatch = (entry.note || entry.composition || entry.memo || "").toLowerCase().includes(kw)
        return nameMatch || textMatch || noteMatch
      }).slice(0, 5)

      if (matches.length > 0) {
        results.push({
          toolKey: config.key,
          toolName: config.name,
          toolIcon: config.icon,
          items: matches.map(m => ({
            id: m._search_id_,
            title: m.name || m.title || "未知条目",
            snippet: (m.text || m.function || "").substring(0, 30) + "..."
          }))
        })
      }
    })

    this.setData({ globalSearchResults: results })
  },

  updateTabBarVisibility(isVisible) {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        show: isVisible
      })
    }
  },

  onGlobalResultTap(e) {
    const { tool, id } = e.currentTarget.dataset
    if (!tool || !id) return

    // 获取点击条目的标题，用于在目标页自动搜索
    let targetTitle = ""
    const group = this.data.globalSearchResults.find(g => g.toolKey === tool)
    if (group) {
      const item = group.items.find(i => i.id === id)
      if (item) targetTitle = item.title
    }

    wx.navigateTo({
      url: `/pages/study/study?type=${tool}&targetTitle=${targetTitle}&tab=read`
    })
  },

  async onFavoriteTap(e) {
    if (!auth.ensureLogin({ showModal: false, immediate: true })) {
      return
    }

    const id = e.currentTarget.dataset.id
    const tools = [...this.data.tools]
    const toolIndex = tools.findIndex(t => t.id === id)
    if (toolIndex < 0) return

    const current = tools[toolIndex]
    const nextFavorite = !current.isFavorite
    tools[toolIndex] = { ...current, isFavorite: nextFavorite }
    this.setData({ tools })
    wx.setStorageSync("cached_tools", tools)
    this.filterTools()

    try {
      if (nextFavorite) {
        await api.favorites.add(id)
      } else {
        await api.favorites.remove(id)
      }
    } catch (error) {
      console.error("收藏操作失败:", error)
      tools[toolIndex] = current
      this.setData({ tools })
      wx.setStorageSync("cached_tools", tools)
      this.filterTools()
      wx.showToast({ title: "网络连接失败", icon: "none" })
    }
  },

  onToolTap(e) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name

    // 从缓存或当前模式工具列表找对应的 id，增加鲁棒性
    let toolId = this.data.tools.find(t => t.name === name)?.id;
    if (!toolId) {
      const modeTools = getToolsByMode();
      const dt = modeTools.find(t => t.name === name);
      if (dt) toolId = dt.id;
    }

    if (toolId === "memo" || name === "备忘录") {
      wx.navigateTo({ url: `/pages/memo/index` })
    } else if (toolId === "shanghan" || name === "伤寒速速通") {
      wx.navigateTo({ url: `/pages/study/study?type=shanghan&id=${id}` })
    } else if (toolId === "fangji" || name === "方剂轻松过") {
      wx.navigateTo({ url: `/pages/study/study?type=fangji&id=${id}` })
    } else if (toolId === "neijing" || name === "内经随身背") {
      wx.navigateTo({ url: `/pages/study/study?type=neijing&id=${id}` })
    } else if (toolId === "zhongyao" || name === "中药快快记") {
      wx.navigateTo({ url: `/pages/study/study?type=zhongyao&id=${id}` })
    } else if (toolId === "jinkui" || name === "金匮简易考") {
      wx.navigateTo({ url: `/pages/study/study?type=jinkui&id=${id}` })
    } else if (toolId === "wenbing" || name === "温病掌上学" || name === "温病掌中学") {
      wx.navigateTo({ url: `/pages/study/study?type=wenbing&id=${id}` })
    } else {
      wx.showToast({ title: "工具暂未开放", icon: "none" })
    }
  },

  onShowSettings() {
    if (!auth.ensureLogin({ showModal: false, immediate: true })) return

    const selectedKey = this.data.selectedSyncKey || "shanghan"
    const config = TOOL_SYNC_MAP[selectedKey]
    const dataTypes = config ? (config.dataTypes || ['history', 'groups']) : ['history', 'groups']
    const checkMap = {}
    dataTypes.forEach(type => { checkMap[type] = true })

    this.setData({
      showSettingsModal: true,
      isModalClosing: false,
      selectedSyncKey: selectedKey,
      availableDataTypes: dataTypes,
      selectedDataTypes: [...dataTypes],
      dataTypeCheckMap: checkMap,
      showSyncActions: false,
      showHistorySelector: false,
      syncHistoryList: [],
      selectedHistoryIds: []
    })
  },

  onCloseSettingsModal() {
    this.setData({ isModalClosing: true })
    setTimeout(() => {
      this.setData({
        showSettingsModal: false,
        isModalClosing: false,
        showSyncActions: false
      })
    }, 300)
  },

  preventModalTap() {
    // 阻止点击内容区域时冒泡关闭弹窗
  },

  onSelectSyncTool(e) {
    const key = e.currentTarget.dataset.key
    if (!key) return
    
    const config = TOOL_SYNC_MAP[key]
    const dataTypes = config ? (config.dataTypes || ['history', 'groups']) : ['history', 'groups']
    const checkMap = {}
    dataTypes.forEach(type => { checkMap[type] = true })
    
    this.setData({ 
      selectedSyncKey: key,
      availableDataTypes: dataTypes,
      selectedDataTypes: [...dataTypes],
      dataTypeCheckMap: checkMap,
      showSyncActions: false,
      showHistorySelector: false,
      syncHistoryList: [],
      selectedHistoryIds: []
    })
  },

  onSyncSelectedTool() {
    this.setData({
      syncTypeModalMode: 'upload',
      showSyncActions: true
    })
  },

  onDownloadSelectedTool() {
    this.setData({
      syncTypeModalMode: 'download',
      showSyncActions: true
    })

    // 加载同步历史
    this.loadSyncHistory()
  },

  formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  async loadSyncHistory() {
    const config = TOOL_SYNC_MAP[this.data.selectedSyncKey]
    if (!config) return

    try {
      const res = await api.progress.getHistory(config.toolName, 'upload')
      if (res?.success) {
        const historyList = (res.data || []).map(item => ({
          ...item,
          createdAt: this.formatTimestamp(item.createdAt)
        }))
        this.setData({ syncHistoryList: historyList, showHistorySelector: true })
      }
    } catch (error) {
      console.error('加载同步历史失败:', error)
    }
  },

  onCloseSyncTypeModal() {
    this.setData({ showSyncActions: false })
  },

  onToggleDataType(e) {
    const type = e.currentTarget.dataset.type
    if (!type) return

    const { selectedDataTypes, dataTypeCheckMap } = this.data
    const isChecked = !!dataTypeCheckMap[type]
    const newCheckMap = { ...dataTypeCheckMap }
    let newSelected = [...selectedDataTypes]

    if (isChecked) {
      newCheckMap[type] = false
      newSelected = newSelected.filter(t => t !== type)
    } else {
      newCheckMap[type] = true
      if (!newSelected.includes(type)) {
        newSelected.push(type)
      }
    }

    this.setData({ 
      selectedDataTypes: newSelected,
      dataTypeCheckMap: newCheckMap
    })
  },

  onSelectHistory(e) {
    const id = e.currentTarget.dataset.id
    const { selectedHistoryIds } = this.data
    const index = selectedHistoryIds.indexOf(id)
    let newSelected = [...selectedHistoryIds]
    
    if (index > -1) {
      newSelected.splice(index, 1)
    } else {
      newSelected.push(id)
    }
    
    this.setData({ selectedHistoryIds: newSelected })
  },

  onToggleHistorySelector() {
    this.setData({ showHistorySelector: !this.data.showHistorySelector })
  },

  onConfirmSyncType() {
    const { syncTypeModalMode, selectedDataTypes, selectedHistoryIds } = this.data

    if (selectedDataTypes.length === 0) {
      wx.showToast({ title: '请选择要同步的数据', icon: 'none' })
      return
    }

    this.setData({ showSettingsModal: false, showSyncActions: false })

    if (syncTypeModalMode === 'upload') {
      this.executeUpload(selectedDataTypes)
    } else {
      this.executeDownload(selectedDataTypes, selectedHistoryIds)
    }
  },

  async executeUpload(dataTypes) {
    const token = wx.getStorageSync("token")
    if (!token) {
      wx.showToast({ title: "请先登录", icon: "none" })
      return
    }

    const config = TOOL_SYNC_MAP[this.data.selectedSyncKey]
    if (!config) return

    wx.showLoading({ title: "正在上传..." })
    try {
      const payload = {
        toolName: config.toolName,
        dataTypes
      }

      if (dataTypes.includes('history')) {
        const historyData = wx.getStorageSync(config.storageKey) || []
        payload.historyData = historyData
      }

      if (dataTypes.includes('groups')) {
        const customGroups = wx.getStorageSync(config.customGroupsKey) || []
        if (customGroups.length > 0) {
          payload.customGroups = customGroups
        }
      }

      if (dataTypes.includes('hiddenMap') && config.hiddenMapKey) {
        const hiddenMap = wx.getStorageSync(config.hiddenMapKey)
        if (hiddenMap && Object.keys(hiddenMap).length > 0) {
          payload.hiddenMap = hiddenMap
        }
      }

      if (dataTypes.includes('formulaVersion') && config.formulaSongVersionsKey) {
        const formulaSongVersions = wx.getStorageSync(config.formulaSongVersionsKey)
        if (formulaSongVersions && typeof formulaSongVersions === 'object' && Object.keys(formulaSongVersions).length > 0) {
          payload.formulaSongVersions = formulaSongVersions
        }
      }

      const res = await api.progress.upload(payload)
      wx.hideLoading()

      if (res?.success) {
        const typeNames = dataTypes.map(t => DATA_TYPE_LABELS[t]).join('、')
        wx.showToast({
          title: `${typeNames}上传成功`,
          icon: "none",
          duration: 1500
        })
      } else {
        wx.showToast({ title: res?.message || "上传失败", icon: "none" })
      }
    } catch (error) {
      wx.hideLoading()
      console.error("上传失败:", error)
      wx.showToast({ title: "上传失败，请重试", icon: "none" })
    }
  },

  async executeDownload(dataTypes, historyIds) {
    const token = wx.getStorageSync("token")
    if (!token) {
      wx.showToast({ title: "请先登录", icon: "none" })
      return
    }

    const config = TOOL_SYNC_MAP[this.data.selectedSyncKey]
    if (!config) return

    wx.showLoading({ title: "正在下载..." })
    try {
      const payload = {
        toolName: config.toolName,
        dataTypes
      }

      if (historyIds && historyIds.length > 0) {
        payload.historyIds = historyIds
      }

      const res = await api.progress.download(payload)
      wx.hideLoading()

      if (res?.success && res.data) {
        // 恢复检查记录
        if (dataTypes.includes('history') && res.data.progressData) {
          wx.setStorageSync(config.storageKey, res.data.progressData)
        }

        // 恢复背诵组
        if (dataTypes.includes('groups') && res.data.customGroups) {
          const localGroups = wx.getStorageSync(config.customGroupsKey) || []
          const mergedGroups = mergeCustomGroups(localGroups, res.data.customGroups)
          wx.setStorageSync(config.customGroupsKey, mergedGroups)
        }

        // 恢复隐藏映射
        if (dataTypes.includes('hiddenMap') && config.hiddenMapKey && res.data.hiddenMap) {
          wx.setStorageSync(config.hiddenMapKey, res.data.hiddenMap)
        }

        // 恢复方歌版本（新格式：按方剂记录）
        if (dataTypes.includes('formulaVersion') && config.formulaSongVersionsKey && res.data.formulaSongVersions) {
          wx.setStorageSync(config.formulaSongVersionsKey, res.data.formulaSongVersions)
        }

        const typeNames = dataTypes.map(t => DATA_TYPE_LABELS[t]).join('、')
        wx.showToast({
          title: `${typeNames}下载成功`,
          icon: "none",
          duration: 1500
        })
      } else {
        wx.showToast({ title: res?.message || "下载失败", icon: "none" })
      }
    } catch (error) {
      wx.hideLoading()
      console.error("下载失败:", error)
      wx.showToast({ title: "下载失败，请重试", icon: "none" })
    }
  },

  async syncSelectedTool(key) {
    const token = wx.getStorageSync("token")
    if (!token) {
      wx.showToast({ title: "请先登录", icon: "none" })
      return
    }

    const config = TOOL_SYNC_MAP[key]
    if (!config) return

    const historyData = wx.getStorageSync(config.storageKey) || []
    const hiddenMap = config.hiddenMapKey ? wx.getStorageSync(config.hiddenMapKey) : null
    const customGroups = config.customGroupsKey ? wx.getStorageSync(config.customGroupsKey) : null
    const formulaSongVersions = config.formulaSongVersionsKey ? wx.getStorageSync(config.formulaSongVersionsKey) : null

    // 检查是否有任何数据需要上传
    const hasHistory = Array.isArray(historyData) && historyData.some(item => Array.isArray(item) && item.length > 0)
    const hasHidden = hiddenMap && typeof hiddenMap === 'object' && Object.keys(hiddenMap).length > 0
    const hasGroups = Array.isArray(customGroups) && customGroups.length > 0
    const hasFormulaSongVersions = formulaSongVersions && typeof formulaSongVersions === 'object' && Object.keys(formulaSongVersions).length > 0

    if (!hasHistory && !hasHidden && !hasGroups && !hasFormulaSongVersions) {
      wx.showToast({ title: "暂无数据可同步", icon: "none" })
      return
    }

    // 动态构造包含背诵组信息的提示语
    let groupSummary = ""
    if (hasGroups) {
      groupSummary = `\n背诵组同步：${customGroups.length} 个`
    }

    wx.showLoading({ title: "正在同步数据..." })
    try {
      const uploadPayload = {
        toolName: config.toolName,
        historyData
      }

      if (hasHidden) uploadPayload.hiddenMap = hiddenMap
      if (hasGroups) uploadPayload.customGroups = customGroups
      if (hasFormulaSongVersions) uploadPayload.formulaSongVersions = formulaSongVersions

      const res = await api.progress.upload(uploadPayload)
      wx.hideLoading()
      if (res?.success) {
        wx.showToast({
          title: `上传进度：${res.data.reviewedCount}/${res.data.totalEntries}${groupSummary}`,
          icon: "none",
          duration: 1500,
          mask: true
        })
      } else {
        wx.showToast({ title: res?.message || "上传失败", icon: "none" })
      }
    } catch (error) {
      wx.hideLoading()
      console.error("上传进度失败:", error)
      wx.showToast({ title: "上传失败，请重试", icon: "none" })
    }
  },

  async downloadSelectedTool(key) {
    const token = wx.getStorageSync("token")
    if (!token) {
      wx.showToast({ title: "请先登录", icon: "none" })
      return
    }

    const config = TOOL_SYNC_MAP[key]
    if (!config) return

    wx.showLoading({ title: "下载中..." })
    try {
      const res = await api.progress.download(config.toolName)
      wx.hideLoading()
      if (res?.success) {
        wx.setStorageSync(config.storageKey, res.data.progressData || [])

        // 方剂工具额外恢复隐藏数据
        if (config.hiddenMapKey) {
          wx.setStorageSync(config.hiddenMapKey, res.data.hiddenMap || null)
        }

        // 恢复背诵组数据
        if (config.customGroupsKey) {
          const localGroups = wx.getStorageSync(config.customGroupsKey) || []
          const mergedGroups = mergeCustomGroups(localGroups, res.data.customGroups || [])
          wx.setStorageSync(config.customGroupsKey, mergedGroups)
        }

        // 恢复方歌版本设置（仅方剂工具，新格式按方剂记录）
        if (config.formulaSongVersionsKey && res.data.formulaSongVersions) {
          wx.setStorageSync(config.formulaSongVersionsKey, res.data.formulaSongVersions)
        }

        // 动态构造包含背诵组信息的提示语
        let groupSummary = ""
        if (res.data.customGroups && Array.isArray(res.data.customGroups) && res.data.customGroups.length > 0) {
          groupSummary = `\n背诵组同步：${res.data.customGroups.length} 个`
        }

        wx.showToast({
          title: `下载进度：${res.data.reviewedCount}/${res.data.totalEntries}${groupSummary}`,
          icon: "none",
          duration: 1500,
          mask: true
        })
      } else {
        wx.showToast({ title: res?.message || "下载失败", icon: "none" })
      }
    } catch (error) {
      wx.hideLoading()
      console.error("下载云端数据失败:", error)
      wx.showToast({ title: "下载失败，请重试", icon: "none" })
    }
  },

  async performGlobalSearch(keyword) {
    const kw = (keyword || "").trim().toLowerCase()
    if (!kw || kw.length < 1) {
      this.setData({ globalSearchResults: [] })
      return
    }

    this._latestGlobalSearchKeyword = kw

    try {
      const res = await api.content.search({ q: kw, limit: 30 })
      if (this._latestGlobalSearchKeyword !== kw) return

      const list = Array.isArray(res?.data) ? res.data : []
      const toolMetaMap = DEFAULT_TOOLS.reduce((acc, item) => {
        acc[item.id] = {
          name: item.name,
          icon: item.icon
        }
        return acc
      }, {})
      const grouped = {}

      list.forEach(item => {
        const key = item?.collection?.key
        if (!key) return
        const entry = contentUtils.normalizeEntry(item)

        if (!grouped[key]) {
          const meta = toolMetaMap[key] || {}
          const resolvedToolName = meta.name || item?.collection?.display_name || item?.collection?.name || key
          grouped[key] = {
            toolKey: key,
            toolName: resolvedToolName,
            toolIcon: meta.icon || "",
            items: []
          }
        }

        if (grouped[key].items.length >= 5) return

        const snippetSource = entry.text || entry.note || ""
        grouped[key].items.push({
          id: entry.clauseNum || entry.itemKey || item.id,
          title: entry.title || "Item",
          snippet: `${String(snippetSource || "").slice(0, 30)}...`
        })
      })

      this.setData({ globalSearchResults: Object.values(grouped) })
    } catch (error) {
      if (this._latestGlobalSearchKeyword !== kw) return
      console.error("Global search failed:", error)
      this.setData({ globalSearchResults: [] })
    }
  },

  onShareAppMessage() {
    return share.getDefaultShareConfig();
  },

  onShareTimeline() {
    return share.getDefaultShareConfig();
  }
})
