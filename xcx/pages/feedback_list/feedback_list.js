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
        tabs: [
            { id: 'hot', name: '热门排序' },
            { id: 'new', name: '最新排序' },
            { id: 'mine', name: '我的反馈' }
        ],
        currentTab: 'hot',
        feedbacks: [],
        page: 1,
        pageSize: 10,
        hasMore: true,
        loading: false,
        isRefreshing: false,
        currentUserId: null,
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
                            url: '/pages/feedback_list/feedback_list' + (options.tab ? '?tab=' + options.tab : '')
                        });
                    }, 100);
                }
            });
            return;
        }

        if (options.tab) {
            this.setData({ currentTab: options.tab })
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
        this.refreshData();
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

    switchTab(e) {
        const tab = e.currentTarget.dataset.tab;
        if (this.data.currentTab === tab) return;
        this.setData({
            currentTab: tab,
            page: 1,
            feedbacks: [],
            hasMore: true
        }, () => {
            this.loadData();
        });
    },

    onRefresh() {
        this.setData({ isRefreshing: true });
        this.refreshData().then(() => {
            this.setData({ isRefreshing: false });
        });
    },

    refreshData() {
        this.setData({
            page: 1,
            hasMore: true,
            feedbacks: []
        });
        return this.loadData();
    },

    loadMore() {
        if (!this.data.hasMore || this.data.loading) return;
        this.setData({
            page: this.data.page + 1
        }, () => {
            this.loadData();
        });
    },

    async loadData() {
        if (this.data.loading) return;

        this.setData({ loading: true });

        const { page, pageSize, currentTab } = this.data;
        const sort = currentTab === 'hot' ? 'hot' : 'new';
        const filter = currentTab === 'mine' ? 'mine' : 'all';

        try {
            const res = await api.feedback.getList({
                page,
                pageSize,
                sort,
                filter
            });

            if (res.success) {
            const list = res.data.list.map(item => {
                    let avatar = item.user?.avatar_url || '/images/默认.jpg';
                    if (avatar.startsWith('/uploads')) {
                        avatar = config.assetHost + avatar;
                    }

                    return {
                        ...item,
                        unread_reply_count: Number(item.unread_reply_count) || 0,
                        create_time_formatted: formatTime(new Date(item.create_time)),
                        user: {
                            ...item.user,
                            avatar_url: avatar
                        }
                    };
                });

                this.setData({
                    feedbacks: page === 1 ? list : [...this.data.feedbacks, ...list],
                    hasMore: list.length >= pageSize,
                    loading: false
                });
            }
        } catch (error) {
            console.error('获取反馈列表失败', error);
            wx.showToast({ title: '加载失败', icon: 'none' });
            this.setData({ loading: false });
        }
    },

    async toggleLike(e) {
        const { id, index } = e.currentTarget.dataset;
        const item = this.data.feedbacks[index];

        // Optimistic UI update
        const isLiked = !item.is_liked;
        const increment = isLiked ? 1 : -1;

        const up = `feedbacks[${index}].is_liked`;
        const upL = `feedbacks[${index}].likes`;
        this.setData({
            [up]: isLiked,
            [upL]: item.likes + increment
        });

        try {
            const res = await api.feedback.like({ feedback_id: id });
            if (!res.success) {
                // Revert
                this.setData({
                    [up]: !isLiked,
                    [upL]: item.likes
                });
                wx.showToast({ title: res.message || '操作失败', icon: 'none' });
            }
        } catch (error) {
            // Revert
            this.setData({
                [up]: !isLiked,
                [upL]: item.likes
            });
        }
    },

    deleteFeedback(e) {
        const { id, index } = e.currentTarget.dataset;
        wx.showModal({
            title: '删除提示',
            content: '确定要删除这条反馈吗？',
            confirmColor: '#f56c6c',
            success: async (res) => {
                if (res.confirm) {
                    wx.showLoading({ title: '删除中' });
                    try {
                        const delRes = await api.feedback.delete(id);
                        wx.hideLoading();
                        if (delRes.success) {
                            wx.showToast({ title: '删除成功', icon: 'success' });
                            const newList = [...this.data.feedbacks];
                            newList.splice(index, 1);
                            this.setData({ feedbacks: newList });
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

    goToFeedback() {
        wx.navigateTo({
            url: '/pages/feedback/feedback'
        });
    },

    goToDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/feedback_detail/feedback_detail?id=${id}`
        });
    }
})
