# 小程序对接 API 文档

## 1. 文档概述

本文档描述了与小程序对接的后端 API 接口，包括认证、用户管理、工具管理、收藏管理、历史记录管理和商城管理等功能。所有接口均返回 JSON 格式数据，基础 URL 为 `http://localhost:3000/api`。

## 2. 接口列表

| 模块     | 接口路径           | 请求方法 | 功能描述         | 权限要求 |
| -------- | ------------------ | -------- | ---------------- | -------- |
| 认证     | /auth/register     | POST     | 用户注册         | 无       |
| 认证     | /auth/login        | POST     | 用户登录         | 无       |
| 用户     | /users/info        | GET      | 获取用户信息     | 需要认证 |
| 用户     | /users/me          | GET      | 获取当前用户信息 | 需要认证 |
| 用户     | /users/profile     | PUT      | 更新用户信息     | 需要认证 |
| 工具     | /tools             | GET      | 获取工具列表     | 无       |
| 工具     | /tools/:id         | GET      | 获取工具详情     | 无       |
| 收藏     | /favorites         | GET      | 获取收藏列表     | 需要认证 |
| 收藏     | /favorites/:toolId | POST     | 添加收藏         | 需要认证 |
| 收藏     | /favorites/:toolId | DELETE   | 取消收藏         | 需要认证 |
| 历史记录 | /history           | GET      | 获取历史记录     | 需要认证 |
| 历史记录 | /history/:toolId   | POST     | 添加历史记录     | 需要认证 |
| 历史记录 | /history           | DELETE   | 清除历史记录     | 需要认证 |
| 商城     | /shop/items        | GET      | 获取商城商品列表 | 无       |
| 商城     | /shop/points       | GET      | 获取用户积分     | 需要认证 |
| 商城     | /shop/exchange     | POST     | 兑换商品         | 需要认证 |
| 健康检查 | /health            | GET      | 服务器健康检查   | 无       |

## 3. 详细接口说明

### 3.1 认证相关接口

#### 3.1.1 用户注册

**接口路径：** `/auth/register`
**请求方法：** POST
**功能描述：** 注册新用户并返回 JWT 令牌

**请求参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| nickName | string | 是 | 用户昵称 |
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |

**成功响应：**

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickName": "测试用户",
      "avatarUrl": "",
      "points": 100
    }
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "邮箱已被注册"
}
```

#### 3.1.2 用户登录

**接口路径：** `/auth/login`
**请求方法：** POST
**功能描述：** 用户登录并返回 JWT 令牌

**请求参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |

**成功响应：**

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickName": "测试用户",
      "avatarUrl": "",
      "points": 100
    }
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "邮箱或密码错误"
}
```

### 3.2 用户相关接口

#### 3.2.1 获取用户信息

**接口路径：** `/users/info`
**请求方法：** GET
**功能描述：** 获取当前登录用户的详细信息
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "测试用户",
    "roles": ["user"],
    "permissions": ["user"],
    "stats": {
      "favorites": 5,
      "history": 10
    }
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "未提供认证令牌"
}
```

#### 3.2.2 获取当前用户信息

**接口路径：** `/users/me`
**请求方法：** GET
**功能描述：** 获取当前登录用户的详细信息（RESTful 风格）
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "测试用户",
    "roles": ["user"],
    "permissions": ["user"],
    "stats": {
      "favorites": 5,
      "history": 10
    }
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "未提供认证令牌"
}
```

#### 3.2.3 更新用户信息

**接口路径：** `/users/profile`
**请求方法：** PUT
**功能描述：** 更新当前登录用户的信息
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**请求参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| nickName | string | 是 | 用户昵称 |
| avatarUrl | string | 否 | 用户头像 URL |

**成功响应：**

```json
{
  "success": true,
  "message": "更新成功"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "用户不存在"
}
```

### 3.3 工具相关接口

#### 3.3.1 获取工具列表

**接口路径：** `/tools`
**请求方法：** GET
**功能描述：** 获取工具列表，支持分类和关键词搜索

**查询参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| category | string | 否 | 工具分类 |
| keyword | string | 否 | 搜索关键词 |

**成功响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "JSON 格式化",
      "description": "格式化 JSON 数据",
      "icon": "json",
      "category": "开发工具",
      "content": "{\"key\": \"value\"}",
      "create_time": 1620000000000,
      "update_time": 1620000000000
    }
  ]
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "获取工具列表失败"
}
```

#### 3.3.2 获取工具详情

**接口路径：** `/tools/:id`
**请求方法：** GET
**功能描述：** 获取指定工具的详细信息

**路径参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 工具 ID |

**成功响应：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "JSON 格式化",
    "description": "格式化 JSON 数据",
    "icon": "json",
    "category": "开发工具",
    "content": "{\"key\": \"value\"}",
    "create_time": 1620000000000,
    "update_time": 1620000000000
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "工具不存在"
}
```

### 3.4 收藏相关接口

#### 3.4.1 获取收藏列表

**接口路径：** `/favorites`
**请求方法：** GET
**功能描述：** 获取当前登录用户的收藏列表
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "tool_id": 1,
      "create_time": 1620000000000,
      "name": "JSON 格式化",
      "description": "格式化 JSON 数据",
      "icon": "json",
      "category": "开发工具"
    }
  ]
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "获取收藏列表失败"
}
```

#### 3.4.2 添加收藏

**接口路径：** `/favorites/:toolId`
**请求方法：** POST
**功能描述：** 为当前登录用户添加工具收藏
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**路径参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| toolId | number | 是 | 工具 ID |

**成功响应：**

```json
{
  "success": true,
  "message": "收藏成功"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "已收藏该工具"
}
```

#### 3.4.3 取消收藏

**接口路径：** `/favorites/:toolId`
**请求方法：** DELETE
**功能描述：** 取消当前登录用户对指定工具的收藏
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**路径参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| toolId | number | 是 | 工具 ID |

**成功响应：**

```json
{
  "success": true,
  "message": "取消收藏成功"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "未找到收藏记录"
}
```

### 3.5 历史记录相关接口

#### 3.5.1 获取历史记录

**接口路径：** `/history`
**请求方法：** GET
**功能描述：** 获取当前登录用户的工具使用历史记录
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "tool_id": 1,
      "tool_name": "JSON 格式化",
      "create_time": 1620000000000
    }
  ]
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "获取历史记录失败"
}
```

#### 3.5.2 添加历史记录

**接口路径：** `/history/:toolId`
**请求方法：** POST
**功能描述：** 为当前登录用户添加工具使用历史记录
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**路径参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| toolId | number | 是 | 工具 ID |

**成功响应：**

```json
{
  "success": true,
  "message": "记录成功"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "工具不存在"
}
```

#### 3.5.3 清除历史记录

**接口路径：** `/history`
**请求方法：** DELETE
**功能描述：** 清除当前登录用户的所有历史记录
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "message": "清除历史记录成功"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "清除历史记录失败"
}
```

### 3.6 商城相关接口

#### 3.6.1 获取商城商品列表

**接口路径：** `/shop/items`
**请求方法：** GET
**功能描述：** 获取商城商品列表

**成功响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "积分卡",
      "icon": "card",
      "points": 100,
      "description": "增加 100 积分",
      "is_active": true,
      "create_time": 1620000000000,
      "update_time": 1620000000000
    }
  ]
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "获取商城商品失败"
}
```

#### 3.6.2 获取用户积分

**接口路径：** `/shop/points`
**请求方法：** GET
**功能描述：** 获取当前登录用户的积分余额
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**成功响应：**

```json
{
  "success": true,
  "data": {
    "points": 100
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "获取用户积分失败"
}
```

#### 3.6.3 兑换商品

**接口路径：** `/shop/exchange`
**请求方法：** POST
**功能描述：** 使用积分兑换商城商品
**权限要求：** 需要在请求头中携带有效的 JWT 令牌

**请求头：**
| 头名 | 值 |
|------|------|
| Authorization | Bearer {token} |

**请求参数：**
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| itemId | number | 是 | 商品 ID |

**成功响应：**

```json
{
  "success": true,
  "message": "兑换成功",
  "data": {
    "remainingPoints": 50
  }
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "积分不足"
}
```

### 3.7 健康检查

**接口路径：** `/health`
**请求方法：** GET
**功能描述：** 检查服务器运行状态

**成功响应：**

```json
{
  "success": true,
  "message": "服务器运行正常"
}
```

## 4. 响应格式

### 4.1 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 4.2 失败响应

```json
{
  "success": false,
  "message": "操作失败的原因"
}
```

## 5. 错误码说明

| 错误码 | 描述                         |
| ------ | ---------------------------- |
| 400    | 请求参数错误或积分不足       |
| 401    | 未提供认证令牌或认证令牌无效 |
| 403    | 权限不足                     |
| 404    | 资源不存在                   |
| 500    | 服务器内部错误               |

## 6. 认证说明

所有需要认证的接口都需要在请求头中携带有效的 JWT 令牌，格式为：

```
Authorization: Bearer {token}
```

其中 `{token}` 是通过登录或注册接口获取的 JWT 令牌。

## 7. 注意事项

1. 所有接口均支持 CORS 跨域请求
2. 生产环境中应该设置具体的 CORS 域名，而不是使用 `*`
3. 生产环境中应该使用 HTTPS 协议
4. 敏感操作应该增加额外的安全措施，如验证码、二次确认等
5. 定期清理历史记录和过期数据，避免数据库过大

## 8. 版本信息

- API 版本：v1.0.0
- 文档更新时间：2026-01-30
