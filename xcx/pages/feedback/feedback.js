const api = require('../../utils/api')
const auth = require('../../utils/auth')


Page({
    data: {
        content: '',
        isAnonymous: false,
        submitting: false,
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
                            url: '/pages/feedback/feedback'
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

        if (!auth.isLoggedIn()) {
            wx.switchTab({ url: '/pages/profile/profile' })
        }
    },

    onContentInput(e) {
        this.setData({ content: e.detail.value })
    },

    onAnonymousChange(e) {
        this.setData({ isAnonymous: e.detail.value })
    },

    async onSubmit() {
        if (!this.data.content.trim()) {
            wx.showToast({ title: '请输入反馈内容', icon: 'none' })
            return
        }

        this.setData({ submitting: true })
        try {
            const res = await api.feedback.submit({
                content: this.data.content,
                is_anonymous: this.data.isAnonymous
            })

            if (res.success) {
                wx.showModal({
                    title: '提交成功',
                    content: '我们已收到您的反馈，感谢您的支持！',
                    showCancel: false,
                    success: () => {
                        wx.navigateBack()
                    }
                })
            } else {
                wx.showToast({ title: res.message || '提交失败', icon: 'none' })
            }
        } catch (error) {
            console.error('提交反馈失败:', error)
            wx.showToast({ title: '网络繁忙，请稍后重试', icon: 'none' })
        } finally {
            this.setData({ submitting: false })
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
