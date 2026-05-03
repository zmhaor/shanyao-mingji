const config = require('./config');
const BASE_URL = config.baseUrl;

let isRefreshing = false;

function request(url, options = {}) {
  const token = wx.getStorageSync('token');

  const header = Object.assign(
    { 'Content-Type': 'application/json' },
    options.header || {}
  );

  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token 过期或无效
          if (!isRefreshing) {
            isRefreshing = true;
            console.warn('登录已过期或凭证无效，准备清除缓存并将跳转');
            wx.removeStorageSync('token');
            wx.removeStorageSync('currentUser');

            // 更新 app.js 中的全局状态 (如果能获取到 app 实例)
            const app = getApp();
            if (app) app.logout();

            wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });

            setTimeout(() => {
              wx.switchTab({ url: '/pages/profile/profile' });
              // 跳转完成后，大约一段时间后重置标记
              setTimeout(() => { isRefreshing = false; }, 1000);
            }, 1000);
          }
          reject({ message: '登录已过期' });
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

const api = {
  auth: {
    login: (data) => request('/auth/login', { method: 'POST', data }),
    wechatLogin: (data) => request('/auth/wechat', { method: 'POST', data })
  },
  user: {
    getInfo: () => request('/users/me'),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', data }),
    updatePassword: (data) => request('/users/password', { method: 'PUT', data }),
    getInviteReward: () => request('/users/invite-reward'),
    submitInviteCode: (data) => request('/users/submit-invite-code', { method: 'POST', data })
  },
  tools: {
    getList: (params) => request('/tools', { method: 'GET', data: params }),
    getDetail: (id) => request(`/tools/${id}`)
  },
  favorites: {
    getList: () => request('/favorites'),
    add: (toolId) => request(`/favorites/${toolId}`, { method: 'POST' }),
    remove: (toolId) => request(`/favorites/${toolId}`, { method: 'DELETE' })
  },
  history: {
    getList: () => request('/history'),
    add: (toolId) => request(`/history/${toolId}`, { method: 'POST' }),
    reportDuration: (toolId, duration) => request(`/history/${toolId}/duration`, { method: 'PUT', data: { duration } }),
    clear: () => request('/history', { method: 'DELETE' })
  },
  shop: {
    getItems: () => request('/shop/items'),
    getPoints: () => request('/shop/points'),
    exchange: (itemId) => request('/shop/exchange', { method: 'POST', data: { itemId } })
  },
  progress: {
    upload: (data) => request('/progress/upload', { method: 'POST', data }),
    getMy: () => request('/progress/my'),
    download: (data) => request('/progress/download', { method: 'POST', data }),
    getHistory: (toolName, syncType) => request(`/progress/history?toolName=${toolName}&syncType=${syncType || 'upload'}`, { method: 'GET' }),
    getHistoryDetail: (id) => request(`/progress/history/${id}`, { method: 'GET' })
  },
  feedback: {
    submit: (data) => request('/feedback/submit', { method: 'POST', data }),
    getList: (data) => request('/feedback/list', { method: 'GET', data }),
    getUnreadCount: () => request('/feedback/unread-count', { method: 'GET' }),
    getDetail: (id) => request(`/feedback/detail/${id}`),
    like: (data) => request('/feedback/like', { method: 'POST', data }),
    reply: (data) => request('/feedback/reply', { method: 'POST', data }),
    delete: (id) => request(`/feedback/${id}`, { method: 'DELETE' }),
    deleteReply: (replyId) => request(`/feedback/reply/${replyId}`, { method: 'DELETE' })
  },
  notice: {
    getActive: (data) => request('/notice/active', { method: 'GET', data }),
    confirm: (id) => request(`/notice/confirm/${id}`, { method: 'POST' })
  },
  config: {
    get: (key) => request(`/config/${key}`, { method: 'GET' })
  },
  content: {
    getCollections: () => request('/content/collections', { method: 'GET' }),
    getItems: (key, params) => request(`/content/collections/${key}/items`, { method: 'GET', data: params }),
    getMeta: (key) => request(`/content/collections/${key}/meta`, { method: 'GET' }),
    getDelta: (key, params) => request(`/content/collections/${key}/delta`, { method: 'GET', data: params }),
    getFull: (key, params) => request(`/content/collections/${key}/full`, { method: 'GET', data: params }),
    search: (params) => request('/content/search', { method: 'GET', data: params })
  },
  materials: {
    getList: () => request('/materials', { method: 'GET' }),
    exchange: (id) => request(`/materials/${id}/exchange`, { method: 'POST' })
  }
};


module.exports = api;
