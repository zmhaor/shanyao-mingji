const express = require("express")
const { DataTypes } = require("sequelize")
const { auth } = require("../middlewares/auth")
const { Material, MaterialExchange, User } = require("../models")

const router = express.Router()
let ensureMaterialSchemaPromise = null

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

function parsePreviewImages(value) {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch (_error) {
    return []
  }
}

function formatMaterial(item, exchangedMaterialIds = new Set()) {
  const previewImages = parsePreviewImages(item.preview_images)

  return {
    id: item.id,
    title: normalizeUtf8Text(item.title),
    description: normalizeUtf8Text(item.description || ""),
    fileName: item.file_name,
    fileUrl: item.file_url,
    fileSize: Number(item.file_size) || 0,
    fileExt: item.file_ext || "",
    previewImages,
    sortOrder: item.sort_order || 0,
    pointsRequired: item.points_required || 0,
    hasExchanged: exchangedMaterialIds.has(item.id),
    isActive: Boolean(item.is_active),
    createTime: item.create_time,
    updateTime: item.update_time
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

router.get("/", auth, async (req, res) => {
  try {
    await ensureMaterialSchema()

    const userId = req.user.id
    const [materials, user, exchanges] = await Promise.all([
      Material.findAll({
        where: { is_active: true },
        order: [
          ["sort_order", "ASC"],
          ["create_time", "DESC"]
        ]
      }),
      User.findByPk(userId),
      MaterialExchange.findAll({
        where: { user_id: userId }
      })
    ])

    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    const exchangedMaterialIds = new Set(exchanges.map(item => item.material_id))

    res.json({
      success: true,
      data: {
        userPoints: user.points,
        materials: materials.map(item => formatMaterial(item, exchangedMaterialIds))
      }
    })
  } catch (error) {
    console.error("获取资料列表失败:", error)
    res.status(500).json({ success: false, message: "获取资料列表失败" })
  }
})

router.post("/:id/exchange", auth, async (req, res) => {
  try {
    await ensureMaterialSchema()

    const userId = req.user.id
    const materialId = Number(req.params.id)

    const [user, material, existing] = await Promise.all([
      User.findByPk(userId),
      Material.findByPk(materialId),
      MaterialExchange.findOne({ where: { user_id: userId, material_id: materialId } })
    ])

    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" })
    }

    if (!material || !material.is_active) {
      return res.status(404).json({ success: false, message: "资料不存在或已下架" })
    }

    if (existing) {
      return res.json({
        success: true,
        message: "资料已兑换",
        data: {
          materialId,
          remainingPoints: user.points,
          hasExchanged: true
        }
      })
    }

    const cost = Number(material.points_required) || 0
    if (user.points < cost) {
      return res.status(400).json({ success: false, message: "积分不足" })
    }

    user.points -= cost
    await user.save()

    await MaterialExchange.create({
      user_id: userId,
      material_id: materialId,
      points: cost
    })

    res.json({
      success: true,
      message: "兑换成功",
      data: {
        materialId,
        remainingPoints: user.points,
        hasExchanged: true
      }
    })
  } catch (error) {
    console.error("兑换资料失败:", error)
    res.status(500).json({ success: false, message: "兑换资料失败" })
  }
})

module.exports = router
