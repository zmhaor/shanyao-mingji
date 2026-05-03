const contentUtils = require("../../utils/content")
const app = getApp()

const TOOL_META_MAP = {
  shanghan: { name: "伤寒速速通", icon: "/images/伤寒速速通.png" },
  fangji: { name: "方剂轻松过", icon: "/images/方剂轻松过.png" },
  neijing: { name: "内经随身背", icon: "/images/内经随身背.png" },
  zhongyao: { name: "中药快快记", icon: "/images/中药快快记.png" },
  jinkui: { name: "金匮简易考", icon: "/images/金匮简易考.png" },
  wenbing: { name: "温病掌上学", icon: "/images/温病掌上学.png" }
}

Page({
  data: {
    isDarkMode: false,
    searchKeyword: "",
    globalSearchResults: []
  },

  onLoad(options) {
    const keyword = decodeURIComponent(options?.q || "").trim()
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false
    this.setData({ isDarkMode: isDark })
    app.updateUITheme(isDark)

    if (keyword) {
      this.setData({ searchKeyword: keyword })
      this.performGlobalSearch(keyword)
    }
  },

  onShow() {
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false
    this.setData({ isDarkMode: isDark })
    app.updateUITheme(isDark)
  },

  onBack() {
    wx.navigateBack()
  },

  onSearchInput(e) {
    const keyword = (e.detail.value || "").trim()
    this.setData({ searchKeyword: keyword })
    this.performGlobalSearch(keyword)
  },

  onSearchConfirm(e) {
    const keyword = (e.detail.value || "").trim()
    this.setData({ searchKeyword: keyword })
    this.performGlobalSearch(keyword)
  },

  onClearSearch() {
    this.setData({
      searchKeyword: "",
      globalSearchResults: []
    })
  },

  async performGlobalSearch(keyword) {
    const normalizedKeyword = String(keyword || "").trim().toLowerCase()
    if (!normalizedKeyword) {
      this.setData({ globalSearchResults: [] })
      return
    }

    this._latestGlobalSearchKeyword = normalizedKeyword

    try {
      const api = require("../../utils/api")
      const res = await api.content.search({ q: normalizedKeyword, limit: 30 })
      if (this._latestGlobalSearchKeyword !== normalizedKeyword) return

      const list = Array.isArray(res?.data) ? res.data : []
      const grouped = {}

      list.forEach((item, index) => {
        const key = item?.collection?.key
        if (!key) return

        const entry = contentUtils.normalizeEntry(item, index)
        const targetKey = String(entry.itemKey || entry.id || entry.clauseNum || "").trim()
        if (!targetKey) return

        if (!grouped[key]) {
          const meta = TOOL_META_MAP[key] || {}
          grouped[key] = {
            toolKey: key,
            toolName: meta.name || item?.collection?.display_name || item?.collection?.name || key,
            toolIcon: meta.icon || "",
            items: []
          }
        }

        if (grouped[key].items.length >= 5) return

        const snippetSource = entry.text || entry.note || ""
        grouped[key].items.push({
          id: targetKey,
          targetKey,
          title: entry.title || "条目",
          snippet: `${String(snippetSource || "").slice(0, 30)}...`
        })
      })

      this.setData({ globalSearchResults: Object.values(grouped) })
    } catch (error) {
      if (this._latestGlobalSearchKeyword !== normalizedKeyword) return
      console.error("Global search failed:", error)
      this.setData({ globalSearchResults: [] })
    }
  },

  onGlobalResultTap(e) {
    const { tool, targetKey } = e.currentTarget.dataset
    if (!tool || !targetKey) return

    wx.navigateTo({
      url: `/pages/study/study?type=${tool}&tab=read&from=search&targetKey=${encodeURIComponent(targetKey)}`
    })
  }
})
