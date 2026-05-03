// API 配置
const config = {
  // 开发环境
  development: {
    baseUrl: 'http://localhost:3000/api',
    assetHost: 'http://localhost:3000'
  },
  // 生产环境 - 请替换为你的实际域名
  production: {
    baseUrl: 'https://your-api-domain.com/api',
    assetHost: 'https://your-api-domain.com'
  }
};

// 获取当前环境
const env = __wxConfig ? __wxConfig.envVersion : 'develop';

// 导出当前环境的配置
module.exports = config[env] || config.development;