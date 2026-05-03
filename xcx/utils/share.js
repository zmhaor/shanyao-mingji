/**
 * 小程序分享配置工具类
 */

const defaultTitle = '山药铭记-中医经典学习助手';
const defaultPath = '/pages/index/index';

/**
 * 获取默认分享配置
 * @param {Object} options 自定义配置
 * @returns {Object} 分享配置对象
 */
const getDefaultShareConfig = (options = {}) => {
    const config = {
        title: options.title || defaultTitle,
        path: options.path || defaultPath
    };

    // 如果指定了图片则使用指定图片，否则不传 imageUrl 字段，由微信自动截取当前页面
    if (options.imageUrl) {
        config.imageUrl = options.imageUrl;
    }

    return config;
};

module.exports = {
    getDefaultShareConfig
};
