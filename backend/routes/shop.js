const express = require("express")

const router = express.Router()
const { auth } = require("../middlewares/auth")
const { ShopItem, User, UserExchange } = require("../models")

// 获取商城商品
router.get("/items", async (req, res) => {
  try {
    const items = await ShopItem.findAll({ where: { is_active: true } })

    const formattedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      points: item.points,
      icon: item.icon
    }))

    res.json({
      success: true,
      message: "获取商城商品成功",
      data: {
        items: formattedItems
      }
    })
  } catch (error) {
    console.error("获取商城商品失败:", error)
    res.status(500).json({ success: false, message: "获取商城商品失败" })
  }
})

// 获取用户积分
router.get("/points", auth, async (req, res) => {
  try {
    const { id } = req.user

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    res.json({
      success: true,
      message: "获取积分成功",
      data: {
        points: user.points
      }
    })
  } catch (error) {
    console.error("获取用户积分失败:", error)
    res.status(500).json({ success: false, message: "获取用户积分失败" })
  }
})

// 兑换商品
router.post("/exchange", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { itemId } = req.body

    // 查找用户
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    // 查找商品
    const item = await ShopItem.findByPk(itemId)
    if (!item || !item.is_active) {
      return res.status(404).json({ success: false, message: "商品不存在或已下架" })
    }

    // 检查积分是否足够
    if (user.points < item.points) {
      return res.status(400).json({ success: false, message: "积分不足" })
    }

    // 扣减积分
    const pointsUsed = item.points
    user.points -= pointsUsed
    await user.save()

    // 记录兑换
    const exchange = await UserExchange.create({
      user_id: id,
      item_id: itemId,
      item_name: item.name,
      points: pointsUsed
    })

    res.json({
      success: true,
      message: "兑换成功",
      data: {
        orderId: exchange.id,
        itemName: item.name,
        pointsUsed,
        remainingPoints: user.points
      }
    })
  } catch (error) {
    console.error("兑换商品失败:", error)
    res.status(500).json({ success: false, message: "兑换商品失败" })
  }
})

module.exports = router
