const express = require("express")

const router = express.Router()
const { adminAuth } = require("../../middlewares/auth")
const { Category } = require("../../models")

// 鍒嗙被绠＄悊鎺ュ彛浠呭厑璁哥鐞嗗憳璁块棶
router.use(adminAuth)

// 获取分类列表
router.get("", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [
        ["order", "ASC"],
        ["id", "ASC"]
      ]
    })
    res.json({
      success: true,
      message: "获取分类列表成功",
      data: {
        categories: categories.map(category => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          order: category.order,
          status: category.status,
          createTime: category.create_time,
          updateTime: category.update_time
        }))
      }
    })
  } catch (error) {
    console.error("获取分类列表失败:", error)
    res.status(500).json({ success: false, message: "获取分类列表失败" })
  }
})

// 获取单个分类
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ success: false, message: "分类不存在" })
    }
    res.json({
      success: true,
      message: "获取分类成功",
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        order: category.order,
        status: category.status,
        createTime: category.create_time,
        updateTime: category.update_time
      }
    })
  } catch (error) {
    console.error("获取分类失败:", error)
    res.status(500).json({ success: false, message: "获取分类失败" })
  }
})

// 创建分类
router.post("", async (req, res) => {
  try {
    const { name, icon, order, status } = req.body
    
    if (!name) {
      return res.status(400).json({ success: false, message: "分类名称不能为空" })
    }
    
    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ where: { name } })
    if (existingCategory) {
      return res.status(400).json({ success: false, message: "分类名称已存在" })
    }
    
    const category = await Category.create({
      name,
      icon: icon || "📁",
      order: order || 0,
      status: status || "active"
    })
    
    res.json({
      success: true,
      message: "创建分类成功",
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        order: category.order,
        status: category.status,
        createTime: category.create_time,
        updateTime: category.update_time
      }
    })
  } catch (error) {
    console.error("创建分类失败:", error)
    res.status(500).json({ success: false, message: "创建分类失败" })
  }
})

// 更新分类
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon, order, status } = req.body
    
    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ success: false, message: "分类不存在" })
    }
    
    // 检查分类名称是否已存在（排除当前分类）
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } })
      if (existingCategory) {
        return res.status(400).json({ success: false, message: "分类名称已存在" })
      }
    }
    
    await category.update({
      name: name || category.name,
      icon: icon || category.icon,
      order: order !== undefined ? order : category.order,
      status: status || category.status
    })
    
    res.json({
      success: true,
      message: "更新分类成功",
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        order: category.order,
        status: category.status,
        createTime: category.create_time,
        updateTime: category.update_time
      }
    })
  } catch (error) {
    console.error("更新分类失败:", error)
    res.status(500).json({ success: false, message: "更新分类失败" })
  }
})

// 删除分类
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    
    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ success: false, message: "分类不存在" })
    }
    
    await category.destroy()
    
    res.json({ success: true, message: "删除分类成功" })
  } catch (error) {
    console.error("删除分类失败:", error)
    res.status(500).json({ success: false, message: "删除分类失败" })
  }
})

module.exports = router
