/**
 * 身份认证工具类
 */

const isLoggedIn = () => {
    const token = wx.getStorageSync('token');
    const user = wx.getStorageSync('currentUser');
    return !!(token && user);
};

const ensureLogin = (options = {}) => {
    if (isLoggedIn()) {
        return true;
    }

    const { title = '请先登录', showModal = true, immediate = false } = options;

    if (showModal) {
        wx.showModal({
            title: '提示',
            content: '该功能需要登录后使用，是否立即前往登录？',
            success: (res) => {
                if (res.confirm) {
                    wx.switchTab({
                        url: '/pages/profile/profile'
                    });
                }
            }
        });
    } else {
        if (immediate) {
            // 设置全局提示，让目标页面显示
            const app = getApp();
            if (app) {
                app.globalData.loginPrompt = title;
            }
            wx.switchTab({
                url: '/pages/profile/profile'
            });
        } else {
            wx.showToast({
                title,
                icon: 'none',
                duration: 1500
            });
            setTimeout(() => {
                wx.switchTab({
                    url: '/pages/profile/profile'
                });
            }, 1000);
        }
    }

    return false;
};

module.exports = {
    isLoggedIn,
    ensureLogin
};
