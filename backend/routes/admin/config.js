const express = require("express")
const fs = require("fs")
const multer = require("multer")
const path = require("path")

const router = express.Router()
const { adminAuth } = require("../../middlewares/auth")
const { Config } = require("../../models")

const configUploadDir = path.join(__dirname, "..", "..", "uploads", "configs")
if (!fs.existsSync(configUploadDir)) {
  fs.mkdirSync(configUploadDir, { recursive: true })
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, configUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg"
    cb(null, `config_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`)
  }
})

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    if (allowed.includes(ext) || (file.mimetype && file.mimetype.startsWith("image/"))) {
      cb(null, true)
      return
    }
    cb(new Error("只允许上传图片文件"))
  }
})

// 获取所有配置
router.get("/", adminAuth, async (req, res) => {
  try {
    const configs = await Config.findAll()
    const configMap = {}
    configs.forEach((config) => {
      configMap[config.key] = config.value
    })
    res.json({ success: true, data: configMap })
  } catch (error) {
    console.error("获取配置失败:", error)
    res.status(500).json({ success: false, message: "获取配置失败" })
  }
})

router.post("/upload", adminAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "请选择图片文件" })
    }

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const fileUrl = `${baseUrl}/uploads/configs/${req.file.filename}`
    res.json({
      success: true,
      message: "上传成功",
      data: {
        url: fileUrl,
        path: `/uploads/configs/${req.file.filename}`,
        name: req.file.filename
      }
    })
  } catch (error) {
    console.error("上传配置图片失败:", error)
    res.status(500).json({ success: false, message: "上传配置图片失败" })
  }
})

// 获取单个配置
router.get("/:key", adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    const config = await Config.findOne({ where: { key } })
    res.json({ success: true, data: config ? config.value : null })
  } catch (error) {
    console.error("获取配置失败:", error)
    res.status(500).json({ success: false, message: "获取配置失败" })
  }
})

// 更新或创建配置
router.post("/", adminAuth, async (req, res) => {
  try {
    const { key, value, description } = req.body
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: "缺少必要参数" })
    }

    const [config, created] = await Config.findOrCreate({
      where: { key },
      defaults: {
        value,
        description
      }
    })

    if (!created) {
      await config.update({
        value,
        description
      })
    }

    res.json({ success: true, message: "保存成功" })
  } catch (error) {
    console.error("保存配置失败:", error)
    res.status(500).json({ success: false, message: "保存配置失败" })
  }
})

// 删除配置
router.delete("/:key", adminAuth, async (req, res) => {
  try {
    const { key } = req.params
    await Config.destroy({ where: { key } })
    res.json({ success: true, message: "删除成功" })
  } catch (error) {
    console.error("删除配置失败:", error)
    res.status(500).json({ success: false, message: "删除配置失败" })
  }
})

module.exports = router
