# 山药铭记

一个面向中医学习者的全栈学习平台，包含微信小程序、后端 API 服务、后台管理系统和项目主页四大模块，帮助中医爱好者高效学习中医经典知识。

## 项目简介

山药铭记是一款专为中医学习者设计的全栈学习平台，整合了伤寒论、方剂学、中药学、内经、金匮要略、温病学六大中医经典的学习资源。通过微信小程序提供移动端学习体验，后端基于 Node.js + Express + MySQL 提供 RESTful API，管理后台基于 Vue 3 实现内容与用户管理，项目主页基于 React 构建产品展示页面。平台致力于通过现代化的技术手段，让传统的中医学习变得更加便捷、高效、有趣。

### 核心特色

- **六大经典学习**：涵盖伤寒论、方剂学、中药学、内经、金匮要略、温病学，每科提供诵读、检查、抽查三种学习模式
- **随时背功能**：利用碎片时间进行背诵练习，支持按科目选择
- **背诵组功能**：组队学习，互相监督，共同进步
- **学习进度追踪**：记录学习时长、学习进度，支持学习数据同步
- **收藏与历史**：收藏重要内容方便复习，学习历史记录学习轨迹
- **积分商城**：通过学习赚取积分，兑换学习资料与奖励
- **内容管理系统**：后台可管理所有中医经典内容，支持在线编辑与发布
- **反馈系统**：用户可提交反馈，管理员可回复互动，支持点赞

## 界面预览

### 首页与个人主页

<p align="center">
  <img src="home/小程序图片/首页+个人主页/首页.jpg" width="200" alt="首页">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="home/小程序图片/首页+个人主页/个人主页.jpg" width="200" alt="个人主页">
</p>

### 工具页面展示

#### 伤寒速速通

<p align="center">
  <img src="home/小程序图片/各工具页面展示/伤寒速速通 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/伤寒速速通 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/伤寒速速通 抽查页.jpg" width="200" alt="抽查页">
</p>

#### 方剂速速记

<p align="center">
  <img src="home/小程序图片/各工具页面展示/方剂轻松过 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/方剂速速记 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/方剂速速记 抽查页.jpg" width="200" alt="抽查页">
</p>

#### 中药快快记

<p align="center">
  <img src="home/小程序图片/各工具页面展示/中药快快记 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/中药快快记 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/中药快快记 抽查页.jpg" width="200" alt="抽查页">
</p>

#### 内经随身背

<p align="center">
  <img src="home/小程序图片/各工具页面展示/内经随身背 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/内经随身背 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/内经随时背 抽查页.jpg" width="200" alt="抽查页">
</p>

#### 金匮简易考

<p align="center">
  <img src="home/小程序图片/各工具页面展示/金匮简易考 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/金匮简易考 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/金匮简易考 抽查页.jpg" width="200" alt="抽查页">
</p>

#### 温病掌上学

<p align="center">
  <img src="home/小程序图片/各工具页面展示/温病掌上学 诵读页.jpg" width="200" alt="诵读页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/温病掌上学 检查页.jpg" width="200" alt="检查页">
  &nbsp;&nbsp;
  <img src="home/小程序图片/各工具页面展示/温病掌上学 抽查页.jpg" width="200" alt="抽查页">
</p>

### 随时背功能

<p align="center">
  <img src="home/小程序图片/随时背展示/随时背 选择科目页.jpg" width="200" alt="随时背选科">
  &nbsp;&nbsp;
  <img src="home/小程序图片/随时背展示/随时背 学习页.jpg" width="200" alt="随时背学习">
  &nbsp;&nbsp;
  <img src="home/小程序图片/随时背展示/随时背.jpg" width="200" alt="随时背">
</p>

### 背诵组功能

<p align="center">
  <img src="home/小程序图片/特色功能-背诵组功能.jpg" width="200" alt="背诵组功能">
</p>

## 功能特性

### 学习工具

| 工具 | 说明 | 学习模式 |
|------|------|----------|
| 📚 伤寒速速通 | 深入学习伤寒论，掌握经方应用 | 诵读 → 检查 → 抽查 |
| 💊 方剂速速记 | 快速记忆常用方剂组成与功效 | 诵读 → 检查 → 抽查 |
| 🌿 中药快快记 | 系统学习中药性味归经 | 诵读 → 检查 → 抽查 |
| 📖 内经随身背 | 随时背诵内经经典条文 | 诵读 → 检查 → 抽查 |
| 📋 金匮简易考 | 学习杂病辨治精要 | 诵读 → 检查 → 抽查 |
| 🌡️ 温病掌上学 | 掌握温病辨证论治方法 | 诵读 → 检查 → 抽查 |

### 辅助功能

- ⭐ **收藏功能**：收藏重要内容方便复习
- 📝 **学习历史**：记录学习轨迹
- ⏱️ **学习时长统计**：追踪学习进度
- 🎯 **随时背**：碎片时间背诵练习，支持按科目选择
- 👥 **背诵组**：组队学习互相监督
- 🏪 **积分商城**：学习兑换奖励
- 🔍 **全局搜索**：搜索中医经典内容
- 💬 **用户反馈**：提交反馈与建议，支持点赞互动
- 📢 **公告系统**：查看管理员发布的公告通知
- 📎 **资料管理**：浏览和兑换学习资料
- 🔗 **邀请码**：通过邀请码注册获得积分奖励

### 管理后台功能

- 👤 **用户管理**：查看和管理注册用户
- 📚 **内容管理**：在线编辑、发布六大经典内容
- 🏷️ **分类管理**：管理内容分类体系
- 🏪 **商城管理**：配置积分商城商品
- 📎 **资料管理**：上传和管理学习资料
- 📢 **公告管理**：发布和管理公告通知
- 💬 **反馈管理**：查看用户反馈并回复
- 📊 **数据统计**：查看平台运营数据
- ⚙️ **系统配置**：管理平台配置项
- 🔐 **管理员管理**：管理后台管理员账号

## 项目结构

```
├── admin/              # 后台管理系统 (Vue 3 + Vite + TypeScript + Element Plus)
│   ├── src/pages/      #   页面：用户管理、内容管理、反馈、公告、资料、商城、统计等
│   └── .env*           #   多环境配置（development / staging / production）
├── backend/            # 后端 API 服务 (Node.js + Express + Sequelize + MySQL)
│   ├── config/         #   数据库连接配置
│   ├── controllers/    #   控制器（业务逻辑）
│   ├── middlewares/     #   中间件（认证、权限）
│   ├── models/         #   数据模型（23个模型，含用户、内容、反馈、商城等）
│   ├── routes/         #   路由定义（含 admin 子路由）
│   ├── scripts/        #   数据导入等脚本工具
│   ├── services/       #   服务层（邀请码等业务逻辑）
│   └── uploads/        #   用户上传文件存储
├── docs/               # 项目文档
│   ├── Admin-API文档.md #   后台管理 API 文档
│   ├── XCX-API文档.md   #   微信小程序 API 文档
│   └── content_library.sql # 数据库结构与初始数据
├── home/               # 项目主页 (React + Vite + TypeScript + Tailwind CSS)
│   └── 小程序图片/      #   界面截图资源
├── xcx/                # 微信小程序 (原生开发)
│   ├── pages/          #   20个页面（首页、学习、背诵、商城、反馈等）
│   ├── utils/          #   工具函数（API调用、数据管理、缓存等）
│   ├── images/         #   图片资源
│   └── custom-tab-bar/ #   自定义底部导航栏
└── 云端数据ison/        # 中医经典数据文件 (JSON)
    ├── shanghan.json    #   伤寒论
    ├── fangji.json      #   方剂学
    ├── neijing.json     #   内经
    ├── zhongyao.json    #   中药学
    ├── jingui.json      #   金匮要略
    └── wenbing.json     #   温病学
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8 或 pnpm >= 8
- MySQL >= 5.7
- 微信开发者工具（小程序开发）

### 后端部署

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接、JWT 密钥、微信 AppID 等配置

# 导入数据库结构与初始数据
mysql -u your_username -p your_database_name < docs/content_library.sql

# 导入中医经典内容数据
npm run import-content

# 启动服务（生产）
npm start

# 或使用 nodemon 热重载（开发）
npm run dev
```

### 后台管理系统部署

```bash
cd admin

# 安装依赖（推荐使用 pnpm）
pnpm install

# 配置环境变量
# 编辑 .env 文件，配置后端 API 地址

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 微信小程序部署

1. 使用微信开发者工具打开 `xcx` 目录
2. 配置 `xcx/utils/config.js` 中的 API 地址
3. 在微信公众平台配置服务器域名
4. 预览或上传小程序

### 项目主页部署

```bash
cd home

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
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

# 环境
NODE_ENV=development

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_APPSECRET=your_wechat_appsecret

# 数据库同步配置（生产环境建议关闭）
DB_SYNC_ENABLED=false
DB_SYNC_ALTER=false

# API 基础 URL
API_BASE_URL=http://localhost:3000
ADMIN_BASE_URL=http://localhost:3333
```

### 后台管理系统配置 (admin/.env)

```env
# 项目标题
VITE_APP_TITLE=山药铭记后台管理系统

# 路由模式（hash 或 html5）
VITE_ROUTER_HISTORY=hash

# 后端API地址（开发环境）
VITE_BASE_URL=http://localhost:3000/api
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
    assetHost: 'https://your-api-domain'
  }
};
```

## 数据说明

### 中医经典数据

项目在 `云端数据ison/` 目录下包含六大中医经典的 JSON 数据文件，可通过后端脚本导入数据库：

| 数据集 | 文件 | 说明 |
|--------|------|------|
| 伤寒论 | shanghan.json | 张仲景《伤寒论》内容，含条文与经方 |
| 方剂学 | fangji.json | 常用方剂数据库，含组成、功效 |
| 内经 | neijing.json | 《黄帝内经》核心内容 |
| 中药学 | zhongyao.json | 中药性味归经数据 |
| 金匮要略 | jingui.json | 张仲景《金匮要略》内容 |
| 温病学 | wenbing.json | 温病学派经典内容 |

导入命令：
```bash
cd backend && npm run import-content
```

### 数据库模型关系

系统共包含 23 个数据模型，核心关系如下：

```
User (用户)
 ├── Favorite (收藏) ── Tool (工具)
 ├── History (学习历史) ── Tool (工具)
 ├── StudyProgress (学习进度)
 ├── UserExchange (积分兑换) ── ShopItem (商城商品)
 ├── MaterialExchange (资料兑换) ── Material (资料)
 ├── Comment (评论) ── CommentLike (评论点赞)
 ├── Feedback (反馈) ── FeedbackLike / FeedbackReply
 └── SyncHistory (同步记录)

ContentCollection (内容集合)
 └── ContentItem (内容条目) ── ContentDeleteLog (删除日志)
```

## 技术栈

### 后端 (backend)

- **运行时**：Node.js >= 16
- **框架**：Express 4
- **ORM**：Sequelize 6（MySQL2 驱动）
- **数据库**：MySQL >= 5.7
- **认证**：JWT (jsonwebtoken) + bcryptjs 密码加密
- **安全**：Helmet (HTTP 安全头)、CORS 跨域配置
- **日志**：Morgan
- **文件上传**：Multer
- **HTTP 客户端**：Axios（用于调用微信 API）
- **环境变量**：dotenv

### 后台管理系统 (admin)

- **框架**：Vue 3.5 + TypeScript
- **构建工具**：Vite 5
- **UI 库**：Element Plus 2 + Element Plus Icons
- **表格组件**：vxe-table
- **CSS 工具**：UnoCSS + Sass
- **状态管理**：Pinia
- **路由**：Vue Router 4（支持 Hash / HTML5 模式）
- **代码规范**：ESLint + Husky + lint-staged
- **模板**：基于 [V3 Admin Vite](https://github.com/un-pany/v3-admin-vite)

### 微信小程序 (xcx)

- **开发方式**：原生微信小程序开发
- **技术**：WXML / WXSS / JavaScript
- **特性**：自定义 TabBar、自定义分组学习、图片缓存、分享功能

### 项目主页 (home)

- **框架**：React 18 + TypeScript
- **构建工具**：Vite 6
- **样式**：Tailwind CSS 4
- **路由**：React Router 7
- **动画**：Motion (Framer Motion)
- **图标**：Lucide React

## API 路由总览

| 路由前缀 | 说明 | 文档 |
|----------|------|------|
| `/api/auth` | 用户认证（注册、登录、微信登录） | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/users` | 用户信息管理 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/tools` | 学习工具管理 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/content` | 中医经典内容查询 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/favorites` | 收藏管理 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/history` | 学习历史 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/progress` | 学习进度与同步 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/shop` | 积分商城 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/materials` | 学习资料 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/feedback` | 用户反馈 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/notice` | 公告通知 | [XCX-API文档](docs/XCX-API文档.md) |
| `/api/admin` | 后台管理（用户/内容/商城/反馈等） | [Admin-API文档](docs/Admin-API文档.md) |
| `/api/config/:key` | 公开配置查询 | - |
| `/api/health` | 健康检查 | - |

## 文档

- [后台管理 API 文档](docs/Admin-API文档.md)
- [微信小程序 API 文档](docs/XCX-API文档.md)
- [数据库结构](docs/content_library.sql)

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

- 邮箱：2938307109@qq.com

## 致谢

感谢所有为中医传承和发展做出贡献的人！

## 开源项目引用

- 后台管理系统基于 [V3 Admin Vite](https://github.com/un-pany/v3-admin-vite)
