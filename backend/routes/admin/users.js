const express = require("express")

const router = express.Router()
const { Op } = require("sequelize")
const { adminAuth } = require("../../middlewares/auth")
const { User, Favorite, History, UserExchange } = require("../../models")

// 获取用户列表
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query

    const where = {}

    if (keyword) {
      where[Op.or] = [
        { email: { [Op.like]: `%${keyword}%` } },
        { nick_name: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const offset = (page - 1) * pageSize

    const [users, total] = await Promise.all([
      User.findAll({
        where,
        limit: Number.parseInt(pageSize),
        offset: Number.parseInt(offset),
        order: [["create_time", "DESC"]]
      }),
      User.count({ where })
    ])

    // 获取每个用户的统计信息
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [favoritesCount, historyCount] = await Promise.all([
          Favorite.count({ where: { user_id: user.id } }),
          History.count({ where: { user_id: user.id } })
        ])

        return {
          ...user.toJSON(),
          stats: {
            favorites: favoritesCount,
            history: historyCount
          }
        }
      })
    )

    res.json({
      success: true,
      data: {
        list: usersWithStats,
        total,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error("获取用户列表失败:", error)
    res.status(500).json({ success: false, message: "获取用户列表失败" })
  }
})

// 获取用户详情
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 获取用户统计信息
    const [favoritesCount, historyCount] = await Promise.all([
      Favorite.count({ where: { user_id: id } }),
      History.count({ where: { user_id: id } })
    ])

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
        stats: {
          favorites: favoritesCount,
          history: historyCount
        }
      }
    })
  } catch (error) {
    console.error("获取用户详情失败:", error)
    res.status(500).json({ success: false, message: "获取用户详情失败" })
  }
})

// 更新用户信息
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { nick_name, avatar_url, points } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    await user.update({
      nick_name,
      avatar_url,
      points
    })

    res.json({ success: true, message: "更新成功" })
  } catch (error) {
    console.error("更新用户信息失败:", error)
    res.status(500).json({ success: false, message: "更新用户信息失败" })
  }
})

// 创建用户
router.post("/", adminAuth, async (req, res) => {
  try {
    const { email, nick_name, password, points = 0 } = req.body

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: "邮箱已存在" })
    }

    // 创建新用户
    const newUser = await User.create({
      email,
      nick_name,
      password,
      points
    })

    res.json({ success: true, message: "添加成功" })
  } catch (error) {
    console.error("添加用户失败:", error)
    res.status(500).json({ success: false, message: "添加用户失败" })
  }
})

// 删除用户
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    // 检查用户是否存在
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 删除用户相关联的所有数据（包含后续加的功能表和自引用关系）
    await Promise.all([
      Favorite.destroy({ where: { user_id: id } }),
      History.destroy({ where: { user_id: id } }),
      UserExchange.destroy({ where: { user_id: id } }),
      // 如果有用户的邀请人设定为该用户，需要解绑（防止 users.invited_by 的外键完整性报错）
      User.update({ invited_by: null }, { where: { invited_by: id } })
    ])

    // 删除用户
    await user.destroy()

    res.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除用户失败:", error)
    res.status(500).json({ success: false, message: "删除用户失败" })
  }
})

module.exports = router
