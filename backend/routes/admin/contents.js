const express = require("express")
const { Op } = require("sequelize")

const { adminAuth } = require("../../middlewares/auth")
const { ContentCollection, ContentItem, ContentDeleteLog } = require("../../models")

const router = express.Router()

function cloneContentJson(contentJson) {
  return contentJson && typeof contentJson === "object" && !Array.isArray(contentJson)
    ? { ...contentJson }
    : {}
}

function buildContentJsonWithSortOrder(contentJson, sortOrder) {
  const nextContentJson = cloneContentJson(contentJson)
  nextContentJson.sortOrder = sortOrder
  return nextContentJson
}

function buildResetSortUpdates(items, step = 100) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const nextSortOrder = (index + 1) * step
    return {
      id: item.id,
      sort_order: nextSortOrder,
      content_json: buildContentJsonWithSortOrder(item.content_json, nextSortOrder)
    }
  })
}

async function touchCollection(collectionId, transaction) {
  if (!collectionId) return

  const collection = await ContentCollection.findByPk(collectionId, { transaction })
  if (!collection) return

  await collection.update({
    version: (collection.version || 0) + 1,
    update_time: Date.now()
  }, { transaction })
}

async function logDeletedItems(collectionId, itemKeys, transaction) {
  const uniqKeys = [...new Set((itemKeys || []).map((item) => String(item || "").trim()).filter(Boolean))]
  if (!collectionId || uniqKeys.length === 0) return

  await ContentDeleteLog.bulkCreate(
    uniqKeys.map((itemKey) => ({
      collection_id: collectionId,
      item_key: itemKey,
      delete_time: Date.now()
    })),
    { transaction }
  )
}

function buildSearchText(item) {
  return [
    item.title,
    item.chapter,
    item.section,
    item.group_name,
    item.clause_num,
    JSON.stringify(item.content_json || {})
  ].filter(Boolean).join(" ")
}

function normalizeCollectionPayload(body) {
  return {
    key: String(body.key || "").trim(),
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    item_schema: body.item_schema || null,
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : true
  }
}

function normalizeItemPayload(body) {
  const contentJson = body.content_json && typeof body.content_json === "object"
    ? body.content_json
    : {}

  return {
    item_key: String(body.item_key || "").trim(),
    title: String(body.title || body.name || "").trim(),
    chapter: String(body.chapter || "").trim(),
    section: String(body.section || "").trim(),
    group_name: String(body.group_name || body.group || "").trim(),
    clause_num: String(body.clause_num || body.clauseNum || "").trim(),
    level: body.level === null || body.level === undefined || body.level === ""
      ? null
      : Number(body.level),
    textbook_order: body.textbook_order === null || body.textbook_order === undefined || body.textbook_order === ""
      ? (
        body.textbookOrder === null || body.textbookOrder === undefined || body.textbookOrder === ""
          ? null
          : Number(body.textbookOrder)
      )
      : Number(body.textbook_order),
    sort_order: (body.sort_order !== undefined && body.sort_order !== null && body.sort_order !== "")
      ? Number(body.sort_order)
      : ((body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== "")
          ? Number(body.sortOrder)
          : undefined),
    status: ["draft", "published", "archived"].includes(body.status) ? body.status : "published",
    content_json: contentJson
  }
}

function buildImportPayload(raw, index) {
  const source = raw && typeof raw === "object" ? raw : {}
  const payload = normalizeItemPayload({
    ...source,
    content_json: source.content_json && typeof source.content_json === "object"
      ? source.content_json
      : source
  })

  const generatedKey = payload.item_key || `item_${index + 1}`
  const generatedSortOrder = payload.sort_order !== undefined ? payload.sort_order : (index + 1) * 100

  // 同步生成的 key 和 sort_order 回 content_json
  if (payload.content_json) {
    payload.content_json.itemKey = generatedKey
    payload.content_json.sortOrder = generatedSortOrder
  }

  return {
    item_key: generatedKey,
    title: payload.title,
    chapter: payload.chapter,
    section: payload.section,
    group_name: payload.group_name,
    clause_num: payload.clause_num,
    level: payload.level,
    textbook_order: payload.textbook_order,
    sort_order: generatedSortOrder,
    status: payload.status,
    content_json: payload.content_json,
    search_text: buildSearchText(payload)
  }
}

router.use(adminAuth)

router.get("/collections", async (_req, res) => {
  try {
    const list = await ContentCollection.findAll({ order: [["id", "ASC"]] })
    res.json({ success: true, data: list })
  } catch (error) {
    console.error("Failed to get admin collections:", error)
    res.status(500).json({ success: false, message: "Failed to get admin collections" })
  }
})

router.post("/collections", async (req, res) => {
  try {
    const payload = normalizeCollectionPayload(req.body)

    if (!payload.key || !payload.name) {
      return res.status(400).json({ success: false, message: "key and name are required" })
    }

    const exists = await ContentCollection.findOne({ where: { key: payload.key } })
    if (exists) {
      return res.status(400).json({ success: false, message: "Collection key already exists" })
    }

    const item = await ContentCollection.create(payload)
    res.json({ success: true, data: item })
  } catch (error) {
    console.error("Failed to create collection:", error)
    res.status(500).json({ success: false, message: "Failed to create collection" })
  }
})

router.put("/collections/:id", async (req, res) => {
  try {
    const item = await ContentCollection.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const payload = normalizeCollectionPayload(req.body)

    if (payload.key && payload.key !== item.key) {
      const exists = await ContentCollection.findOne({
        where: {
          key: payload.key,
          id: { [Op.ne]: item.id }
        }
      })
      if (exists) {
        return res.status(400).json({ success: false, message: "Collection key already exists" })
      }
    }

    await item.update({
      key: payload.key || item.key,
      name: payload.name || item.name,
      description: req.body.description !== undefined ? payload.description : item.description,
      item_schema: req.body.item_schema !== undefined ? payload.item_schema : item.item_schema,
      is_active: req.body.is_active !== undefined ? payload.is_active : item.is_active
    })

    res.json({ success: true, data: item })
  } catch (error) {
    console.error("Failed to update collection:", error)
    res.status(500).json({ success: false, message: "Failed to update collection" })
  }
})

router.delete("/collections/:id", async (req, res) => {
  try {
    const item = await ContentCollection.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    await item.destroy()
    res.json({ success: true, message: "Deleted" })
  } catch (error) {
    console.error("Failed to delete collection:", error)
    res.status(500).json({ success: false, message: "Failed to delete collection" })
  }
})

router.post("/collections/:id/publish", async (req, res) => {
  try {
    const item = await ContentCollection.findByPk(req.params.id)
    if (!item) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    await item.update({
      version: (item.version || 0) + 1,
      last_published_at: Date.now()
    })

    res.json({ success: true, data: item })
  } catch (error) {
    console.error("Failed to publish collection:", error)
    res.status(500).json({ success: false, message: "Failed to publish collection" })
  }
})

router.get("/items", async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 20))
    const collectionId = Number.parseInt(req.query.collectionId, 10)
    const keyword = String(req.query.keyword || "").trim()
    const where = {}

    if (collectionId) {
      where.collection_id = collectionId
    }

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { chapter: { [Op.like]: `%${keyword}%` } },
        { section: { [Op.like]: `%${keyword}%` } },
        { search_text: { [Op.like]: `%${keyword}%` } }
      ]
    }

    const offset = (page - 1) * pageSize
    const [list, total] = await Promise.all([
      ContentItem.findAll({
        where,
        limit: pageSize,
        offset,
        order: [
          ["sort_order", "ASC"],
          ["textbook_order", "ASC"],
          ["id", "ASC"]
        ]
      }),
      ContentItem.count({ where })
    ])

    res.json({
      success: true,
      data: {
        list,
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    console.error("Failed to get admin items:", error)
    res.status(500).json({ success: false, message: "Failed to get admin items" })
  }
})

router.post("/items", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()

  try {
    const collectionId = Number.parseInt(req.body.collection_id, 10)
    if (!collectionId) {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "collection_id is required" })
    }

    const collection = await ContentCollection.findByPk(collectionId, { transaction })
    if (!collection) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const payload = normalizeItemPayload(req.body)
    if (!payload.title) {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "title is required" })
    }

    // item_key 去重：为空时自动生成，已存在时也自动生成新的唯一标识
    if (!payload.item_key) {
      const rand = Math.random().toString(36).substring(2, 6)
      payload.item_key = `auto_${Date.now()}_${rand}`
    } else {
      const existing = await ContentItem.findOne({
        where: { collection_id: collectionId, item_key: payload.item_key },
        attributes: ["id"],
        transaction
      })
      if (existing) {
        const rand = Math.random().toString(36).substring(2, 6)
        payload.item_key = `${payload.item_key}_${Date.now()}_${rand}`
      }
    }

    // 间隔整数法：不再需要调整其他条目的排序序号
    // 新条目使用前端计算的排序序号或默认值
    if (payload.sort_order === undefined) {
      payload.sort_order = 100
    }

    // 将最终决定好的标识和排序同步到 content_json 内，以免再次编辑时出错
    if (payload.content_json) {
      payload.content_json.itemKey = payload.item_key
      payload.content_json.sortOrder = payload.sort_order
    }

    const item = await ContentItem.create({
      collection_id: collectionId,
      ...payload,
      search_text: buildSearchText(payload)
    }, { transaction })

    await touchCollection(collectionId, transaction)
    await transaction.commit()

    res.json({ success: true, data: item })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to create item:", error)
    res.status(500).json({ success: false, message: "Failed to create item" })
  }
})

router.put("/items/:id", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()

  try {
    const item = await ContentItem.findByPk(req.params.id, { transaction })
    if (!item) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Item not found" })
    }

    const payload = normalizeItemPayload(req.body)
    const nextData = {
      item_key: req.body.item_key !== undefined ? payload.item_key : item.item_key,
      title: req.body.title !== undefined ? payload.title : item.title,
      chapter: req.body.chapter !== undefined ? payload.chapter : item.chapter,
      section: req.body.section !== undefined ? payload.section : item.section,
      group_name: req.body.group_name !== undefined ? payload.group_name : item.group_name,
      clause_num: req.body.clause_num !== undefined ? payload.clause_num : item.clause_num,
      level: req.body.level !== undefined ? payload.level : item.level,
      textbook_order: req.body.textbook_order !== undefined ? payload.textbook_order : item.textbook_order,
      sort_order: req.body.sort_order !== undefined ? payload.sort_order : item.sort_order,
      status: req.body.status !== undefined ? payload.status : item.status,
      content_json: req.body.content_json !== undefined ? payload.content_json : item.content_json
    }

    // 间隔整数法：不再需要调整其他条目的排序序号
    // 直接更新当前条目的排序序号

    // 同步到 content_json
    if (nextData.content_json) {
      nextData.content_json.itemKey = nextData.item_key
      if (nextData.sort_order !== undefined) {
        nextData.content_json.sortOrder = nextData.sort_order
      }
    }

    nextData.search_text = buildSearchText(nextData)
    const deleteKeys = []
    if (item.status === "published" && nextData.status !== "published") {
      deleteKeys.push(item.item_key)
    }
    if (item.item_key && nextData.item_key && item.item_key !== nextData.item_key) {
      deleteKeys.push(item.item_key)
    }

    await item.update(nextData, { transaction })
    await logDeletedItems(item.collection_id, deleteKeys, transaction)
    await touchCollection(item.collection_id, transaction)
    await transaction.commit()

    res.json({ success: true, data: item })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to update item:", error)
    res.status(500).json({ success: false, message: "Failed to update item" })
  }
})

// 获取最大排序序号
router.get("/items/max-sort-order", async (req, res) => {
  try {
    const collectionId = Number.parseInt(req.query.collectionId, 10)
    if (!collectionId) {
      return res.status(400).json({ success: false, message: "collectionId is required" })
    }
    
    const result = await ContentItem.findOne({
      where: { collection_id: collectionId },
      order: [["sort_order", "DESC"]],
      attributes: ["sort_order"]
    })
    
    res.json({ 
      success: true, 
      data: result ? result.sort_order : 0 
    })
  } catch (error) {
    console.error("Failed to get max sort order:", error)
    res.status(500).json({ success: false, message: "Failed to get max sort order" })
  }
})

// 批量删除API
router.delete("/items/batch", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()
  
  try {
    const idsParam = req.query.ids || ""
    const ids = idsParam.split(",").map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    
    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids is required" })
    }
    
    // 获取要删除的条目信息
    const items = await ContentItem.findAll({
      where: { id: { [Op.in]: ids } },
      transaction
    })
    
    const collectionId = items[0]?.collection_id
    const itemKeys = items.map(item => item.item_key)
    
    // 删除条目
    await ContentItem.destroy({
      where: { id: { [Op.in]: ids } },
      transaction
    })
    
    // 记录删除日志
    await logDeletedItems(collectionId, itemKeys, transaction)
    await touchCollection(collectionId, transaction)
    await transaction.commit()
    
    res.json({ success: true, message: "Batch deleted" })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to batch delete:", error)
    res.status(500).json({ success: false, message: "Failed to batch delete" })
  }
})

router.delete("/items/:id", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()

  try {
    const item = await ContentItem.findByPk(req.params.id, { transaction })
    if (!item) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Item not found" })
    }

    const collectionId = item.collection_id
    const itemKey = item.item_key
    const sortOrder = item.sort_order
    
    // 删除条目
    await item.destroy({ transaction })
    
    // 间隔整数法：不再需要调整其他条目的排序序号
    
    await logDeletedItems(collectionId, [itemKey], transaction)
    await touchCollection(collectionId, transaction)
    await transaction.commit()
    
    res.json({ success: true, message: "Deleted" })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to delete item:", error)
    res.status(500).json({ success: false, message: "Failed to delete item" })
  }
})

// 拖拽排序API
router.put("/items/:id/sort", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()
  
  try {
    const item = await ContentItem.findByPk(req.params.id, { transaction })
    if (!item) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Item not found" })
    }
    
    const { newSortOrder } = req.body
    if (newSortOrder === undefined) {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "newSortOrder is required" })
    }
    
    await item.update({
      sort_order: newSortOrder,
      content_json: buildContentJsonWithSortOrder(item.content_json, newSortOrder)
    }, { transaction })
    await touchCollection(item.collection_id, transaction)
    await transaction.commit()
    
    res.json({ success: true, data: item })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to update sort order:", error)
    res.status(500).json({ success: false, message: "Failed to update sort order" })
  }
})

router.post("/collections/:id/reset-sort-order", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()

  try {
    const collectionId = Number.parseInt(req.params.id, 10)
    if (!collectionId) {
      await transaction.rollback()
      return res.status(400).json({ success: false, message: "Collection id is required" })
    }

    const collection = await ContentCollection.findByPk(collectionId, { transaction })
    if (!collection) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const items = await ContentItem.findAll({
      where: { collection_id: collection.id },
      order: [
        ["sort_order", "ASC"],
        ["textbook_order", "ASC"],
        ["id", "ASC"]
      ],
      transaction
    })

    const updates = buildResetSortUpdates(items)

    for (const nextItem of updates) {
      await ContentItem.update(
        {
          sort_order: nextItem.sort_order,
          content_json: nextItem.content_json
        },
        {
          where: { id: nextItem.id },
          transaction
        }
      )
    }

    await touchCollection(collection.id, transaction)
    await transaction.commit()

    res.json({
      success: true,
      data: {
        collection_id: collection.id,
        updated_count: updates.length
      }
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to reset sort order:", error)
    res.status(500).json({ success: false, message: "Failed to reset sort order" })
  }
})

router.post("/collections/:id/import", async (req, res) => {
  const transaction = await ContentCollection.sequelize.transaction()

  try {
    const collection = await ContentCollection.findByPk(req.params.id, { transaction })
    if (!collection) {
      await transaction.rollback()
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const items = Array.isArray(req.body.items) ? req.body.items : []
    const existingItems = await ContentItem.findAll({
      where: { collection_id: collection.id },
      attributes: ["item_key"],
      transaction
    })
    const existingKeys = existingItems.map((item) => item.item_key)
    const nextRows = items.map((raw, index) => ({
      collection_id: collection.id,
      ...buildImportPayload(raw, index)
    }))
    const nextKeys = nextRows.map((item) => item.item_key)
    const deletedKeys = existingKeys.filter((itemKey) => !nextKeys.includes(itemKey))

    await ContentItem.destroy({
      where: { collection_id: collection.id },
      transaction
    })

    await logDeletedItems(collection.id, deletedKeys, transaction)

    if (nextRows.length > 0) {
      await ContentItem.bulkCreate(nextRows, { transaction })
    }

    await collection.update({
      version: (collection.version || 0) + 1,
      update_time: Date.now()
    }, { transaction })
    await transaction.commit()

    res.json({
      success: true,
      data: {
        collection_id: collection.id,
        imported_count: items.length
      }
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Failed to import items:", error)
    res.status(500).json({ success: false, message: "Failed to import items" })
  }
})

router.get("/collections/:id/export", async (req, res) => {
  try {
    const collectionId = Number.parseInt(req.params.id, 10)
    if (!collectionId) {
      return res.status(400).json({ success: false, message: "Collection id is required" })
    }

    const collection = await ContentCollection.findByPk(collectionId)
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const ids = String(req.query.ids || "")
      .split(",")
      .map(id => Number.parseInt(id, 10))
      .filter(id => !Number.isNaN(id))

    const where = { collection_id: collectionId }
    if (ids.length > 0) {
      where.id = { [Op.in]: ids }
    }

    const list = await ContentItem.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["textbook_order", "ASC"],
        ["id", "ASC"]
      ]
    })

    res.json({
      success: true,
      data: {
        collection,
        list
      }
    })
  } catch (error) {
    console.error("Failed to export items:", error)
    res.status(500).json({ success: false, message: "Failed to export items" })
  }
})

module.exports = router
