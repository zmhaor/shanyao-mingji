const express = require("express")

const router = express.Router()
const jwt = require("jsonwebtoken")
const { adminAuth } = require("../../middlewares/auth")
const { Admin } = require("../../models")

// 管理员登录
router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } })

    // 如果管理员不存在
    if (!admin) {
      return res.status(401).json({ success: false, message: "用户名或密码错误" })
    }

    // 验证密码
    if (!admin.validatePassword(password)) {
      return res.status(401).json({ success: false, message: "用户名或密码错误" })
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role
        }
      }
    })
  } catch (error) {
    console.error("管理员登录失败:", error)
    res.status(500).json({ success: false, message: "登录失败，请稍后重试" })
  }
})

// 修改管理员密码
router.put("/password", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const { id } = req.admin

    // 查找管理员
    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).json({ success: false, message: "管理员不存在" })
    }

    // 验证当前密码
    if (!admin.validatePassword(currentPassword)) {
      return res.status(400).json({ success: false, message: "当前密码错误" })
    }

    // 更新密码
    await admin.update({ password: newPassword })

    res.json({ success: true, message: "密码修改成功" })
  } catch (error) {
    console.error("修改密码失败:", error)
    res.status(500).json({ success: false, message: "修改密码失败，请稍后重试" })
  }
})

// 修改管理员用户名
router.put("/username", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newUsername } = req.body
    const { id } = req.admin

    // 查找管理员
    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).json({ success: false, message: "管理员不存在" })
    }

    // 验证当前密码
    if (!admin.validatePassword(currentPassword)) {
      return res.status(400).json({ success: false, message: "当前密码错误" })
    }

    // 检查新用户名是否已存在
    const existingAdmin = await Admin.findOne({ where: { username: newUsername } })
    if (existingAdmin && existingAdmin.id !== id) {
      return res.status(400).json({ success: false, message: "用户名已存在" })
    }

    // 更新用户名
    await admin.update({ username: newUsername })

    res.json({ success: true, message: "用户名修改成功" })
  } catch (error) {
    console.error("修改用户名失败:", error)
    res.status(500).json({ success: false, message: "修改用户名失败，请稍后重试" })
  }
})

module.exports = router
