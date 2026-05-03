const app = getApp()
const api = require('../../utils/api')

const TOOL_ICON_MAP = {
  '伤寒速速通': '/images/伤寒速速通.png',
  '方剂轻松过': '/images/方剂轻松过.png',
  '内经随身背': '/images/内经随身背.png',
  '中药快快记': '/images/中药快快记.png',
  '金匮简易考': '/images/金匮简易考.png',
  '温病掌上学': '/images/温病掌上学.png'
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0分钟'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m}分钟`
  return `${m}分钟`
}

Page({
  data: {
    totalStudyTimeFormatted: '0分钟',
    toolDetails: [],
    isDarkMode: false
  },

  onLoad() {
    this.loadStudyTimeData()
  },

  onShow() {
    this.setData({
      isDarkMode: app.globalData.isDarkMode || false
    })
  },

  async loadStudyTimeData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      const res = await api.history.getList()
      
      if (res.success) {
        const studyTimeData = res.data.studyTime || {}
        const { totalStudyTime, toolDetails } = studyTimeData
        
        const maxDuration = Math.max(...(toolDetails || []).map(item => item.totalDuration || 0), 1)
        
        const formattedToolDetails = (toolDetails || []).map(item => ({
          ...item,
          tool: {
            ...item.tool,
            icon: TOOL_ICON_MAP[item.tool.name] || item.tool.icon || '/images/默认.jpg'
          },
          durationFormatted: formatDuration(item.totalDuration),
          durationPercent: Math.round(((item.totalDuration || 0) / maxDuration) * 100)
        }))
        
        this.setData({
          totalStudyTimeFormatted: formatDuration(totalStudyTime),
          toolDetails: formattedToolDetails
        })
      }
    } catch (error) {
      console.error('获取学习时长数据失败:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onBack() {
    wx.navigateBack()
  }
})