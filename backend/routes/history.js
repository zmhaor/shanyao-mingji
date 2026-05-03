const express = require("express")

const router = express.Router()
const { auth } = require("../middlewares/auth")
const { History, Tool } = require("../models")
const sequelize = require("../config/database")

// 获取历史记录
router.get("/", auth, async (req, res) => {
  try {
    const { id } = req.user

    const history = await History.findAll({
      where: { user_id: id },
      include: [{
        model: Tool,
        attributes: ["name", "description", "icon", "category"]
      }],
      order: [["create_time", "DESC"]]
    })

    const formattedHistory = history.map(item => ({
      id: item.id,
      toolId: item.tool_id,
      tool: {
        id: item.tool_id,
        name: item.Tool.name,
        description: item.Tool.description,
        icon: item.Tool.icon
      },
      duration: item.duration || 0,
      createdAt: new Date(item.create_time).toISOString()
    }))

    const studyTimeStats = await History.findAll({
      where: { user_id: id },
      attributes: [
        'tool_id',
        'tool_name',
        [sequelize.fn('COUNT', sequelize.col('History.id')), 'usage_count'],
        [sequelize.fn('SUM', sequelize.col('duration')), 'total_duration']
      ],
      group: ['tool_id', 'tool_name'],
      include: [{
        model: Tool,
        attributes: ["name", "description", "icon", "category", "usage_count"]
      }],
      order: [[sequelize.fn('SUM', sequelize.col('duration')), 'DESC']]
    })

    let totalStudyTime = 0
    const toolDetails = studyTimeStats.map(item => {
      const duration = parseInt(item.dataValues.total_duration) || 0
      totalStudyTime += duration
      return {
        toolId: item.tool_id,
        toolName: item.tool_name,
        usageCount: parseInt(item.dataValues.usage_count) || 0,
        totalDuration: duration,
        tool: {
          id: item.tool_id,
          name: item.Tool.name,
          description: item.Tool.description,
          icon: item.Tool.icon,
          category: item.Tool.category
        }
      }
    })

    res.json({
      success: true,
      message: "获取历史记录成功",
      data: {
        history: formattedHistory,
        studyTime: {
          totalStudyTime,
          toolDetails
        }
      }
    })
  } catch (error) {
    console.error("获取历史记录失败:", error)
    res.status(500).json({ success: false, message: "获取历史记录失败" })
  }
})

// 添加历史记录
router.post("/:toolId", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { toolId } = req.params

    // 检查工具是否存在
    const tool = await Tool.findByPk(toolId)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    // 添加历史记录
    await History.create({
      user_id: id,
      tool_id: toolId,
      tool_name: tool.name
    })

    // 更新工具使用次数
    tool.usage_count += 1
    await tool.save()

    res.json({ success: true, message: "添加历史记录成功" })
  } catch (error) {
    console.error("添加历史记录失败:", error)
    res.status(500).json({ success: false, message: "添加历史记录失败" })
  }
})

// 上报工具停留时长
router.put("/:toolId/duration", auth, async (req, res) => {
  try {
    const { id } = req.user
    const { toolId } = req.params
    const { duration } = req.body

    if (!duration || duration <= 0) {
      return res.status(400).json({ success: false, message: "无效的停留时长" })
    }

    // 更新最近一条该用户+工具的历史记录的停留时长（累加）
    const history = await History.findOne({
      where: { user_id: id, tool_id: toolId },
      order: [["create_time", "DESC"]]
    })

    if (!history) {
      return res.status(404).json({ success: false, message: "未找到历史记录" })
    }

    const newDuration = (history.duration || 0) + Math.round(duration)
    await history.update({ duration: newDuration })

    res.json({ success: true, message: "停留时长上报成功" })
  } catch (error) {
    console.error("上报停留时长失败:", error)
    res.status(500).json({ success: false, message: "上报停留时长失败" })
  }
})

// 清空历史记录
router.delete("/", auth, async (req, res) => {
  try {
    const { id } = req.user

    // 删除所有历史记录
    await History.destroy({ where: { user_id: id } })

    res.json({ success: true, message: "清空历史记录成功" })
  } catch (error) {
    console.error("清空历史记录失败:", error)
    res.status(500).json({ success: false, message: "清空历史记录失败" })
  }
})

module.exports = router
