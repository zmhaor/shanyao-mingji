# 学习工具箱 API 文档

## 1. 基础信息

### 1.1 API 地址
- 开发环境：`http://localhost:3000/api`
- 生产环境：`http://your-api-domain.com/api`

### 1.2 认证方式
- 使用 JWT (JSON Web Token) 进行认证
- 登录成功后，服务器会返回 token，客户端需将 token 存储并在后续请求中通过 `Authorization` 头传递
- 格式：`Authorization: Bearer <token>`

### 1.3 响应格式
所有 API 响应均为 JSON 格式，包含以下字段：
```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": { ... },
  "error": { ... }
}
```

## 2. 接口详情

### 2.1 认证相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 用户注册 | `/auth/register` | POST | `{ nickName: string, email: string, password: string }` | 不需要 |
| 用户登录 | `/auth/login` | POST | `{ email: string, password: string }` | 不需要 |
| 微信登录 | `/auth/wechat` | POST | `{ code: string, userInfo: object }` | 不需要 |

#### 2.1.1 用户注册
- **请求方法**：POST
- **请求路径**：`/auth/register`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `nickName` | string | 是 | 用户名 |
  | `email` | string | 是 | 邮箱地址 |
  | `password` | string | 是 | 密码（至少6位） |

- **响应示例**：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nickName": "张三",
      "email": "zhangsan@example.com",
      "points": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 2.1.2 用户登录
- **请求方法**：POST
- **请求路径**：`/auth/login`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `email` | string | 是 | 邮箱地址 |
  | `password` | string | 是 | 密码 |

- **响应示例**：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nickName": "张三",
      "email": "zhangsan@example.com",
      "points": 100,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 2.1.3 微信登录
- **请求方法**：POST
- **请求路径**：`/auth/wechat`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `code` | string | 是 | 微信登录凭证 code |
  | `userInfo` | object | 是 | 微信用户信息 |

- **响应示例**：
```json
{
  "success": true,
  "message": "微信登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "nickName": "微信用户",
      "email": "",
      "points": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 2.2 用户相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 获取用户信息 | `/users/me` | GET | 无 | 需要 |
| 更新用户资料 | `/users/profile` | PUT | `{ nickName: string, email: string }` | 需要 |
| 更新密码 | `/users/password` | PUT | `{ password: string }` | 需要 |

#### 2.2.1 获取用户信息
- **请求方法**：GET
- **请求路径**：`/users/me`
- **请求参数**：无
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "nickName": "张三",
    "email": "zhangsan@example.com",
    "points": 100,
    "stats": {
      "favorites": 5,
      "history": 10
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 2.2.2 更新用户资料
- **请求方法**：PUT
- **请求路径**：`/users/profile`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `nickName` | string | 否 | 用户名 |
  | `email` | string | 否 | 邮箱地址 |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "更新资料成功",
  "data": {
    "id": 1,
    "nickName": "李四",
    "email": "lisi@example.com",
    "points": 100,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 2.2.3 更新密码
- **请求方法**：PUT
- **请求路径**：`/users/password`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `password` | string | 是 | 新密码（至少6位） |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "密码更新成功"
}
```

### 2.3 工具相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 获取工具列表 | `/tools` | GET | `{ page: number, pageSize: number, category: string }` | 不需要 |
| 获取工具详情 | `/tools/{id}` | GET | `id`（路径参数） | 不需要 |

#### 2.3.1 获取工具列表
- **请求方法**：GET
- **请求路径**：`/tools`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `page` | number | 否 | 页码，默认 1 |
  | `pageSize` | number | 否 | 每页数量，默认 10 |
  | `category` | string | 否 | 工具分类 |

- **响应示例**：
```json
{
  "success": true,
  "message": "获取工具列表成功",
  "data": {
    "tools": [
      {
        "id": 1,
        "name": "计算器",
        "description": "简单的计算器工具",
        "icon": "calculator.png",
        "category": "实用工具",
        "usageCount": 100
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 2.3.2 获取工具详情
- **请求方法**：GET
- **请求路径**：`/tools/{id}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `id` | number | 是 | 工具 ID（路径参数） |

- **响应示例**：
```json
{
  "success": true,
  "message": "获取工具详情成功",
  "data": {
    "id": 1,
    "name": "计算器",
    "description": "简单的计算器工具",
    "icon": "calculator.png",
    "category": "实用工具",
    "usageCount": 100,
    "isFavorite": false
  }
}
```

### 2.4 收藏相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 获取收藏列表 | `/favorites` | GET | 无 | 需要 |
| 添加收藏 | `/favorites/{toolId}` | POST | `toolId`（路径参数） | 需要 |
| 移除收藏 | `/favorites/{toolId}` | DELETE | `toolId`（路径参数） | 需要 |

#### 2.4.1 获取收藏列表
- **请求方法**：GET
- **请求路径**：`/favorites`
- **请求参数**：无
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "获取收藏列表成功",
  "data": {
    "favorites": [
      {
        "id": 1,
        "toolId": 1,
        "tool": {
          "id": 1,
          "name": "计算器",
          "description": "简单的计算器工具",
          "icon": "calculator.png"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 2.4.2 添加收藏
- **请求方法**：POST
- **请求路径**：`/favorites/{toolId}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `toolId` | number | 是 | 工具 ID（路径参数） |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "添加收藏成功"
}
```

#### 2.4.3 移除收藏
- **请求方法**：DELETE
- **请求路径**：`/favorites/{toolId}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `toolId` | number | 是 | 工具 ID（路径参数） |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "移除收藏成功"
}
```

### 2.5 历史相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 获取历史记录 | `/history` | GET | 无 | 需要 |
| 添加历史记录 | `/history/{toolId}` | POST | `toolId`（路径参数） | 需要 |
| 清空历史记录 | `/history` | DELETE | 无 | 需要 |

#### 2.5.1 获取历史记录
- **请求方法**：GET
- **请求路径**：`/history`
- **请求参数**：无
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "获取历史记录成功",
  "data": {
    "history": [
      {
        "id": 1,
        "toolId": 1,
        "tool": {
          "id": 1,
          "name": "计算器",
          "description": "简单的计算器工具",
          "icon": "calculator.png"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 2.5.2 添加历史记录
- **请求方法**：POST
- **请求路径**：`/history/{toolId}`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `toolId` | number | 是 | 工具 ID（路径参数） |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "添加历史记录成功"
}
```

#### 2.5.3 清空历史记录
- **请求方法**：DELETE
- **请求路径**：`/history`
- **请求参数**：无
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "清空历史记录成功"
}
```

### 2.6 商城相关接口

| 接口名称 | 请求路径 | 请求方法 | 请求参数 | 认证要求 |
|---------|---------|---------|---------|---------|
| 获取商城商品 | `/shop/items` | GET | 无 | 不需要 |
| 获取用户积分 | `/shop/points` | GET | 无 | 需要 |
| 兑换商品 | `/shop/exchange` | POST | `{ itemId: number }` | 需要 |

#### 2.6.1 获取商城商品
- **请求方法**：GET
- **请求路径**：`/shop/items`
- **请求参数**：无

- **响应示例**：
```json
{
  "success": true,
  "message": "获取商城商品成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "优惠券",
        "description": "10元优惠券",
        "price": 50,
        "stock": 100,
        "image": "coupon.png"
      }
    ]
  }
}
```

#### 2.6.2 获取用户积分
- **请求方法**：GET
- **请求路径**：`/shop/points`
- **请求参数**：无
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "获取积分成功",
  "data": {
    "points": 100
  }
}
```

#### 2.6.3 兑换商品
- **请求方法**：POST
- **请求路径**：`/shop/exchange`
- **请求参数**：
  | 参数名 | 类型 | 必填 | 描述 |
  | :--- | :--- | :--- | :--- |
  | `itemId` | number | 是 | 商品 ID |
- **认证要求**：需要携带 token

- **响应示例**：
```json
{
  "success": true,
  "message": "兑换成功",
  "data": {
    "orderId": 1,
    "itemName": "优惠券",
    "pointsUsed": 50,
    "remainingPoints": 50
  }
}
```

## 3. 错误码说明

| 错误码 | 描述 |
| :--- | :--- |
| 400 | 请求参数错误 |
| 401 | 未授权或登录过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 4. 示例请求

### 4.1 登录请求示例
```javascript
const api = require('../../utils/api');

async function login() {
  try {
    const res = await api.auth.login({ email, password });
    
    if (res.success) {
      wx.setStorageSync('token', res.data.token);
      wx.setStorageSync('currentUser', res.data.user);
      wx.showToast({ title: '登录成功', icon: 'success' });
    } else {
      wx.showToast({ title: res.message || '登录失败', icon: 'none' });
    }
  } catch (error) {
    wx.showToast({ title: error.message || '登录失败', icon: 'none' });
  }
}
```

### 4.2 获取用户信息示例
```javascript
const api = require('../../utils/api');

async function getUserInfo() {
  try {
    const res = await api.user.getInfo();
    
    if (res.success) {
      console.log('用户信息:', res.data);
    } else {
      wx.showToast({ title: res.message || '获取用户信息失败', icon: 'none' });
    }
  } catch (error) {
    wx.showToast({ title: error.message || '获取用户信息失败', icon: 'none' });
  }
}
```

## 5. 注意事项

1. 所有需要认证的接口必须在请求头中携带有效的 token
2. 密码长度至少为 6 位
3. 邮箱格式必须符合标准格式
4. 微信登录需要先调用 `wx.login()` 获取 code，再调用 `wx.getUserInfo()` 获取用户信息
5. 商城兑换商品时，需要确保用户积分足够
6. 接口调用频率限制：每 IP 每分钟最多 60 次请求

## 6. 技术支持

如果您在使用 API 过程中遇到问题，请联系：
- 邮箱：support@your-domain.com
- 微信：your_wechat_id