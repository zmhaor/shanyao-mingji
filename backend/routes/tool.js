const express = require("express")
const sequelize = require("../config/database")

const router = express.Router()
const { Op } = require("sequelize")
const { adminAuth } = require("../middlewares/auth")
const { Tool, Category } = require("../models")

// 创建categories表
router.post("/categories/init", adminAuth, async (req, res) => {
  try {
    // 手动创建categories表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        icon VARCHAR(50) NOT NULL DEFAULT '📁',
        \`order\` INT NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        create_time BIGINT NOT NULL,
        update_time BIGINT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)

    // 插入默认分类数据
    await sequelize.query(`
      INSERT IGNORE INTO categories (name, icon, \`order\`, status, create_time, update_time) VALUES
      ('学习助手', '📚', 1, 'active', ${Date.now()}, ${Date.now()}),
      ('效率工具', '⚡', 2, 'active', ${Date.now()}, ${Date.now()}),
      ('记忆训练', '🧠', 3, 'active', ${Date.now()}, ${Date.now()}),
      ('语言学习', '🌍', 4, 'active', ${Date.now()}, ${Date.now()}),
      ('考试备考', '📝', 5, 'active', ${Date.now()}, ${Date.now()});
    `)

    res.json({
      success: true,
      message: "分类表初始化成功"
    })
  } catch (error) {
    console.error("初始化分类表失败:", error)
    res.status(500).json({ success: false, message: "初始化分类表失败" })
  }
})

// 获取分类列表
router.get("/categories", async (req, res) => {
  try {
    console.log("开始获取分类列表")
    const categories = await Category.findAll({
      where: {
        status: "active"
      },
      order: [
        ["order", "ASC"],
        ["id", "ASC"]
      ]
    })

    console.log("分类列表查询结果:", categories)

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      order: category.order
    }))

    console.log("格式化后的分类列表:", formattedCategories)

    res.json({
      success: true,
      message: "获取分类列表成功",
      data: {
        categories: formattedCategories
      }
    })
  } catch (error) {
    console.error("获取分类列表失败:", error)
    res.status(500).json({ success: false, message: "获取分类列表失败" })
  }
})

// 获取工具列表
router.get("/", async (req, res) => {
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
      status: tool.status
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

// 获取工具详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const tool = await Tool.findByPk(id)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    res.json({
      success: true,
      message: "获取工具详情成功",
      data: {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        icon: tool.icon,
        category: tool.category,
        content: tool.content,
        usageCount: tool.usage_count || 0,
        rating: tool.rating || 0,
        favorites: tool.favorites || 0,
        features: tool.features || [],
        instructions: tool.instructions || '',
        status: tool.status
      }
    })
  } catch (error) {
    console.error("获取工具详情失败:", error)
    res.status(500).json({ success: false, message: "获取工具详情失败" })
  }
})

// 更新工具状态
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: "无效的状态值，必须是 active 或 inactive" })
    }

    const tool = await Tool.findByPk(id)
    if (!tool) {
      return res.status(404).json({ success: false, message: "工具不存在" })
    }

    await tool.update({ status })

    res.json({
      success: true,
      message: "工具状态更新成功",
      data: {
        id: tool.id,
        status: tool.status,
        update_time: tool.update_time
      }
    })
  } catch (error) {
    console.error("更新工具状态失败:", error)
    res.status(500).json({ success: false, message: "更新工具状态失败" })
  }
})

// 初始化工具数据
router.post("/init", adminAuth, async (req, res) => {
  try {
    // 检查是否已有工具数据
    const existingCount = await Tool.count()
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: "工具数据已存在，无需初始化"
      })
    }

    // 初始化工具数据
    const tools = await Tool.bulkCreate([
      // 保持数组为空或根据需要填充其他数据
    ])

    res.json({
      success: true,
      message: "工具数据初始化成功",
      data: {
        count: tools.length
      }
    })
  } catch (error) {
    console.error("初始化工具数据失败:", error)
    res.status(500).json({ success: false, message: "初始化工具数据失败" })
  }
})

module.exports = router
