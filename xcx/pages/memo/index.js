Page({
  data: {
    memoContent: '',
    memoHistory: [],
    isDarkMode: false
  },

  onLoad() {
    this.loadMemoHistory()
  },

  onShow() {
    const app = getApp();
    const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
    this.setData({ isDarkMode: isDark });
    app.updateUITheme(isDark);

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
      this.getTabBar().updateTheme();
    }
  },

  onMemoInput(e) {
    this.setData({
      memoContent: e.detail.value
    })
  },

  saveMemo() {
    const content = this.data.memoContent.trim()
    if (!content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    const history = this.data.memoHistory
    const newMemo = {
      content: content,
      time: new Date().toLocaleString()
    }

    history.unshift(newMemo)
    // 只保留最近10条记录
    if (history.length > 10) {
      history.pop()
    }

    wx.setStorageSync('memo_history', history)
    this.setData({
      memoHistory: history
    })

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  clearMemo() {
    this.setData({
      memoContent: ''
    })
  },

  loadHistory(e) {
    const index = e.currentTarget.dataset.index
    const history = this.data.memoHistory
    if (history[index]) {
      this.setData({
        memoContent: history[index].content
      })
    }
  },

  loadMemoHistory() {
    const history = wx.getStorageSync('memo_history') || []
    this.setData({
      memoHistory: history
    })
  },

  backToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})