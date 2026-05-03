const express = require("express")
const fs = require("fs")
const multer = require("multer")
const path = require("path")
const { fn, col } = require("sequelize")
const { DataTypes } = require("sequelize")

const { adminAuth } = require("../../middlewares/auth")
const { Material, MaterialExchange } = require("../../models")

const router = express.Router()
let ensureMaterialSchemaPromise = null

const materialUploadDir = path.join(__dirname, "..", "..", "uploads", "materials")
if (!fs.existsSync(materialUploadDir)) {
  fs.mkdirSync(materialUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, materialUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ""
    cb(null, `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
})

const materialUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "preview_images", maxCount: 2 }
])

function normalizeUploadedFileName(fileName) {
  if (!fileName) {
    return ""
  }

  try {
    return Buffer.from(fileName, "latin1").toString("utf8")
  } catch (_error) {
    return fileName
  }
}

function normalizeUtf8Text(text) {
  if (!text || typeof text !== "string") {
    return text || ""
  }

  try {
    const decoded = Buffer.from(text, "latin1").toString("utf8")
    const encodedBack = Buffer.from(decoded, "utf8").toString("latin1")
    return encodedBack === text ? decoded : text
  } catch (_error) {
    return text
  }
}

function buildFileUrl(filename) {
  return `/uploads/materials/${filename}`
}

function getUploadedFiles(req, fieldName) {
  if (!req.files || !req.files[fieldName]) {
    return []
  }

  return Array.isArray(req.files[fieldName]) ? req.files[fieldName] : []
}

function getUploadedFile(req, fieldName) {
  return getUploadedFiles(req, fieldName)[0] || null
}

function removeUploadedFiles(files) {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }
  })
}

function cleanupRequestFiles(req) {
  removeUploadedFiles([
    ...getUploadedFiles(req, "file"),
    ...getUploadedFiles(req, "preview_images")
  ])
}

function parsePreviewImages(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch (_error) {
      return []
    }
  }

  return []
}

function normalizePreviewUrls(value) {
  return parsePreviewImages(value)
    .map((item) => {
      if (typeof item !== "string") {
        return ""
      }

      if (item.startsWith("http://") || item.startsWith("https://")) {
        try {
          return new URL(item).pathname
        } catch (_error) {
          return ""
        }
      }

      return item
    })
    .filter((item) => item.startsWith("/uploads/materials/"))
    .slice(0, 2)
}

function removeFilesByUrls(fileUrls) {
  const list = Array.isArray(fileUrls) ? fileUrls : [fileUrls]

  list.forEach((fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith("/uploads/materials/")) {
      return
    }

    const filePath = path.join(materialUploadDir, path.basename(fileUrl))
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  })
}

function formatMaterial(item, downloadCount = 0) {
  return {
    id: item.id,
    title: normalizeUtf8Text(item.title),
    description: normalizeUtf8Text(item.description || ""),
    file_name: normalizeUploadedFileName(item.file_name),
    file_url: item.file_url,
    file_size: Number(item.file_size) || 0,
    file_ext: item.file_ext || "",
    preview_images: parsePreviewImages(item.preview_images),
    sort_order: item.sort_order || 0,
    points_required: item.points_required || 0,
    download_count: Number(downloadCount) || 0,
    is_active: Boolean(item.is_active),
    create_time: item.create_time,
    update_time: item.update_time
  }
}

async function ensureMaterialSchema() {
  if (!ensureMaterialSchemaPromise) {
    ensureMaterialSchemaPromise = (async () => {
      const queryInterface = Material.sequelize.getQueryInterface()
      const table = await queryInterface.describeTable("materials")

      if (!table.preview_images) {
        await queryInterface.addColumn("materials", "preview_images", {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: "[]"
        })
      }
    })().catch((error) => {
      ensureMaterialSchemaPromise = null
      throw error
    })
  }

  return ensureMaterialSchemaPromise
}

router.get("/", adminAuth, async (_req, res) => {
  try {
    await ensureMaterialSchema()

    const [list, exchangeStats] = await Promise.all([
      Material.findAll({
        order: [
          ["sort_order", "ASC"],
          ["create_time", "DESC"]
        ]
      }),
      MaterialExchange.findAll({
        attributes: [
          "material_id",
          [fn("COUNT", col("id")), "download_count"]
        ],
        group: ["material_id"],
        raw: true
      })
    ])

    const downloadCountMap = new Map(
      exchangeStats.map((item) => [Number(item.material_id), Number(item.download_count) || 0])
    )

    res.json({
      success: true,
      data: list.map((item) => formatMaterial(item, downloadCountMap.get(item.id)))
    })
  } catch (error) {
    console.error("获取资料管理列表失败:", error)
    res.status(500).json({ success: false, message: "获取资料管理列表失败" })
  }
})

router.post("/", adminAuth, materialUpload, async (req, res) => {
  try {
    await ensureMaterialSchema()

    const { title, description = "", sort_order = 0, points_required = 0, is_active = "true" } = req.body
    const materialFile = getUploadedFile(req, "file")
    const previewFiles = getUploadedFiles(req, "preview_images")

    if (!title) {
      cleanupRequestFiles(req)
      return res.status(400).json({ success: false, message: "标题不能为空" })
    }

    if (!materialFile) {
      cleanupRequestFiles(req)
      return res.status(400).json({ success: false, message: "请上传资料文件" })
    }

    const material = await Material.create({
      title: normalizeUtf8Text(title),
      description: normalizeUtf8Text(description),
      file_name: normalizeUploadedFileName(materialFile.originalname),
      file_url: buildFileUrl(materialFile.filename),
      file_size: materialFile.size,
      file_ext: path.extname(materialFile.originalname).replace(".", "").toLowerCase(),
      preview_images: JSON.stringify(previewFiles.map((file) => buildFileUrl(file.filename)).slice(0, 2)),
      sort_order: Number(sort_order) || 0,
      points_required: Number(points_required) || 0,
      is_active: is_active === true || is_active === "true"
    })

    res.json({
      success: true,
      message: "资料创建成功",
      data: formatMaterial(material)
    })
  } catch (error) {
    cleanupRequestFiles(req)
    console.error("创建资料失败:", error)
    res.status(500).json({ success: false, message: "创建资料失败" })
  }
})

router.put("/:id", adminAuth, materialUpload, async (req, res) => {
  try {
    await ensureMaterialSchema()

    const material = await Material.findByPk(req.params.id)
    if (!material) {
      cleanupRequestFiles(req)
      return res.status(404).json({ success: false, message: "资料不存在" })
    }

    const materialFile = getUploadedFile(req, "file")
    const previewFiles = getUploadedFiles(req, "preview_images")
    const currentPreviewImages = parsePreviewImages(material.preview_images)
    let removedPreviewImages = []

    const nextData = {
      title: req.body.title ? normalizeUtf8Text(req.body.title) : material.title,
      description: req.body.description !== undefined ? normalizeUtf8Text(req.body.description) : material.description,
      sort_order: req.body.sort_order !== undefined ? (Number(req.body.sort_order) || 0) : material.sort_order,
      points_required: req.body.points_required !== undefined ? (Number(req.body.points_required) || 0) : material.points_required,
      is_active: req.body.is_active !== undefined
        ? (req.body.is_active === true || req.body.is_active === "true")
        : material.is_active
    }

    if (materialFile) {
      nextData.file_name = normalizeUploadedFileName(materialFile.originalname)
      nextData.file_url = buildFileUrl(materialFile.filename)
      nextData.file_size = materialFile.size
      nextData.file_ext = path.extname(materialFile.originalname).replace(".", "").toLowerCase()
    }

    if (req.body.existing_preview_urls !== undefined || previewFiles.length > 0) {
      const keptPreviewImages = normalizePreviewUrls(req.body.existing_preview_urls)
        .filter((url) => currentPreviewImages.includes(url))
      const uploadedPreviewImages = previewFiles
        .map((file) => buildFileUrl(file.filename))
        .slice(0, 2)
      const nextPreviewImages = [...keptPreviewImages, ...uploadedPreviewImages].slice(0, 2)

      removedPreviewImages = currentPreviewImages.filter((url) => !nextPreviewImages.includes(url))
      nextData.preview_images = JSON.stringify(nextPreviewImages)
    }

    const previousFileUrl = material.file_url
    await material.update(nextData)

    if (materialFile) {
      removeFilesByUrls(previousFileUrl)
    }
    if (removedPreviewImages.length > 0) {
      removeFilesByUrls(removedPreviewImages)
    }

    res.json({
      success: true,
      message: "资料更新成功",
      data: formatMaterial(material)
    })
  } catch (error) {
    cleanupRequestFiles(req)
    console.error("更新资料失败:", error)
    res.status(500).json({ success: false, message: "更新资料失败" })
  }
})

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await ensureMaterialSchema()

    const material = await Material.findByPk(req.params.id)
    if (!material) {
      return res.status(404).json({ success: false, message: "资料不存在" })
    }

    const previewImages = parsePreviewImages(material.preview_images)
    const fileUrls = [material.file_url, ...previewImages]

    await material.destroy()
    removeFilesByUrls(fileUrls)

    res.json({
      success: true,
      message: "资料删除成功"
    })
  } catch (error) {
    console.error("删除资料失败:", error)
    res.status(500).json({ success: false, message: "删除资料失败" })
  }
})

module.exports = router
