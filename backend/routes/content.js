const express = require("express")
const { Op } = require("sequelize")

const { ContentCollection, ContentItem, ContentDeleteLog } = require("../models")

const router = express.Router()

function formatCollection(collection) {
  return {
    id: collection.id,
    key: collection.key,
    name: collection.name,
    description: collection.description,
    version: collection.version,
    is_active: Boolean(collection.is_active),
    last_published_at: collection.last_published_at,
    create_time: collection.create_time,
    update_time: collection.update_time
  }
}

function formatItem(item) {
  return {
    id: item.id,
    collection_id: item.collection_id,
    item_key: item.item_key,
    title: item.title,
    chapter: item.chapter,
    section: item.section,
    group_name: item.group_name,
    level: item.level,
    clause_num: item.clause_num,
    textbook_order: item.textbook_order,
    sort_order: item.sort_order,
    status: item.status,
    content_json: item.content_json,
    update_time: item.update_time
  }
}

function getCollectionSyncTime(collection) {
  return Number(collection?.last_published_at || collection?.update_time || collection?.create_time || 0)
}

router.get("/collections", async (_req, res) => {
  try {
    const collections = await ContentCollection.findAll({
      where: { is_active: true },
      order: [["id", "ASC"]]
    })

    res.json({
      success: true,
      data: collections.map(formatCollection)
    })
  } catch (error) {
    console.error("Failed to get collections:", error)
    res.status(500).json({ success: false, message: "Failed to get collections" })
  }
})

router.get("/collections/:key/items", async (req, res) => {
  try {
    const { key } = req.params
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const pageSize = Math.min(200, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 50))
    const keyword = (req.query.keyword || "").trim()

    const collection = await ContentCollection.findOne({
      where: { key, is_active: true }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const where = {
      collection_id: collection.id,
      status: "published"
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
        collection: formatCollection(collection),
        list: list.map(formatItem),
        total,
        page,
        pageSize
      }
    })
  } catch (error) {
    console.error("Failed to get items:", error)
    res.status(500).json({ success: false, message: "Failed to get items" })
  }
})

router.get("/collections/:key/full", async (req, res) => {
  try {
    const { key } = req.params
    const version = Number.parseInt(req.query.version, 10) || 0

    const collection = await ContentCollection.findOne({
      where: { key, is_active: true }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    if (version && version === collection.version) {
      return res.json({
        success: true,
        data: {
          collection: formatCollection(collection),
          unchanged: true,
          list: []
        }
      })
    }

    const list = await ContentItem.findAll({
      where: {
        collection_id: collection.id,
        status: "published"
      },
      order: [
        ["sort_order", "ASC"],
        ["textbook_order", "ASC"],
        ["id", "ASC"]
      ]
    })

    res.json({
      success: true,
      data: {
        collection: formatCollection(collection),
        unchanged: false,
        list: list.map(formatItem)
      }
    })
  } catch (error) {
    console.error("Failed to get full data:", error)
    res.status(500).json({ success: false, message: "Failed to get full data" })
  }
})

router.get("/collections/:key/meta", async (req, res) => {
  try {
    const { key } = req.params

    const collection = await ContentCollection.findOne({
      where: { key, is_active: true }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    res.json({
      success: true,
      data: {
        collection: formatCollection(collection),
        sync_time: getCollectionSyncTime(collection)
      }
    })
  } catch (error) {
    console.error("Failed to get content meta:", error)
    res.status(500).json({ success: false, message: "Failed to get content meta" })
  }
})

router.get("/collections/:key/delta", async (req, res) => {
  try {
    const { key } = req.params
    const since = Math.max(0, Number.parseInt(req.query.since, 10) || 0)

    const collection = await ContentCollection.findOne({
      where: { key, is_active: true }
    })

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    const where = {
      collection_id: collection.id,
      status: "published"
    }

    // 对于温病工具，总是返回所有数据，确保同步完整
    if (key !== 'wenbing' && since > 0) {
      where.update_time = { [Op.gt]: since }
    }

    const [upserts, deleteLogs] = await Promise.all([
      ContentItem.findAll({
        where,
        order: [
          ["sort_order", "ASC"],
          ["textbook_order", "ASC"],
          ["id", "ASC"]
        ]
      }),
      ContentDeleteLog.findAll({
        where: {
          collection_id: collection.id,
          ...(key !== 'wenbing' && since > 0 ? { delete_time: { [Op.gt]: since } } : {})
        },
        order: [["delete_time", "ASC"], ["id", "ASC"]]
      })
    ])

    res.json({
      success: true,
      data: {
        collection: formatCollection(collection),
        sync_time: getCollectionSyncTime(collection),
        upserts: upserts.map(formatItem),
        deletes: deleteLogs.map((item) => ({
          item_key: item.item_key,
          delete_time: item.delete_time
        }))
      }
    })
  } catch (error) {
    console.error("Failed to get content delta:", error)
    res.status(500).json({ success: false, message: "Failed to get content delta" })
  }
})

router.get("/search", async (req, res) => {
  try {
    const keyword = (req.query.q || "").trim()
    const collectionKey = (req.query.collectionKey || "").trim()
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))

    if (!keyword) {
      return res.status(400).json({ success: false, message: "Query is required" })
    }

    const collectionWhere = { is_active: true }
    if (collectionKey) {
      collectionWhere.key = collectionKey
    }

    const collections = await ContentCollection.findAll({
      where: collectionWhere,
      attributes: ["id", "key", "name"]
    })

    if (collections.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const collectionMap = new Map(collections.map((item) => [item.id, item]))
    const list = await ContentItem.findAll({
      where: {
        collection_id: { [Op.in]: collections.map((item) => item.id) },
        status: "published",
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { chapter: { [Op.like]: `%${keyword}%` } },
          { section: { [Op.like]: `%${keyword}%` } },
          { search_text: { [Op.like]: `%${keyword}%` } }
        ]
      },
      limit,
      order: [
        ["sort_order", "ASC"],
        ["textbook_order", "ASC"],
        ["id", "ASC"]
      ]
    })

    res.json({
      success: true,
      data: list.map((item) => ({
        ...formatItem(item),
        collection: collectionMap.get(item.collection_id) || null
      }))
    })
  } catch (error) {
    console.error("Failed to search items:", error)
    res.status(500).json({ success: false, message: "Failed to search items" })
  }
})

module.exports = router
