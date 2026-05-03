const api = require('../../utils/api')
const config = require('../../utils/config')

function formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()

    return `${year}/${[month, day].map(n => n.toString().padStart(2, '0')).join('/')} ${[hour, minute].map(n => n.toString().padStart(2, '0')).join(':')}`
}

Page({
    data: {
        feedbackId: null,
        feedback: null,
        replyContent: '',
        scrollTo: '',
        isSubmitting: false,
        isAnonymous: false,
        currentUserId: null,
        replyInputFocus: false,
        replyInputFocus: false,
        replyCursor: -1,
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
                            url: '/pages/feedback_detail/feedback_detail?id=' + options.id
                        });
                    }, 100);
                }
            });
            return;
        }

        if (options.id) {
            this.setData({ feedbackId: options.id });
            this.loadDetail(options.id);
        }
        const currentUser = wx.getStorageSync('currentUser');
        if (currentUser && currentUser.id) {
            this.setData({ currentUserId: currentUser.id });
        }
    },

    onShow() {
        const app = getApp();
        const isDark = app.globalData.isDarkMode !== undefined ? app.globalData.isDarkMode : false;
        this.setData({ isDarkMode: isDark });
        app.updateUITheme(isDark);
        if (this.data.feedbackId) {
            this.loadDetail(this.data.feedbackId);
        }
    },

    onBack() {
        const pages = getCurrentPages()
        if (pages.length === 1) {
          // 从分享卡片进入，跳转到首页
          wx.switchTab({ url: '/pages/index/index' })
        } else {
          // 正常返回
          wx.navigateBack();
        }
    },

    async loadDetail(id) {
        try {
            const res = await api.feedback.getDetail(id);
            if (res.success) {
                let feedback = res.data;
                feedback.create_time_formatted = formatTime(new Date(feedback.create_time));

                if (feedback.user && feedback.user.avatar_url && feedback.user.avatar_url.startsWith('/uploads')) {
                    feedback.user.avatar_url = config.assetHost + feedback.user.avatar_url;
                }

                if (feedback.replies) {
                    feedback.replies = feedback.replies.map(r => {
                        let rAvatar = r.replier?.avatar_url || '/images/默认.jpg';
                        if (rAvatar.startsWith('/uploads')) {
                            rAvatar = config.assetHost + rAvatar;
                        }
                        return {
                            ...r,
                            create_time_formatted: formatTime(new Date(r.create_time)),
                            replier: {
                                ...r.replier,
                                avatar_url: rAvatar
                            }
                        };
                    });
                }
                this.setData({ feedback });
            }
        } catch (error) {
            console.error('获取详情失败', error);
            wx.showToast({ title: '加载失败', icon: 'none' });
        }
    },

    onInput(e) {
        this.setData({
            replyContent: e.detail.value,
            replyCursor: e.detail.cursor
        });
    },

    onReplyFocus(e) {
        this.setData({
            replyInputFocus: true,
            replyCursor: e.detail.cursor
        });
    },

    onReplyBlur() {
        this.setData({ replyInputFocus: false });
    },

    toggleAnonymous() {
        const nextAnonymous = !this.data.isAnonymous
        const cursor = this.data.replyContent.length
        this.setData({
            isAnonymous: nextAnonymous,
            replyCursor: cursor
        }, () => {
            setTimeout(() => {
                this.setData({
                    replyInputFocus: true,
                    replyCursor: cursor
                })
            }, 30)
        });
    },

    async submitReply() {
        const { replyContent, feedbackId, isSubmitting, isAnonymous } = this.data;
        if (!replyContent.trim()) {
            wx.showToast({ title: '请输入回复内容', icon: 'none' });
            return;
        }
        if (isSubmitting) return;

        this.setData({ isSubmitting: true });
        wx.showLoading({ title: '发送中...' });

        try {
            const res = await api.feedback.reply({
                feedback_id: feedbackId,
                content: replyContent,
                is_anonymous: isAnonymous
            });

            if (res.success) {
                wx.hideLoading();
                wx.showToast({ title: '回复成功', icon: 'success' });
                this.setData({
                    replyContent: '',
                    replyCursor: -1,
                    replyInputFocus: false,
                    scrollTo: 'bottom-anchor'
                });
                // 重新加载详情以获取最新回复
                this.loadDetail(feedbackId);
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            wx.hideLoading();
            wx.showToast({ title: error.message || '回复失败', icon: 'none' });
        } finally {
            this.setData({ isSubmitting: false });
        }
    },

    async toggleLike() {
        const { feedback, feedbackId } = this.data;
        if (!feedback) return;

        const isLiked = !feedback.is_liked;
        const increment = isLiked ? 1 : -1;

        // 乐观更新
        this.setData({
            'feedback.is_liked': isLiked,
            'feedback.likes': feedback.likes + increment
        });

        try {
            const res = await api.feedback.like({ feedback_id: feedbackId });
            if (!res.success) {
                throw new Error(res.message);
            }
        } catch (error) {
            // 失败回滚
            this.setData({
                'feedback.is_liked': !isLiked,
                'feedback.likes': feedback.likes
            });
            wx.showToast({ title: '操作失败', icon: 'none' });
        }
    },

    deleteFeedback() {
        const { feedbackId } = this.data;
        wx.showModal({
            title: '删除提示',
            content: '确定要删除这条反馈吗？',
            confirmColor: '#f56c6c',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中' });
                    try {
                        const delRes = await api.feedback.delete(feedbackId);
                        wx.hideLoading();
                        if (delRes.success) {
                            wx.showToast({ title: '删除成功', icon: 'success' });
                            setTimeout(() => {
                                wx.navigateBack();
                            }, 800);
                        } else {
                            wx.showToast({ title: delRes.message || '删除失败', icon: 'none' });
                        }
                    } catch (err) {
                        wx.hideLoading();
                        wx.showToast({ title: err.message || '网络错误', icon: 'none' });
                    }
                }
            }
        });
    },

    deleteReply(e) {
        const replyId = e.currentTarget.dataset.replyId;
        const { feedbackId } = this.data;
        
        wx.showModal({
            title: '删除提示',
            content: '确定要删除这条回复吗？',
            confirmColor: '#f56c6c',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中' });
                    try {
                        const delRes = await api.feedback.deleteReply(replyId);
                        wx.hideLoading();
                        if (delRes.success) {
                            wx.showToast({ title: '删除成功', icon: 'success' });
                            // 重新加载详情
                            this.loadDetail(feedbackId);
                        } else {
                            wx.showToast({ title: delRes.message || '删除失败', icon: 'none' });
                        }
                    } catch (err) {
                        wx.hideLoading();
                        wx.showToast({ title: err.message || '网络错误', icon: 'none' });
                    }
                }
            }
        });
    }
})
