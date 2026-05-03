const jwt = require("jsonwebtoken")

// 用户认证中间件
function auth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ success: false, message: "未提供认证令牌" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "认证令牌无效或已过期" })
  }
}

// 管理员信息接口（用于前端获取当前登录用户信息）
function getAdminInfo(req, res) {
  try {
    const { id, username, role } = req.user

    res.json({
      success: true,
      data: {
        id,
        username,
        roles: [role],
        permissions: ["admin"]
      }
    })
  } catch (error) {
    console.error("获取管理员信息失败:", error)
    res.status(500).json({ success: false, message: "获取管理员信息失败" })
  }
}

// 管理员认证中间件
function adminAuth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ success: false, message: "未提供认证令牌" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "权限不足" })
    }

    req.admin = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "认证令牌无效或已过期" })
  }
}

module.exports = { auth, adminAuth, getAdminInfo }
