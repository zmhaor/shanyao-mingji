# 贡献指南

感谢你对山药铭记项目的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请：

1. 在 Issues 中搜索是否已有相关问题
2. 如果没有，创建一个新的 Issue
3. 详细描述问题或建议，包括：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息

### 提交代码

1. Fork 本仓库
2. 创建你的特性分支：
   ```bash
   git checkout -b feature/你的特性名称
   ```
3. 提交你的更改：
   ```bash
   git commit -m 'feat: 添加某个特性'
   ```
4. 推送到分支：
   ```bash
   git push origin feature/你的特性名称
   ```
5. 打开一个 Pull Request

### 代码规范

- 使用一致的代码风格
- 添加必要的注释
- 确保代码通过测试
- 保持提交信息清晰明了

### 提交信息规范

我们使用约定式提交（Conventional Commits）规范：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

### 开发环境设置

1. 克隆仓库：
   ```bash
   git clone https://github.com/your-username/shanyao-mingji.git
   ```

2. 安装依赖：
   ```bash
   # 后端
   cd backend && npm install
   
   # 前端
   cd admin && npm install
   
   # 主页
   cd home && npm install
   ```

3. 配置环境变量：
   ```bash
   cp backend/.env.example backend/.env
   # 编辑配置文件
   ```

4. 启动开发服务器：
   ```bash
   # 后端
   cd backend && npm start
   
   # 前端
   cd admin && npm run dev
   ```

## 行为准则

- 尊重他人
- 保持专业
- 接受建设性批评
- 专注于对社区最有利的事情

## 问题反馈

如果你有任何问题或建议，请通过以下方式联系我们：

- 邮箱：your-email@example.com
- 微信：your_wechat_id

感谢你的贡献！