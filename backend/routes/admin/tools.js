const express = require("express")

const router = express.Router()
const { adminAuth } = require("../../middlewares/auth")
const { Tool } = require("../../models")

// 获取所有工具（包括下架的）
router.get("/", adminAuth, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category } = req.query

    const where = {}

    if (category) {
      where.category = category
    }

    // 计算偏移量
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(pageSize)

    // 获取工具列表和总数
    const [tools, total] = await Promise.all([
      Tool.findAll({
        where,
        limit: Number.parseInt(pageSize),
        offset
      }),
      Tool.count({ where })
    ])

    // 格式化工具数据
    const formattedTools = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      icon: tool.icon,
      category: tool.category,
      usageCount: tool.usage_count || 0,
      status: tool.status,
      create_time: tool.create_time,
      update_time: tool.update_time
    }))

    res.json({
      success: true,
      message: "获取工具列表成功",
      data: {
        tools: formattedTools,
        total,
        page: Number.parseInt(page),
        pageSize: Number.parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error("获取工具列表失败:", error)
    res.status(500).json({ success: false, message: "获取工具列表失败" })
  }
})

// 初始化/同步默认工具
router.post("/init", adminAuth, async (req, res) => {
  try {
    const DEFAULT_TOOLS = [
      {
        name: "伤寒速速通",
        description: "提供伤寒背诵服务",
        icon: "/images/伤寒速速通.png",
        category: "学习助手",
        status: "active"
      },
      {
        name: "方剂轻松过",
        description: "提供方剂背诵服务",
        icon: "/images/方剂轻松过.png",
        category: "学习助手",
        status: "active"
      },
      {
        name: "内经随身背",
        description: "提供内经背诵服务",
        icon: "/images/内经随身背.png",
        category: "学习助手",
        status: "active"
      },
      {
        name: "中药快快记",
        description: "提供中药学背诵服务",
        icon: "/images/中药快快记.png",
        category: "学习助手",
        status: "active"
      },
      {
        name: "金匮简易考",
        description: "提供金匮要略背诵服务",
        icon: "/images/金匮简易考.png",
        category: "学习助手",
        status: "active"
      },
      {
        name: "温病掌上学",
        description: "提供温病学核心背诵服务",
        icon: "/images/温病掌上学.png",
        category: "学习助手",
        status: "active"
      }
    ]

    const results = []

    for (const defaultTool of DEFAULT_TOOLS) {
      // 检查工具是否已存在 (按名称)
      const existingTool = await Tool.findOne({ where: { name: defaultTool.name } })

      if (!existingTool) {
        // 创建新工具
        const newTool = await Tool.create(defaultTool)
        results.push({ name: defaultTool.name, action: "created" })
      } else {
        results.push({ name: defaultTool.name, action: "skipped" })
      }
    }

    res.json({
      success: true,
      message: "初始化完成",
      data: results
    })
  } catch (error) {
    console.error("初始化默认工具失败:", error)
    res.status(500).json({ success: false, message: "初始化默认工具失败" })
  }
})

// 添加工具（只需名称，其余字段可选）
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, description, icon, category, content, features, instructions, rating, favorites, status } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "工具名称不能为空" })
    }

    // 创建工具，未提供的字段使用模型默认值
    const createData = { name: name.trim() }
    if (description) createData.description = description
    if (icon) createData.icon = icon
    if (category) createData.category = category
    if (content) createData.content = content
    if (features) createData.features = features
    if (instructions) createData.instructions = instructions
    if (rating !== undefined) createData.rating = rating
    if (favorites !== undefined) createData.favorites = favorites
    if (status) createData.status = status

    const tool = await Tool.create(createData)

    res.json({
      success: true,
      message: "添加成功",
      data: tool
    })
  } catch (error) {
    console.error("添加工具失败:", error)
    res.status(500).json({ success: false, message: "添加工具失败" })
  }
})

// 更新工具
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, icon, category, content, features, instructions, rating, favorites, status } = req.body

    // 查找工具
    const tool = await Tool.findByPk(id)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    // 更新工具
    await tool.update({
      name,
      description,
      icon,
      category,
      content,
      features,
      instructions,
      rating,
      favorites,
      status
    })

    res.json({ success: true, message: "更新成功" })
  } catch (error) {
    console.error("更新工具失败:", error)
    res.status(500).json({ success: false, message: "更新工具失败" })
  }
})

// 删除工具
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    // 查找工具
    const tool = await Tool.findByPk(id)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    // 删除工具
    await tool.destroy()

    res.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除工具失败:", error)
    res.status(500).json({ success: false, message: "删除工具失败" })
  }
})

module.exports = router
