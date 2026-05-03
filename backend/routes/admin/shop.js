const express = require("express")

const router = express.Router()
const { Op } = require("sequelize")
const { adminAuth } = require("../../middlewares/auth")
const { ShopItem, UserExchange, User } = require("../../models")

router.get("/items", adminAuth, async (req, res) => {
  try {
    const items = await ShopItem.findAll({
      where: {
        name: { [Op.ne]: "SYSTEM_DELETED_PLACEHOLDER" }
      }
    })

    res.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error("获取商城商品失败:", error)
    res.status(500).json({ success: false, message: "获取商城商品失败" })
  }
})

// 添加商城商品
router.post("/items", adminAuth, async (req, res) => {
  try {
    const { name, icon, points, description, is_active } = req.body

    // 创建商品
    const item = await ShopItem.create({
      name,
      icon,
      points,
      description,
      is_active
    })

    res.json({
      success: true,
      message: "添加成功",
      data: item
    })
  } catch (error) {
    console.error("添加商品失败:", error)
    res.status(500).json({ success: false, message: "添加商品失败" })
  }
})

// 更新商城商品
router.put("/items/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon, points, description, is_active } = req.body

    // 查找商品
    const item = await ShopItem.findByPk(id)
    if (!item) {
      return res.status(404).json({ success: false, message: "商品不存在" })
    }

    // 更新商品
    await item.update({
      name,
      icon,
      points,
      description,
      is_active
    })

    res.json({ success: true, message: "更新成功" })
  } catch (error) {
    console.error("更新商品失败:", error)
    res.status(500).json({ success: false, message: "更新商品失败" })
  }
})

// 删除商城商品
router.delete("/items/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    // 查找商品
    const item = await ShopItem.findByPk(id)
    if (!item) {
      return res.status(404).json({ success: false, message: "商品不存在" })
    }

    // 检查是否有兑换记录关联
    const exchangeCount = await UserExchange.count({ where: { item_id: id } })
    if (exchangeCount > 0) {
      // 找到或创建系统的删除占位商品
      let placeholder = await ShopItem.findOne({ where: { name: "SYSTEM_DELETED_PLACEHOLDER" } })
      if (!placeholder) {
        placeholder = await ShopItem.create({
          name: "SYSTEM_DELETED_PLACEHOLDER",
          icon: "",
          points: 0,
          description: "系统专用：用于继承已物理删除商品的兑换记录关联，请勿在前端展示",
          is_active: false
        })
      }

      // 将相关的兑换记录关联转移到 placeholder，这样既保留了历史记录，又允许物理删除原商品
      // （因为 UserExchange 自身冗余存储了 item_name，所以页面的兑换记录名称依然正确）
      await UserExchange.update({ item_id: placeholder.id }, { where: { item_id: id } })
    }

    // 安全删除商品
    await item.destroy()

    res.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除商品失败:", error)
    res.status(500).json({ success: false, message: "删除商品失败" })
  }
})

// 获取兑换记录
router.get("/exchanges", adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, userId, startDate, endDate } = req.query

    const where = {}

    if (userId) {
      where.user_id = userId
    }

    if (startDate) {
      where.create_time = { ...where.create_time, [Op.gte]: Number.parseInt(startDate) }
    }

    if (endDate) {
      where.create_time = { ...where.create_time, [Op.lte]: Number.parseInt(endDate) }
    }

    const offset = (page - 1) * pageSize

    const [exchanges, total] = await Promise.all([
      UserExchange.findAll({
        where,
        limit: Number.parseInt(pageSize),
        offset: Number.parseInt(offset),
        order: [["create_time", "DESC"]]
      }),
      UserExchange.count({ where })
    ])

    // 获取每个兑换记录的用户信息
    const exchangesWithUserInfo = await Promise.all(
      exchanges.map(async (exchange) => {
        const user = await User.findByPk(exchange.user_id)
        return {
          ...exchange.toJSON(),
          user_email: user?.email || "",
          user_nick_name: user?.nick_name || ""
        }
      })
    )

    res.json({
      success: true,
      data: {
        list: exchangesWithUserInfo,
        total,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error("获取兑换记录失败:", error)
    res.status(500).json({ success: false, message: "获取兑换记录失败" })
  }
})

module.exports = router
