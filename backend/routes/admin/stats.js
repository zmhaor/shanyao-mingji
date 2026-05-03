const express = require("express")

const router = express.Router()
const { Op } = require("sequelize")
const sequelize = require("../../config/database")
const { adminAuth } = require("../../middlewares/auth")
const { User, History, UserExchange, ShopItem } = require("../../models")

// 获取用户统计
router.get("/users", adminAuth, async (req, res) => {
  try {
    const now = Date.now()
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const weekStart = now - 7 * 24 * 60 * 60 * 1000
    const monthStart = now - 30 * 24 * 60 * 60 * 1000

    const [total, active, newToday, newThisWeek, newThisMonth, activeDurationResult] = await Promise.all([
      User.count(),
      User.count({ where: { update_time: { [Op.gte]: weekStart } } }),
      User.count({ where: { create_time: { [Op.gte]: todayStart } } }),
      User.count({ where: { create_time: { [Op.gte]: weekStart } } }),
      User.count({ where: { create_time: { [Op.gte]: monthStart } } }),
      History.sum("duration", { where: { create_time: { [Op.gte]: weekStart } } })
    ])

    res.json({
      success: true,
      data: {
        total,
        active,
        newToday,
        newThisWeek,
        newThisMonth,
        activeDuration: activeDurationResult || 0
      }
    })
  } catch (error) {
    console.error("获取用户统计失败:", error)
    res.status(500).json({ success: false, message: "获取用户统计失败" })
  }
})

// 获取工具使用统计（按停留时长）
router.get("/tools", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const where = {}
    if (startDate) {
      where.create_time = { ...where.create_time, [Op.gte]: Number.parseInt(startDate) }
    }
    if (endDate) {
      where.create_time = { ...where.create_time, [Op.lte]: Number.parseInt(endDate) }
    }

    // 按工具分组统计停留时长
    const results = await History.findAll({
      where,
      attributes: [
        "tool_id",
        "tool_name",
        [sequelize.fn("SUM", sequelize.col("duration")), "totalDuration"],
        [sequelize.fn("COUNT", sequelize.col("id")), "uses"]
      ],
      group: ["tool_id", "tool_name"],
      order: [[sequelize.fn("SUM", sequelize.col("duration")), "DESC"]],
      limit: 10,
      raw: true
    })

    const totalDuration = results.reduce((sum, r) => sum + (Number(r.totalDuration) || 0), 0)

    const topTools = results.map((r) => ({
      toolId: r.tool_id,
      name: r.tool_name,
      duration: Number(r.totalDuration) || 0,
      uses: Number(r.uses) || 0,
      percentage: totalDuration > 0 ? Math.round((Number(r.totalDuration) / totalDuration) * 100) : 0
    }))

    res.json({
      success: true,
      data: {
        totalDuration,
        topTools
      }
    })
  } catch (error) {
    console.error("获取工具使用统计失败:", error)
    res.status(500).json({ success: false, message: "获取工具使用统计失败" })
  }
})

// 获取用户工具使用时长排行
router.get("/user-tool-usage", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const where = {}
    if (startDate) {
      where.create_time = { ...where.create_time, [Op.gte]: Number.parseInt(startDate) }
    }
    if (endDate) {
      where.create_time = { ...where.create_time, [Op.lte]: Number.parseInt(endDate) }
    }

    // 按用户分组统计工具使用时长
    const results = await History.findAll({
      where,
      attributes: [
        "user_id",
        [sequelize.fn("SUM", sequelize.col("duration")), "totalDuration"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalVisits"]
      ],
      group: ["user_id"],
      order: [[sequelize.fn("SUM", sequelize.col("duration")), "DESC"]],
      limit: 20,
      raw: true
    })

    // 批量查询用户信息
    const userIds = results.map(r => r.user_id)
    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "nick_name", "avatar_url"],
      raw: true
    })
    const userMap = {}
    users.forEach(u => { userMap[u.id] = u })

    const userUsage = results.map(r => {
      const user = userMap[r.user_id] || {}
      return {
        userId: r.user_id,
        nickname: user.nick_name || "未知用户",
        avatarUrl: user.avatar_url || "",
        totalDuration: Number(r.totalDuration) || 0,
        totalVisits: Number(r.totalVisits) || 0
      }
    })

    res.json({
      success: true,
      data: { userUsage }
    })
  } catch (error) {
    console.error("获取用户工具使用统计失败:", error)
    res.status(500).json({ success: false, message: "获取用户工具使用统计失败" })
  }
})

// 获取兑换统计
router.get("/exchanges", adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const where = {}
    if (startDate) {
      where.create_time = { ...where.create_time, [Op.gte]: Number.parseInt(startDate) }
    }
    if (endDate) {
      where.create_time = { ...where.create_time, [Op.lte]: Number.parseInt(endDate) }
    }

    // 获取所有兑换记录
    const exchanges = await UserExchange.findAll({ where })

    // 统计每个商品的兑换次数和总积分
    const itemExchangeMap = {}
    let totalPoints = 0

    exchanges.forEach((exchange) => {
      totalPoints += exchange.points
      if (itemExchangeMap[exchange.item_id]) {
        itemExchangeMap[exchange.item_id].exchanges++
        itemExchangeMap[exchange.item_id].totalPoints += exchange.points
      } else {
        itemExchangeMap[exchange.item_id] = {
          itemId: exchange.item_id,
          itemName: exchange.item_name,
          exchanges: 1,
          totalPoints: exchange.points
        }
      }
    })

    // 转换为数组并排序
    const totalExchanges = exchanges.length
    const topItems = Object.values(itemExchangeMap)
      .map(item => ({
        id: item.itemId,
        name: item.itemName,
        exchanges: item.exchanges,
        percentage: totalExchanges > 0 ? Math.round((item.exchanges / totalExchanges) * 100) : 0
      }))
      .sort((a, b) => b.exchanges - a.exchanges)
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        totalExchanges,
        totalPoints,
        topItems
      }
    })
  } catch (error) {
    console.error("获取兑换统计失败:", error)
    res.status(500).json({ success: false, message: "获取兑换统计失败" })
  }
})

module.exports = router
