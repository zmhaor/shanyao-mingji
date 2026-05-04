# 山药铭记

一个中医学习工具箱微信小程序，包含伤寒精读、方剂学习、中药学习等功能。

## 项目结构

```
├── admin/          # 后台管理系统 (Vue 3 + Vite)
├── backend/        # 后端服务 (Node.js + Express + MySQL)
├── docs/           # 项目文档 (API文档、数据库脚本)
├── home/           # 项目主页 (React + Vite)
├── xcx/            # 微信小程序
└── 云端数据ison/    # 中医数据文件
```

## 功能特性

- 📚 伤寒精读助手
- 💊 方剂学习工具
- 🌿 中药学习工具
- 📖 内经学习工具
- 📋 金匮学习工具
- 🌡️ 温病学习工具
- 👤 用户系统
- ⭐ 收藏功能
- 📝 学习历史记录
- 💬 用户反馈系统
- 🏪 积分商城
- 📢 公告系统

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7
- 微信开发者工具

### 后端部署

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

4. 初始化数据库：
```bash
# 导入数据库结构
mysql -u your_username -p your_database_name < docs/content_library.sql
```

5. 启动服务：
```bash
npm start
```

### 后台管理系统部署

1. 进入管理后台目录：
```bash
cd admin
```

2. 安装依赖：
```bash
npm install
# 或使用 pnpm
pnpm install
```

3. 配置环境变量：
```bash
# 编辑 .env 文件，配置后端API地址
```

4. 启动开发服务器：
```bash
npm run dev
```

5. 构建生产版本：
```bash
npm run build
```

### 微信小程序部署

1. 使用微信开发者工具打开 `xcx` 目录

2. 配置 `xcx/utils/config.js` 中的API地址

3. 在微信公众平台配置服务器域名

4. 预览或上传小程序

### 项目主页部署

1. 进入主页目录：
```bash
cd home
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建生产版本：
```bash
npm run build
```

## 配置说明

### 后端配置 (backend/.env)

```env
# 服务器配置
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret
```

### 前端配置 (admin/.env)

```env
# 后端API地址
VITE_BASE_URL=http://your-api-domain.com/api
```

### 微信小程序配置 (xcx/utils/config.js)

```javascript
const config = {
  development: {
    baseUrl: 'http://localhost:3000/api',
    assetHost: 'http://localhost:3000'
  },
  production: {
    baseUrl: 'https://your-api-domain.com/api',
    assetHost: 'https://your-api-domain.com'
  }
};
```

## 数据说明

项目包含以下中医数据：

- 伤寒论 (shanghan)
- 方剂学 (fangji)
- 内经 (neijing)
- 中药学 (zhongyao)
- 金匮要略 (jinkui)
- 温病学 (wenbing)

数据文件位于 `云端数据ison/` 目录，可通过后端脚本导入数据库。

## 技术栈

### 后端
- Node.js
- Express
- Sequelize ORM
- MySQL
- JWT 认证

### 后台管理系统
- Vue 3
- Vite
- Element Plus
- TypeScript

### 微信小程序
- 微信小程序原生开发
- WXML/WXSS/JS

### 项目主页
- React
- Vite
- TypeScript
- Tailwind CSS

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 邮箱：your-email@example.com
- 微信：your_wechat_id

## 致谢

感谢所有为中医传承和发展做出贡献的人！