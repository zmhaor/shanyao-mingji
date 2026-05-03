const express = require("express")

const router = express.Router()
const { auth } = require("../middlewares/auth")
const { Favorite, Tool } = require("../models")

// 获取收藏列表
router.get("/", auth, async (req, res) => {
  try {
    const { id } = req.user

    const favorites = await Favorite.findAll({
      where: { user_id: id },
      include: [{
        model: Tool,
        attributes: ["name", "description", "icon", "category"]
      }]
    })

    const formattedFavorites = favorites.map(fav => ({
      id: fav.id,
      toolId: fav.tool_id,
      tool: {
        id: fav.tool_id,
        name: fav.Tool.name,
        description: fav.Tool.description,
        icon: fav.Tool.icon
      },
      createdAt: new Date(fav.create_time).toISOString()
    }))

    res.json({
      success: true,
      message: "获取收藏列表成功",
      data: {
        favorites: formattedFavorites
      }
    })
  } catch (error) {
    console.error("获取收藏列表失败:", error)
    res.status(500).json({ success: false, message: "获取收藏列表失败" })
  }
})

// 添加收藏
router.post("/:toolId", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { toolId } = req.params

    // 检查工具是否存在
    const tool = await Tool.findByPk(toolId)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    // 检查是否已收藏
    const existingFavorite = await Favorite.findOne({
      where: { user_id: id, tool_id: toolId }
    })

    if (existingFavorite) {
      return res.status(400).json({ success: false, message: "已收藏该工具" })
    }

    // 添加收藏
    await Favorite.create({
      user_id: id,
      tool_id: toolId
    })

    res.json({ success: true, message: "添加收藏成功" })
  } catch (error) {
    console.error("添加收藏失败:", error)
    res.status(500).json({ success: false, message: "添加收藏失败" })
  }
})

// 移除收藏
router.delete("/:toolId", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { toolId } = req.params

    // 删除收藏
    const result = await Favorite.destroy({
      where: { user_id: id, tool_id: toolId }
    })

    if (result === 0) {
      return res.status(404).json({ success: false, message: "未找到收藏记录" })
    }

    res.json({ success: true, message: "移除收藏成功" })
  } catch (error) {
    console.error("移除收藏失败:", error)
    res.status(500).json({ success: false, message: "移除收藏失败" })
  }
})

module.exports = router
