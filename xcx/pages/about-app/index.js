const api = require('../../utils/api')
const share = require('../../utils/share')

const DEFAULT_DATA = {
  title: '山药铭记',
  subtitle: '面向中医学习者的记忆与背诵助手',
  coverImage: '',
  summary: '帮助你更轻松地整理学习内容、管理背诵进度，并在日常复习中保持连续性。',
  version: '1.0.0',
  releaseDate: '',
  releaseNotes: '持续优化内容体验与学习流程。',
  highlights: [
    '支持收藏、历史记录、学习进度与资料查看',
    '围绕高频学习场景设计更顺手的记忆路径'
  ],
  contactEmail: '',
  website: '',
  changelog: [
    { version: '1.0.0', date: '', content: '初始版本上线' }
  ]
}

function mergeConfig(remote = {}) {
  const changelog = Array.isArray(remote.changelog) && remote.changelog.length
    ? remote.changelog.slice().reverse()
    : DEFAULT_DATA.changelog.slice().reverse()

  return {
    ...DEFAULT_DATA,
    ...remote,
    highlights: Array.isArray(remote.highlights) && remote.highlights.length ? remote.highlights : DEFAULT_DATA.highlights,
    changelog
  }
}

Page({
  data: {
    loading: true,
    aboutInfo: DEFAULT_DATA
  },

  onLoad() {
    this.loadConfig()
  },

  async loadConfig() {
    this.setData({ loading: true })
    try {
      const res = await api.config.get('miniapp_about_info')
      this.setData({
        aboutInfo: mergeConfig(res.data || {}),
        loading: false
      })
    } catch (error) {
      console.error('获取小程序介绍失败:', error)
      this.setData({
        aboutInfo: DEFAULT_DATA,
        loading: false
      })
    }
  },

  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  onShareAppMessage() {
    return share.getDefaultShareConfig()
  },

  onShareTimeline() {
    return share.getDefaultShareConfig()
  }
})
