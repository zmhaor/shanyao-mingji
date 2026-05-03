const { serviceAgreement, privacyPolicy } = require('./data.js');

Page({
    data: {
        title: '',
        contentBlocks: [],
        isDarkMode: false
    },

    onLoad(options) {
        // 检查是否从分享卡片进入（页面栈只有一个页面）
        const pages = getCurrentPages();
        if (pages.length === 1) {
            // 先跳转到首页，再跳回当前页面，确保页面栈中有多个页面
            wx.switchTab({ 
                url: '/pages/index/index',
                success: () => {
                    setTimeout(() => {
                        wx.navigateTo({ 
                            url: '/pages/protocol/protocol?type=' + (options.type || 'service')
                        });
                    }, 100);
                }
            });
            return;
        }

        // type 应该由 options 传入，对应 'service' 或 'privacy'
        const { type } = options;
        if (type === 'service') {
            this.setData({
                title: '用户服务协议',
                contentBlocks: serviceAgreement
            });
        } else if (type === 'privacy') {
            this.setData({
                title: '个人信息保护政策',
                contentBlocks: privacyPolicy
            });
        } else {
            // 兜底逻辑
            wx.showToast({
                title: '协议类型错误',
                icon: 'none'
            });
        }
    },

    onShow() {
        const app = getApp();
        const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
        this.setData({ isDarkMode: isDark });
        app.updateUITheme(isDark);
    },

    /**
     * 返回上一页
     */
    onBack() {
        const pages = getCurrentPages()
        if (pages.length === 1) {
          // 从分享卡片进入，跳转到首页
          wx.switchTab({ url: '/pages/index/index' })
        } else {
          // 正常返回
          wx.navigateBack({
              delta: 1
          });
        }
    }
});
